import express from "express"
import { PrismaClient } from "@prisma/client"

const router = express.Router()
const prisma = new PrismaClient()

// Get all video requests with pagination and filtering
router.get("/requests", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "50",
      status,
      deliveryStatus,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query

    const pageNum = Number.parseInt(page as string)
    const limitNum = Number.parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (deliveryStatus && deliveryStatus !== "all") {
      where.deliveryStatus = deliveryStatus
    }

    if (search) {
      where.OR = [
        { userName: { contains: search as string, mode: "insensitive" } },
        { userCity: { contains: search as string, mode: "insensitive" } },
        { userPhone: { contains: search as string } },
      ]
    }

    // Get total count for pagination
    const totalCount = await prisma.videoRequest.count({ where })

    // Get requests with pagination
    const requests = await prisma.videoRequest.findMany({
      where,
      include: {
        actor: true,
        logs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
      orderBy: {
        [sortBy as string]: sortOrder as "asc" | "desc",
      },
      skip,
      take: limitNum,
    })

    // Calculate statistics
    const stats = await prisma.videoRequest.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    })

    const deliveryStats = await prisma.videoRequest.groupBy({
      by: ["deliveryStatus"],
      _count: {
        deliveryStatus: true,
      },
    })

    const totalPages = Math.ceil(totalCount / limitNum)

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        statistics: {
          byStatus: stats.reduce(
            (acc, stat) => {
              acc[stat.status] = stat._count.status
              return acc
            },
            {} as Record<string, number>,
          ),
          byDeliveryStatus: deliveryStats.reduce(
            (acc, stat) => {
              acc[stat.deliveryStatus] = stat._count.deliveryStatus
              return acc
            },
            {} as Record<string, number>,
          ),
          total: totalCount,
        },
      },
    })
  } catch (error) {
    console.error("Admin requests fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch requests",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Get single request with full details
router.get("/requests/:id", async (req, res) => {
  try {
    const { id } = req.params

    const request = await prisma.videoRequest.findUnique({
      where: { id },
      include: {
        actor: true,
        logs: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!request) {
      return res.status(404).json({ error: "Request not found" })
    }

    res.json({
      success: true,
      data: request,
    })
  } catch (error) {
    console.error("Admin request fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch request",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Get system statistics
router.get("/stats", async (req, res) => {
  try {
    const totalRequests = await prisma.videoRequest.count()

    const statusStats = await prisma.videoRequest.groupBy({
      by: ["status"],
      _count: { status: true },
    })

    const deliveryStats = await prisma.videoRequest.groupBy({
      by: ["deliveryStatus"],
      _count: { deliveryStatus: true },
    })

    const actorStats = await prisma.videoRequest.groupBy({
      by: ["actorId"],
      _count: { actorId: true },
      include: {
        actor: {
          select: { name: true },
        },
      },
    })

    // Recent activity (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const recentRequests = await prisma.videoRequest.count({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
    })

    // Success rate
    const completedRequests = await prisma.videoRequest.count({
      where: { status: "COMPLETED" },
    })

    const successRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0

    res.json({
      success: true,
      data: {
        totalRequests,
        recentRequests,
        successRate: Math.round(successRate * 100) / 100,
        statusBreakdown: statusStats.reduce(
          (acc, stat) => {
            acc[stat.status] = stat._count.status
            return acc
          },
          {} as Record<string, number>,
        ),
        deliveryBreakdown: deliveryStats.reduce(
          (acc, stat) => {
            acc[stat.deliveryStatus] = stat._count.deliveryStatus
            return acc
          },
          {} as Record<string, number>,
        ),
        popularActors: actorStats.map((stat) => ({
          actorId: stat.actorId,
          count: stat._count.actorId,
        })),
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    res.status(500).json({
      error: "Failed to fetch statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Export data as CSV
router.get("/export", async (req, res) => {
  try {
    const { format = "csv", startDate, endDate } = req.query

    const where: any = {}

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate as string)
      if (endDate) where.createdAt.lte = new Date(endDate as string)
    }

    const requests = await prisma.videoRequest.findMany({
      where,
      include: {
        actor: true,
      },
      orderBy: { createdAt: "desc" },
    })

    if (format === "csv") {
      const csvHeaders = [
        "ID",
        "User Name",
        "User City",
        "User Phone",
        "Actor Name",
        "Status",
        "Delivery Status",
        "Video URL",
        "Created At",
        "Updated At",
      ]

      const csvRows = requests.map((req) => [
        req.id,
        req.userName,
        req.userCity,
        req.userPhone,
        req.actor.name,
        req.status,
        req.deliveryStatus,
        req.videoUrl || "",
        req.createdAt.toISOString(),
        req.updatedAt.toISOString(),
      ])

      const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

      res.setHeader("Content-Type", "text/csv")
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="video-requests-${new Date().toISOString().split("T")[0]}.csv"`,
      )
      res.send(csvContent)
    } else {
      res.json({
        success: true,
        data: requests,
      })
    }
  } catch (error) {
    console.error("Admin export error:", error)
    res.status(500).json({
      error: "Failed to export data",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

export default router
