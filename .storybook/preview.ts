import '~/main-lib'
import * as i18n from '~/modules/i18n'
import * as directives from '~/modules/directive'

import { app } from '@storybook/vue3'
const ctx = { app }
i18n.install(ctx)
directives.install(ctx)

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
