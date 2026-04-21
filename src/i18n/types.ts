import type commonFr from '../locales/fr/common.json'
import type homeFr from '../locales/fr/home.json'
import type authFr from '../locales/fr/auth.json'
import type notFoundFr from '../locales/fr/notFound.json'
import type validationFr from '../locales/fr/validation.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof commonFr
      home: typeof homeFr
      auth: typeof authFr
      notFound: typeof notFoundFr
      validation: typeof validationFr
    }
  }
}
