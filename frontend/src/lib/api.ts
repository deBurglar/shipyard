import axios from 'axios'

export interface HealthResponse {
  status: string
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 5000,
})

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/actuator/health', { signal })
  return data
}
