export interface VideoGenerationRequest {
  userName: string
  userCity: string
  voiceId: string
}

export interface VideoGenerationResult {
  jobId: string
  videoUrl: string
  status: "processing" | "completed" | "failed"
}

export interface WhatsAppSendRequest {
  phoneNumber: string
  videoUrl: string
  caption?: string
}

export interface WhatsAppSendResult {
  messageId: string
  status: "sent" | "failed"
}

export interface SyncLabsConfig {
  apiKey: string
  baseUrl: string
}

export interface WhatsAppConfig {
  apiKey: string
  phoneNumberId: string
  baseUrl: string
}
