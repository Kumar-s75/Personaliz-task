import axios from "axios"
import type { VideoGenerationRequest, VideoGenerationResult } from "../types"

class SyncLabsService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.SYNCLABS_API_KEY || ""
    this.baseUrl = "https://api.synclabs.so/v1"

    if (!this.apiKey) {
      console.warn("SYNCLABS_API_KEY not found in environment variables")
    }
  }

  async generatePersonalizedVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    try {
      console.log("Starting SyncLabs video generation:", request)

      // Step 1: Create the personalized script
      const personalizedScript = this.createPersonalizedScript(request.userName, request.userCity)

      // Step 2: Generate audio with the cloned voice
      const audioResult = await this.generateAudio(personalizedScript, request.voiceId)

      // Step 3: Create lipsync video
      const videoResult = await this.createLipsyncVideo(audioResult.audioUrl, request.voiceId)

      return {
        jobId: videoResult.jobId,
        videoUrl: videoResult.videoUrl,
        status: "completed",
      }
    } catch (error) {
      console.error("SyncLabs video generation failed:", error)

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message
        throw new Error(`SyncLabs API error: ${errorMessage}`)
      }

      throw new Error("Video generation failed")
    }
  }

  private createPersonalizedScript(userName: string, userCity: string): string {
    // Create a personalized script that will be spoken by the AI
    return `Hello ${userName}! Welcome to our amazing platform. We're so excited to have you joining us from ${userCity}. This personalized video was created just for you, and we hope you enjoy this unique experience. Thank you for being part of our community!`
  }

  private async generateAudio(script: string, voiceId: string): Promise<{ audioUrl: string; audioId: string }> {
    try {
      console.log("Generating audio with SyncLabs...")

      const response = await axios.post(
        `${this.baseUrl}/generate-audio`,
        {
          text: script,
          voice_id: voiceId,
          model: "sync-1.6.0", // Latest SyncLabs model
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 60000, // 60 second timeout
        },
      )

      const audioId = response.data.audio_id

      // Poll for audio completion
      const audioUrl = await this.pollForAudioCompletion(audioId)

      return {
        audioUrl,
        audioId,
      }
    } catch (error) {
      console.error("Audio generation failed:", error)
      throw error
    }
  }

  private async pollForAudioCompletion(audioId: string): Promise<string> {
    const maxAttempts = 30 // 5 minutes max
    const pollInterval = 10000 // 10 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(`${this.baseUrl}/audio-status/${audioId}`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        })

        const status = response.data.status

        if (status === "completed") {
          return response.data.audio_url
        } else if (status === "failed") {
          throw new Error("Audio generation failed")
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, pollInterval))
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error
        }
        console.log(`Audio polling attempt ${attempt + 1} failed, retrying...`)
      }
    }

    throw new Error("Audio generation timeout")
  }

  private async createLipsyncVideo(audioUrl: string, voiceId: string): Promise<{ jobId: string; videoUrl: string }> {
    try {
      console.log("Creating lipsync video with SyncLabs...")

      // Use a base video template (you would upload this to SyncLabs or use their templates)
      const baseVideoUrl = "https://example.com/base-video.mp4" // This should be your base video

      const response = await axios.post(
        `${this.baseUrl}/lipsync`,
        {
          audio_url: audioUrl,
          video_url: baseVideoUrl,
          voice_id: voiceId,
          model: "sync-1.6.0",
          webhook_url: `${process.env.BACKEND_URL || "http://localhost:3001"}/api/synclabs/webhook`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        },
      )

      const jobId = response.data.job_id

      // Poll for video completion
      const videoUrl = await this.pollForVideoCompletion(jobId)

      return {
        jobId,
        videoUrl,
      }
    } catch (error) {
      console.error("Lipsync video creation failed:", error)
      throw error
    }
  }

  private async pollForVideoCompletion(jobId: string): Promise<string> {
    const maxAttempts = 60 // 10 minutes max
    const pollInterval = 10000 // 10 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(`${this.baseUrl}/lipsync-status/${jobId}`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        })

        const status = response.data.status

        if (status === "completed") {
          return response.data.video_url
        } else if (status === "failed") {
          throw new Error(`Video generation failed: ${response.data.error || "Unknown error"}`)
        }

        console.log(`Video generation status: ${status} (attempt ${attempt + 1}/${maxAttempts})`)

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, pollInterval))
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error
        }
        console.log(`Video polling attempt ${attempt + 1} failed, retrying...`)
      }
    }

    throw new Error("Video generation timeout")
  }

  // Mock implementation for development/testing
  async generatePersonalizedVideoMock(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    console.log("Using mock SyncLabs service for development")

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockJobId = `mock_job_${Date.now()}`
    const mockVideoUrl = `https://example.com/videos/${mockJobId}.mp4`

    return {
      jobId: mockJobId,
      videoUrl: mockVideoUrl,
      status: "completed",
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 5000,
      })

      return response.status === 200
    } catch (error) {
      console.error("SyncLabs health check failed:", error)
      return false
    }
  }
}

// Export singleton instance
export const syncLabsService = new SyncLabsService()
