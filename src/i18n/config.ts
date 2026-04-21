import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import commonFr from '../locales/fr/common.json'
import homeFr from '../locales/fr/home.json'
import authFr from '../locales/fr/auth.json'
import notFoundFr from '../locales/fr/notFound.json'
import validationFr from '../locales/fr/validation.json'
import commonEn from '../locales/en/common.json'
import homeEn from '../locales/en/home.json'
import authEn from '../locales/en/auth.json'
import notFoundEn from '../locales/en/notFound.json'
import validationEn from '../locales/en/validation.json'

const resources = {
  fr: {
    common: commonFr,
    home: homeFr,
    auth: authFr,
    notFound: notFoundFr,
    validation: validationFr,
  },
  en: {
    common: commonEn,
    home: homeEn,
    auth: authEn,
    notFound: notFoundEn,
    validation: validationEn,
  },
} as const

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: ['common', 'home', 'auth', 'notFound', 'validation'],
    supportedLngs: ['fr', 'en'],
    interpolation: {
      escapeValue: false,
    },
  })

export default i18next
