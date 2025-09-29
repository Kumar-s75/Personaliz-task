-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('INFO', 'ERROR', 'SUCCESS', 'WEBHOOK');

-- CreateTable
CREATE TABLE "actors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "voiceId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_requests" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userCity" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "syncLabsJobId" TEXT,
    "videoUrl" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "whatsappMessageId" TEXT,
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_logs" (
    "id" TEXT NOT NULL,
    "videoRequestId" TEXT NOT NULL,
    "logType" "LogType" NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "video_requests" ADD CONSTRAINT "video_requests_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "actors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_logs" ADD CONSTRAINT "request_logs_videoRequestId_fkey" FOREIGN KEY ("videoRequestId") REFERENCES "video_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
