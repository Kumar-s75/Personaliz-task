import express from "express"
import { PrismaClient } from "@prisma/client"
import { logService } from "../services/logService"
import { whatsappService } from "../services/whatsappService"

const router = express.Router()
const prisma = new PrismaClient()

// WhatsApp webhook for delivery status
router.post("/webhook", async (req, res) => {
  try {
    console.log("WhatsApp webhook received:", JSON.stringify(req.body, null, 2))

    const { entry } = req.body

    if (!entry || !entry[0]?.changes) {
      return res.status(200).json({ success: true })
    }

    const changes = entry[0].changes[0]
    const value = changes.value

    // Handle message status updates
    if (value.statuses) {
      for (const status of value.statuses) {
        const messageId = status.id
        const statusType = status.status // sent, delivered, read, failed
        const timestamp = status.timestamp

        // Find video request by WhatsApp message ID
        const videoRequest = await prisma.videoRequest.findFirst({
          where: { whatsappMessageId: messageId },
        })

        if (videoRequest) {
          // Map WhatsApp status to our delivery status
          let deliveryStatus: "SENT" | "DELIVERED" | "READ" | "FAILED" = "SENT"

          switch (statusType) {
            case "sent":
              deliveryStatus = "SENT"
              break
            case "delivered":
              deliveryStatus = "DELIVERED"
              break
            case "read":
              deliveryStatus = "READ"
              break
            case "failed":
              deliveryStatus = "FAILED"
              break
          }

          // Update delivery status
          await prisma.videoRequest.update({
            where: { id: videoRequest.id },
            data: { deliveryStatus },
          })

          // Log the status update
          await logService.createLog(
            videoRequest.id,
            statusType === "failed" ? "ERROR" : "WEBHOOK",
            `WhatsApp status: ${statusType}`,
            {
              messageId,
              status: statusType,
              timestamp,
              recipientId: status.recipient_id,
              errors: status.errors || null,
            },
          )

          console.log(`Updated delivery status for request ${videoRequest.id}: ${deliveryStatus}`)
        } else {
          console.log(`No video request found for WhatsApp message ID: ${messageId}`)
        }
      }
    }

    // Handle incoming messages (optional - for user replies)
    if (value.messages) {
      for (const message of value.messages) {
        console.log("Received WhatsApp message:", {
          from: message.from,
          type: message.type,
          timestamp: message.timestamp,
        })

        // You can implement auto-replies or message handling here
        // For now, we'll just log it
      }
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error("WhatsApp webhook error:", error)
    res.status(500).json({
      error: "Webhook processing failed",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Verify webhook (for WhatsApp setup)
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"]
  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]

  // Verify token (you should set this in your environment)
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "personaliz_verify_token"

  console.log("WhatsApp webhook verification:", { mode, token, challenge })

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified successfully")
    res.status(200).send(challenge)
  } else {
    console.log("WhatsApp webhook verification failed")
    res.status(403).json({ error: "Verification failed" })
  }
})

// Manual send video endpoint (for testing)
router.post("/send-video", async (req, res) => {
  try {
    const { phoneNumber, videoUrl, caption } = req.body

    if (!phoneNumber || !videoUrl) {
      return res.status(400).json({
        error: "Missing required fields: phoneNumber, videoUrl",
      })
    }

    const result = await whatsappService.sendVideo({
      phoneNumber,
      videoUrl,
      caption,
    })

    res.json({
      success: true,
      messageId: result.messageId,
      status: result.status,
    })
  } catch (error) {
    console.error("Manual video send error:", error)
    res.status(500).json({
      error: "Failed to send video",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Send text message endpoint (for testing)
router.post("/send-text", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body

    if (!phoneNumber || !message) {
      return res.status(400).json({
        error: "Missing required fields: phoneNumber, message",
      })
    }

    const result = await whatsappService.sendTextMessage(phoneNumber, message)

    res.json({
      success: true,
      messageId: result.messageId,
      status: result.status,
    })
  } catch (error) {
    console.error("Text message send error:", error)
    res.status(500).json({
      error: "Failed to send text message",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Get WhatsApp service health
router.get("/health", async (req, res) => {
  try {
    const isHealthy = await whatsappService.healthCheck()
    const phoneInfo = isHealthy ? await whatsappService.getPhoneNumberInfo() : null

    res.json({
      success: true,
      healthy: isHealthy,
      service: "WhatsApp Business API",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      phoneInfo,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("WhatsApp health check error:", error)
    res.status(500).json({
      success: false,
      healthy: false,
      service: "WhatsApp Business API",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

export default router
