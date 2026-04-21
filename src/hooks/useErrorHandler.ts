import { useTranslation } from 'react-i18next'
import { useToast } from '../components/ui/toast'

interface AxiosErrorResponse {
  message?: string
  code?: string
  errors?: Record<string, string[]>
}

export function useErrorHandler(namespace: 'auth' | 'home' | 'notFound' | 'common' = 'common') {
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleAxiosError = (error: unknown) => {
    console.error('Axios error:', error)

    // Valida se é erro axios
    if (!error || typeof error !== 'object' || !('response' in error)) {
      toast({
        title: t('error', { ns: 'common' }),
        description: t('error', { ns: 'common' }),
        variant: 'destructive',
      })
      return
    }

    const axiosError = error as {
      response?: {
        data?: AxiosErrorResponse
        status?: number
      }
    }

    // Valida se tem resposta com dados
    if (!axiosError.response?.data) {
      toast({
        title: t('error', { ns: 'common' }),
        description: t('error', { ns: 'common' }),
        variant: 'destructive',
      })
      return
    }

    const data = axiosError.response.data
    const errorCode = data.code || 'GENERIC'
    const status = axiosError.response.status

    // Tenta traduzir pelo código de erro no namespace específico
    // Fallback para common se não encontrar no namespace específico
    let errorMessage = t(`errors.${errorCode}`, {
      ns: namespace,
      defaultValue: undefined,
    })

    // Se não encontrou no namespace específico, tenta no common
    if (errorMessage === `errors.${errorCode}`) {
      errorMessage = t(`error`, { ns: 'common' })
    }

    // Se tiver mensagem customizada do backend, usa ela
    if (data.message) {
      errorMessage = data.message
    }

    // Erros de validação com múltiplos campos
    if (data.errors && Object.keys(data.errors).length > 0) {
      const firstError = Object.values(data.errors)[0]?.[0]
      if (firstError) {
        errorMessage = firstError
      }
    }

    // Mostra toast baseado no status HTTP
    toast({
      title: t('error', { ns: 'common' }),
      description: errorMessage,
      variant: 'destructive',
    })

    return data
  }

  return { handleAxiosError }
}
