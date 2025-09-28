import express from "express"
import { PrismaClient } from "@prisma/client"
import { syncLabsService } from "../services/syncLabsService"
import { whatsappService } from "../services/whatsappService"
import { logService } from "../services/logService"

const router = express.Router()
const prisma = new PrismaClient()

// Generate personalized video
router.post("/generate", async (req, res) => {
  try {
    const { userName, userCity, userPhone, actorId } = req.body

    // Validate input
    if (!userName || !userCity || !userPhone || !actorId) {
      return res.status(400).json({
        error: "Missing required fields: userName, userCity, userPhone, actorId",
      })
    }

    // Validate actor exists
    const actor = await prisma.actor.findUnique({
      where: { id: actorId },
    })

    if (!actor) {
      return res.status(404).json({ error: "Actor not found" })
    }

    // Create video request record
    const videoRequest = await prisma.videoRequest.create({
      data: {
        userName,
        userCity,
        userPhone,
        actorId,
        status: "PROCESSING",
      },
      include: {
        actor: true,
      },
    })

    // Log request creation
    await logService.createLog(videoRequest.id, "INFO", "Video request created", {
      userName,
      userCity,
      actorName: actor.name,
    })

    // Start video generation process (async)
    generateVideoAsync(videoRequest.id, userName, userCity, actor.voiceId, userPhone)

    res.json({
      success: true,
      requestId: videoRequest.id,
      message: "Video generation started",
      status: "PROCESSING",
    })
  } catch (error) {
    console.error("Video generation error:", error)
    res.status(500).json({
      error: "Failed to start video generation",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Get video generation status
router.get("/status/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params

    const videoRequest = await prisma.videoRequest.findUnique({
      where: { id: requestId },
      include: {
        actor: true,
        logs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!videoRequest) {
      return res.status(404).json({ error: "Video request not found" })
    }

    res.json({
      success: true,
      data: {
        id: videoRequest.id,
        status: videoRequest.status,
        deliveryStatus: videoRequest.deliveryStatus,
        videoUrl: videoRequest.videoUrl,
        userName: videoRequest.userName,
        userCity: videoRequest.userCity,
        actor: videoRequest.actor,
        createdAt: videoRequest.createdAt,
        updatedAt: videoRequest.updatedAt,
        logs: videoRequest.logs,
      },
    })
  } catch (error) {
    console.error("Status check error:", error)
    res.status(500).json({
      error: "Failed to get status",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Async function to handle video generation
async function generateVideoAsync(
  requestId: string,
  userName: string,
  userCity: string,
  voiceId: string,
  userPhone: string,
) {
  try {
    // Update status to processing
    await prisma.videoRequest.update({
      where: { id: requestId },
      data: { status: "PROCESSING" },
    })

    await logService.createLog(requestId, "INFO", "Starting SyncLabs video generation")

    const useMockService = process.env.NODE_ENV === "development" || !process.env.SYNCLABS_API_KEY

    let videoResult
    if (useMockService) {
      console.log("Using mock SyncLabs service for development")
      videoResult = await syncLabsService.generatePersonalizedVideoMock({
        userName,
        userCity,
        voiceId,
      })
    } else {
      videoResult = await syncLabsService.generatePersonalizedVideo({
        userName,
        userCity,
        voiceId,
      })
    }

    // Update request with video URL and job ID
    await prisma.videoRequest.update({
      where: { id: requestId },
      data: {
        syncLabsJobId: videoResult.jobId,
        videoUrl: videoResult.videoUrl,
        status: "COMPLETED",
      },
    })

    await logService.createLog(requestId, "SUCCESS", "Video generated successfully", {
      jobId: videoResult.jobId,
      videoUrl: videoResult.videoUrl,
    })

    // Send video via WhatsApp
    await logService.createLog(requestId, "INFO", "Sending video via WhatsApp")

    const useMockWhatsApp = process.env.NODE_ENV === "development" || !process.env.WHATSAPP_API_KEY

    let whatsappResult
    if (useMockWhatsApp) {
      console.log("Using mock WhatsApp service for development")
      whatsappResult = await whatsappService.sendVideoMock({
        phoneNumber: userPhone,
        videoUrl: videoResult.videoUrl,
        caption: `Hi ${userName}! Here's your personalized video from ${userCity}!`,
      })
    } else {
      whatsappResult = await whatsappService.sendVideo({
        phoneNumber: userPhone,
        videoUrl: videoResult.videoUrl,
        caption: `Hi ${userName}! Here's your personalized video from ${userCity}!`,
      })
    }

    // Update WhatsApp message ID
    await prisma.videoRequest.update({
      where: { id: requestId },
      data: {
        whatsappMessageId: whatsappResult.messageId,
        deliveryStatus: "SENT",
      },
    })

    await logService.createLog(requestId, "SUCCESS", "Video sent via WhatsApp", {
      messageId: whatsappResult.messageId,
    })
  } catch (error) {
    console.error("Video generation failed:", error)

    // Update status to failed
    await prisma.videoRequest.update({
      where: { id: requestId },
      data: { status: "FAILED" },
    })

    await logService.createLog(requestId, "ERROR", "Video generation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export default router
