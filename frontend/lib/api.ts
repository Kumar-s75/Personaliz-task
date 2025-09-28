import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error("API Response Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export const apiService = {
  // Actor endpoints
  async getActors() {
    const response = await api.get("/actors")
    return response.data
  },

  async getActor(id: string) {
    const response = await api.get(`/actors/${id}`)
    return response.data
  },

  // Video generation endpoints
  async generateVideo(data: {
    userName: string
    userCity: string
    userPhone: string
    actorId: string
  }) {
    const response = await api.post("/video/generate", data)
    return response.data
  },

  async getVideoStatus(requestId: string) {
    const response = await api.get(`/video/status/${requestId}`)
    return response.data
  },

  // WhatsApp endpoints
  async sendVideo(data: {
    phoneNumber: string
    videoUrl: string
    caption?: string
  }) {
    const response = await api.post("/whatsapp/send-video", data)
    return response.data
  },

  async sendTextMessage(data: {
    phoneNumber: string
    message: string
  }) {
    const response = await api.post("/whatsapp/send-text", data)
    return response.data
  },

  // Admin endpoints
  async getAdminRequests(params?: {
    page?: number
    limit?: number
    status?: string
    deliveryStatus?: string
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }) {
    const response = await api.get("/admin/requests", { params })
    return response.data
  },

  async getAdminRequest(id: string) {
    const response = await api.get(`/admin/requests/${id}`)
    return response.data
  },

  async getAdminStats() {
    const response = await api.get("/admin/stats")
    return response.data
  },

  async exportAdminData(params?: {
    format?: "csv" | "json"
    startDate?: string
    endDate?: string
  }) {
    const response = await api.get("/admin/export", {
      params,
      responseType: params?.format === "csv" ? "blob" : "json",
    })
    return response.data
  },

  // Health check endpoints
  async getHealthStatus() {
    const response = await api.get("/health")
    return response.data
  },

  async getSystemStatus() {
    const response = await api.get("/status")
    return response.data
  },

  async getSyncLabsHealth() {
    const response = await api.get("/synclabs/health")
    return response.data
  },

  async getWhatsAppHealth() {
    const response = await api.get("/whatsapp/health")
    return response.data
  },
}

export default api
