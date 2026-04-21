import i18n from '@/i18n/config'

export const fieldErrors = {
  firstName: {
    get required() {
      return i18n.t('firstName.required', { ns: 'validation' })
    },
    get tooShort() {
      return i18n.t('firstName.tooShort', { ns: 'validation' })
    },
    get tooLong() {
      return i18n.t('firstName.tooLong', { ns: 'validation' })
    },
  },

  lastName: {
    get required() {
      return i18n.t('lastName.required', { ns: 'validation' })
    },
    get tooShort() {
      return i18n.t('lastName.tooShort', { ns: 'validation' })
    },
    get tooLong() {
      return i18n.t('lastName.tooLong', { ns: 'validation' })
    },
  },

  email: {
    get required() {
      return i18n.t('email.required', { ns: 'validation' })
    },
    get invalid() {
      return i18n.t('email.invalid', { ns: 'validation' })
    },
  },

  password: {
    get required() {
      return i18n.t('password.required', { ns: 'validation' })
    },
    get tooShort() {
      return i18n.t('password.tooShort', { ns: 'validation' })
    },
    get uppercase() {
      return i18n.t('password.uppercase', { ns: 'validation' })
    },
    get lowercase() {
      return i18n.t('password.lowercase', { ns: 'validation' })
    },
    get number() {
      return i18n.t('password.number', { ns: 'validation' })
    },
  },

  confirmPassword: {
    get required() {
      return i18n.t('confirmPassword.required', { ns: 'validation' })
    },
    get mismatch() {
      return i18n.t('confirmPassword.mismatch', { ns: 'validation' })
    },
  },
} as const

export default fieldErrors
