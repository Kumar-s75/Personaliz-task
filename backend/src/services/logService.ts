import { PrismaClient, type LogType } from "@prisma/client"

const prisma = new PrismaClient()

export const logService = {
  async createLog(videoRequestId: string, logType: LogType, message: string, data?: any) {
    try {
      const log = await prisma.requestLog.create({
        data: {
          videoRequestId,
          logType,
          message,
          data: data ? JSON.parse(JSON.stringify(data)) : null,
        },
      })

      console.log(`[${logType}] ${message}`, data || "")
      return log
    } catch (error) {
      console.error("Failed to create log:", error)
      // Don't throw error to avoid breaking main flow
    }
  },

  async getLogs(videoRequestId: string, limit = 50) {
    try {
      return await prisma.requestLog.findMany({
        where: { videoRequestId },
        orderBy: { createdAt: "desc" },
        take: limit,
      })
    } catch (error) {
      console.error("Failed to get logs:", error)
      return []
    }
  },
}
