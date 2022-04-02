import { ElLoading } from 'element-plus'

import type { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  app.use(ElLoading)
}
