import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8080',
})

// Attach JWT token to every request
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401/403 globally
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client