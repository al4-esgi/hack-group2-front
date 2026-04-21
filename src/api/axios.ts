import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'
import { resetToLogin } from '../navigation/navigation.service'

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearToken()
      resetToLogin()
    }
    return Promise.reject(error)
  },
)

export default apiClient
