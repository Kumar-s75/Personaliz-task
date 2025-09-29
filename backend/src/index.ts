import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"

// Import routes
import videoRoutes from "./routes/video"
import whatsappRoutes from "./routes/whatsapp"
import actorRoutes from "./routes/actors"
import syncLabsRoutes from "./routes/synclabs"
import adminRoutes from "./routes/admin"

// Import database utilities
import { runMigrations } from "./database/migrate"

// Load environment variables
require('dotenv').config();


const app = express()
const port = process.env.PORT || 3001
const prisma = new PrismaClient()

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Routes
app.use("/api/video", videoRoutes)
app.use("/api/whatsapp", whatsappRoutes)
app.use("/api/actors", actorRoutes)
app.use("/api/synclabs", syncLabsRoutes)
app.use("/api/admin", adminRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// System status endpoint
app.get("/api/status", async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    // Get basic stats
    const totalRequests = await prisma.videoRequest.count()
    const activeRequests = await prisma.videoRequest.count({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
    })

    res.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      stats: {
        totalRequests,
        activeRequests,
      },
      services: {
        syncLabs: process.env.SYNCLABS_API_KEY ? "configured" : "not configured",
        whatsApp: process.env.WHATSAPP_API_KEY ? "configured" : "not configured",
      },
    })
  } catch (error) {
    console.error("System status check failed:", error)
    res.status(500).json({
      success: false,
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})
app.get("/", (req, res) => {
  res.send("🚀 API is running. Check /health or /api/status");
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Start server
async function startServer() {
  try {
    // Run database migrations and seeding
    console.log("Initializing database...")
    await runMigrations()

    // Test database connection
    await prisma.$connect()
    console.log("Database connected successfully")

    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
      console.log(`Health check: http://localhost:${port}/health`)
      console.log(`System status: http://localhost:${port}/api/status`)
      console.log(`API endpoints:`)
      console.log(`  - POST /api/video/generate`)
      console.log(`  - GET  /api/video/status/:id`)
      console.log(`  - GET  /api/actors`)
      console.log(`  - POST /api/whatsapp/webhook`)
      console.log(`  - POST /api/synclabs/webhook`)
      console.log(`  - GET  /api/admin/requests`)
      console.log(`  - GET  /api/admin/stats`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...")
  await prisma.$disconnect()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...")
  await prisma.$disconnect()
  process.exit(0)
})

startServer()
