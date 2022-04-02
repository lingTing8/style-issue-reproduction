nodeImage = "node:16.14-alpine"
# owners = ["zhuxiaomin", "zhaoweijie", "lifang"]

def main(ctx):
    conf = [pipeline(ctx)]
    conf.extend(secrets())
    return conf

def pipeline(ctx):
    return {
        "kind": "pipeline",
        "name": "default",
        "type": "kubernetes",
        "trigger": {
            "branch": {"exclude": ["temp/*"]},
            # `custom` for triggering builds from UI
            "event": ["custom", "push", "pull_request"],
        },
        "metadata": {
            "annotations": {"drone.internetapi.cn/repo": ctx.repo.slug},
        },
        "clone": {"disable": True},
        "steps": steps(ctx),
        # Speed up using K8s internal network
        "host_aliases": [{
            # ClusterIP of K8s Traefik ingress controller
            "ip": "192.168.94.168",
            "hostnames": [
                "npm.internetapi.cn",
                "harbor.internetapi.cn",
            ],
        }],
        "volumes": [{
            "name": "build-env-data",
            "claim": {
                "name": "build-env-data",
                "read_only": False,
            },
        }],
    }

def steps(ctx):
    cacheVolume = {
        "name": "build-env-data",
        "path": "/env",
    }

    # Retry `pnpm i` at most 3 times for possible network timeout
    cmdPnpmInstallRetry3 = "for i in $(seq 1 3); do [ $i -gt 1 ] && sleep 15; pnpm i && s=0 && break || s=$?; done; (exit $s)"

    return [{
        "name": "clone",
        "image": "alpine/git",
        "environment": {
            "SSH_KEY": {"from_secret": "giteaSshPrivKey"},
        },
        "commands": [
            "mkdir ~/.ssh",
            "echo $SSH_KEY > ~/.ssh/id_ed25519",
            r"sed -i 's/\\\\n/\\n/g' ~/.ssh/id_ed25519",
            "chmod 600 ~/.ssh/id_ed25519",
            "echo 'Host gitea.internetapi.cn\n  Hostname gitea-ssh.gitea\n' >> ~/.ssh/config",
            "ssh-keyscan -H gitea-ssh.gitea >> ~/.ssh/known_hosts",
            "git clone %s ." % ctx.repo.git_ssh_url,
            "git checkout $DRONE_COMMIT",
            "git submodule update --init --recursive",
        ],
    }, {
        "name": "install",
        "depends_on": ["clone"],
        "image": nodeImage,
        "volumes": [cacheVolume],
        "commands": [
            # Set credentials for `npm.internetapi.cn`
            "echo $NPMRC > ~/.npmrc",
            r"sed -i 's/\\\\n/\\n/g' ~/.npmrc",
            # Remove this when pnpm 7 is published
            # Workaround for `prepare` script not run when `pnpm i` run
            "npm i -g pnpm@next-7",
            # Read and store downloaded packages from cache volume
            "pnpm config set store-dir /env/cache/.pnpm-store",
            # Install deps
            cmdPnpmInstallRetry3,
        ],
    }, {
        "name": "lint",
        "depends_on": ["install"],
        "image": nodeImage,
        "commands": ["npm run lint"],
    }, {
        "name": "build",
        "depends_on": ["install"],
        "image": nodeImage,
        "commands": ["npm run build"],
    }, {
        "name": "build-storybook",
        "depends_on": ["install"],
        "image": nodeImage,
        "commands": ["npm run build-storybook"],
    }, {
        "name": "chromatic",
        "depends_on": ["install"],
        "when": {
            "branch": "master",
        },
        "image": nodeImage,
        "environment": {
            "CHROMATIC_TOKEN": {"from_secret": "chromaticToken"},
        },
        "commands": [
            # Chromatic requires Git
            "sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories",
            "apk add git",
            "npx chromatic --exit-zero-on-changes --project-token $CHROMATIC_TOKEN",
        ],
    }, {
        "name": "notify",
        "depends_on": ["lint", "build", "build-storybook"],
        "when": {
            "status": [
                # "success",
                "failure",
            ],
        },
        "image": "plugins/slack",
        # "environment": {"WEBHOOK": {"from_secret": "zulipWebhook"}},
        "settings": {
            "webhook": {"from_secret": "zulipWebhook"},
            "channel": "Drone",  # Will become Zulip topic
            "template": notifyZulipTmpl(ctx),
        },
    }]

def notifyZulipTmpl(ctx):
    author = ctx.build.author_name if ctx.build.author_name else ctx.build.sender
    tmplBuildLink = "<{{build.link}}|{{repo.owner}}/{{repo.name}}#{{build.number}}>"
    tmplPr = "{{#if build.pull}}<%s/pulls/{{build.pull}}|PR#{{build.pull}}>, {{/if}}" % ctx.repo.link
    tmplCommitBranchAuthor = "commit <%s/commit/{{build.commit}}|#{{truncate build.commit 8}}> on branch <%s/src/branch/{{build.branch}}|{{build.branch}}> by %s" % (ctx.repo.link, ctx.repo.link, author)
    # tmplMentions = ""
    # for o in owners:
    #     tmplMentions += "@*%s* " % o

    # {{#success build.status}} is not reliable, sometimes build fails but evaluates to `true`
    #     tmpl = """
    #         {{#success build.status}}
    #         :check: *Success:* build %s
    # %s%s
    #         {{else}}
    #         {{/success}}
    # Currently only notify when build fails
    tmpl = """
        :cross_mark: *Failure:* build %s *Please fix soon!* @*%s*
%s%s
    """ % (
        # success
        # tmplBuildLink,
        # tmplPr,
        # tmplCommitBranchAuthor,
        # failure
        tmplBuildLink,
        author,
        tmplPr,
        tmplCommitBranchAuthor,
    )
    return tmpl

def secrets():
    return [{
        "kind": "secret",
        "name": "giteaSshPrivKey",
        "get": {
            "path": "global-env",
            "name": "giteaSshPrivKey",
        },
    }, {
        "kind": "secret",
        "name": "npmrc",
        "get": {
            "path": "global-env",
            "name": "npmrc",
        },
    }, {
        "kind": "secret",
        "name": "chromaticToken",
        "get": {
            "path": "global-env",
            "name": "chromaticToken",
        },
    }, {
        "kind": "secret",
        "name": "zulipWebhook",
        "get": {
            "path": "global-env",
            "name": "zulipWebhookFrontend",
        },
    }]
