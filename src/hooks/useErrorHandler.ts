import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface AxiosErrorResponse {
  message?: string
  code?: string
  errors?: Record<string, string[]>
}

export function useErrorHandler(namespace: 'auth' | 'home' | 'notFound' | 'common' = 'common') {
  const { t } = useTranslation()

  const handleAxiosError = (error: unknown) => {
    if (!error || typeof error !== 'object' || !('response' in error)) {
      toast.error(t('error', { ns: 'common' }))
      return
    }

    const axiosError = error as {
      response?: {
        data?: AxiosErrorResponse
        status?: number
      }
    }

    if (!axiosError.response?.data) {
      toast.error(t('error', { ns: 'common' }))
      return
    }

    const data = axiosError.response.data
    const errorCode = data.code || 'GENERIC'

    const translationKey = `errors.${errorCode}` as const
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let errorMessage = t(translationKey as any, { ns: namespace })

    if (errorMessage === translationKey) {
      errorMessage = t('error', { ns: 'common' })
    }

    if (data.message) {
      errorMessage = data.message
    }

    if (data.errors && Object.keys(data.errors).length > 0) {
      const firstError = Object.values(data.errors)[0]?.[0]
      if (firstError) {
        errorMessage = firstError
      }
    }

    toast.error(errorMessage)

    return data
  }

  return { handleAxiosError }
}
