import axios from "axios"
import type { WhatsAppSendRequest, WhatsAppSendResult } from "../types"

class WhatsAppService {
  private apiKey: string
  private phoneNumberId: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY || ""
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ""
    this.baseUrl = "https://graph.facebook.com/v18.0"

    if (!this.apiKey) {
      console.warn("WHATSAPP_API_KEY not found in environment variables")
    }
    if (!this.phoneNumberId) {
      console.warn("WHATSAPP_PHONE_NUMBER_ID not found in environment variables")
    }
  }

  async sendVideo(request: WhatsAppSendRequest): Promise<WhatsAppSendResult> {
    try {
      console.log("Sending video via WhatsApp:", {
        phoneNumber: request.phoneNumber,
        videoUrl: request.videoUrl,
        caption: request.caption,
      })

      // Format phone number (remove any non-digits and ensure it starts with country code)
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber)

      const payload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "video",
        video: {
          link: request.videoUrl,
          caption: request.caption || "Your personalized video is ready!",
        },
      }

      const response = await axios.post(`${this.baseUrl}/${this.phoneNumberId}/messages`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      })

      const messageId = response.data.messages[0].id

      console.log("WhatsApp video sent successfully:", {
        messageId,
        phoneNumber: formattedPhone,
      })

      return {
        messageId,
        status: "sent",
      }
    } catch (error) {
      console.error("WhatsApp video send failed:", error)

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message
        const errorCode = error.response?.data?.error?.code

        console.error("WhatsApp API Error:", {
          code: errorCode,
          message: errorMessage,
          status: error.response?.status,
        })

        throw new Error(`WhatsApp API error: ${errorMessage}`)
      }

      throw new Error("Failed to send WhatsApp video")
    }
  }

  async sendTextMessage(phoneNumber: string, message: string): Promise<WhatsAppSendResult> {
    try {
      console.log("Sending text message via WhatsApp:", {
        phoneNumber,
        message: message.substring(0, 100) + "...",
      })

      const formattedPhone = this.formatPhoneNumber(phoneNumber)

      const payload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
          body: message,
        },
      }

      const response = await axios.post(`${this.baseUrl}/${this.phoneNumberId}/messages`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      })

      const messageId = response.data.messages[0].id

      return {
        messageId,
        status: "sent",
      }
    } catch (error) {
      console.error("WhatsApp text send failed:", error)
      throw error
    }
  }

  async sendTemplate(
    phoneNumber: string,
    templateName: string,
    templateParams: string[] = [],
  ): Promise<WhatsAppSendResult> {
    try {
      console.log("Sending template message via WhatsApp:", {
        phoneNumber,
        templateName,
        params: templateParams,
      })

      const formattedPhone = this.formatPhoneNumber(phoneNumber)

      const payload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "en_US",
          },
          components:
            templateParams.length > 0
              ? [
                  {
                    type: "body",
                    parameters: templateParams.map((param) => ({
                      type: "text",
                      text: param,
                    })),
                  },
                ]
              : [],
        },
      }

      const response = await axios.post(`${this.baseUrl}/${this.phoneNumberId}/messages`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      })

      const messageId = response.data.messages[0].id

      return {
        messageId,
        status: "sent",
      }
    } catch (error) {
      console.error("WhatsApp template send failed:", error)
      throw error
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, "")

    // If it doesn't start with a country code, assume it's US (+1)
    if (cleaned.length === 10) {
      cleaned = "1" + cleaned
    }

    // Remove leading + if present
    if (cleaned.startsWith("+")) {
      cleaned = cleaned.substring(1)
    }

    return cleaned
  }

  // Mock implementation for development/testing
  async sendVideoMock(request: WhatsAppSendRequest): Promise<WhatsAppSendResult> {
    console.log("Using mock WhatsApp service for development")
    console.log("Mock video send:", {
      phoneNumber: request.phoneNumber,
      videoUrl: request.videoUrl,
      caption: request.caption,
    })

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockMessageId = `mock_msg_${Date.now()}`

    return {
      messageId: mockMessageId,
      status: "sent",
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      // Check if we can access the WhatsApp Business API
      const response = await axios.get(`${this.baseUrl}/${this.phoneNumberId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 5000,
      })

      return response.status === 200
    } catch (error) {
      console.error("WhatsApp health check failed:", error)
      return false
    }
  }

  // Get phone number info
  async getPhoneNumberInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.phoneNumberId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      return response.data
    } catch (error) {
      console.error("Failed to get phone number info:", error)
      throw error
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService()
