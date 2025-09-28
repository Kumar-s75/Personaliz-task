import express from "express"
import { PrismaClient } from "@prisma/client"

const router = express.Router()
const prisma = new PrismaClient()

// Get all actors
router.get("/", async (req, res) => {
  try {
    const actors = await prisma.actor.findMany({
      orderBy: { name: "asc" },
    })

    res.json({
      success: true,
      data: actors,
    })
  } catch (error) {
    console.error("Get actors error:", error)
    res.status(500).json({
      error: "Failed to fetch actors",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Get single actor
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const actor = await prisma.actor.findUnique({
      where: { id },
    })

    if (!actor) {
      return res.status(404).json({ error: "Actor not found" })
    }

    res.json({
      success: true,
      data: actor,
    })
  } catch (error) {
    console.error("Get actor error:", error)
    res.status(500).json({
      error: "Failed to fetch actor",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

export default router
