import express from "express"
import { PrismaClient } from "@prisma/client"
import { logService } from "../services/logService"

const router = express.Router()
const prisma = new PrismaClient()

// SyncLabs webhook for job status updates
router.post("/webhook", async (req, res) => {
  try {
    console.log("SyncLabs webhook received:", JSON.stringify(req.body, null, 2))

    const { job_id, status, video_url, error } = req.body

    if (!job_id) {
      return res.status(400).json({ error: "Missing job_id" })
    }

    // Find video request by SyncLabs job ID
    const videoRequest = await prisma.videoRequest.findFirst({
      where: { syncLabsJobId: job_id },
    })

    if (!videoRequest) {
      console.log(`No video request found for job_id: ${job_id}`)
      return res.status(404).json({ error: "Video request not found" })
    }

    // Update video request based on status
    if (status === "completed" && video_url) {
      await prisma.videoRequest.update({
        where: { id: videoRequest.id },
        data: {
          videoUrl: video_url,
          status: "COMPLETED",
        },
      })

      await logService.createLog(videoRequest.id, "SUCCESS", "SyncLabs video generation completed", {
        jobId: job_id,
        videoUrl: video_url,
      })
    } else if (status === "failed") {
      await prisma.videoRequest.update({
        where: { id: videoRequest.id },
        data: { status: "FAILED" },
      })

      await logService.createLog(videoRequest.id, "ERROR", "SyncLabs video generation failed", { jobId: job_id, error })
    } else {
      // Update with current status (processing, etc.)
      await logService.createLog(videoRequest.id, "INFO", `SyncLabs status update: ${status}`, {
        jobId: job_id,
        status,
      })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error("SyncLabs webhook error:", error)
    res.status(500).json({
      error: "Webhook processing failed",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Get SyncLabs service health
router.get("/health", async (req, res) => {
  try {
    const { syncLabsService } = await import("../services/syncLabsService")
    const isHealthy = await syncLabsService.healthCheck()

    res.json({
      success: true,
      healthy: isHealthy,
      service: "SyncLabs",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("SyncLabs health check error:", error)
    res.status(500).json({
      success: false,
      healthy: false,
      service: "SyncLabs",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

export default router
