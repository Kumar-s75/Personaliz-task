"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Loader2, CheckCircle, XCircle, Clock, MessageSquare, Video, RefreshCw, ExternalLink } from "lucide-react"
import { apiService } from "@/lib/api"

interface VideoRequest {
  id: string
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  deliveryStatus: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED"
  videoUrl?: string
  userName: string
  userCity: string
  actor: {
    name: string
    description: string
  }
  createdAt: string
  updatedAt: string
  logs: Array<{
    id: string
    logType: "INFO" | "ERROR" | "SUCCESS" | "WEBHOOK"
    message: string
    createdAt: string
    data?: any
  }>
}

interface StatusDisplayProps {
  requestId: string | null
  onReset: () => void
}

export function StatusDisplay({ requestId, onReset }: StatusDisplayProps) {
  const [videoRequest, setVideoRequest] = useState<VideoRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Poll for status updates
  useEffect(() => {
    if (!requestId) {
      setVideoRequest(null)
      return
    }

    const pollStatus = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getVideoStatus(requestId)
        setVideoRequest(response.data)
      } catch (error: any) {
        console.error("Status polling error:", error)
        setError(error.response?.data?.message || "Failed to get status")
      } finally {
        setLoading(false)
      }
    }

    // Initial load
    pollStatus()

    // Set up polling interval (every 5 seconds)
    const interval = setInterval(pollStatus, 5000)

    return () => clearInterval(interval)
  }, [requestId])

  if (!requestId) {
    return (
      <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-white/40 mx-auto mb-6" />
          <h3 className="text-xl font-jura font-semibold text-white mb-3">No Active Request</h3>
          <p className="text-white/70 font-inter text-lg">
            Fill out the form to start generating your personalized video
          </p>
        </div>
      </Card>
    )
  }

  if (loading && !videoRequest) {
    return (
      <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
          <p className="text-white/70 font-inter text-lg">Loading status...</p>
        </div>
      </Card>
    )
  }

  if (error && !videoRequest) {
    return (
      <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h3 className="text-xl font-jura font-semibold text-white mb-3">Error</h3>
          <p className="text-red-400 font-inter mb-6 text-lg">{error}</p>
          <Button onClick={onReset} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if (!videoRequest) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />
      case "PROCESSING":
        return <Loader2 className="w-4 h-4 animate-spin" />
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />
      case "FAILED":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "PROCESSING":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "COMPLETED":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "FAILED":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-white/10 text-white/70 border-white/20"
    }
  }

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-white/10 text-white/70 border-white/20"
      case "SENT":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "DELIVERED":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "READ":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "FAILED":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-white/10 text-white/70 border-white/20"
    }
  }

  return (
    <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-jura font-bold text-white tracking-tight">Status</h2>
          <Button onClick={onReset} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Request Info */}
        <div className="space-y-4">
          <div>
            <h3 className="font-jura font-semibold text-white text-xl mb-2">Request Details</h3>
            <p className="text-white/70 font-inter text-lg">
              Video for {videoRequest.userName} from {videoRequest.userCity}
            </p>
            <p className="text-white/70 font-inter">Actor: {videoRequest.actor.name}</p>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-3">
            <Badge className={getStatusColor(videoRequest.status)}>
              {getStatusIcon(videoRequest.status)}
              <span className="ml-2">Generation: {videoRequest.status}</span>
            </Badge>
            <Badge className={getDeliveryStatusColor(videoRequest.deliveryStatus)}>
              <MessageSquare className="w-4 h-4" />
              <span className="ml-2">WhatsApp: {videoRequest.deliveryStatus}</span>
            </Badge>
          </div>
        </div>

        {/* Video URL */}
        {videoRequest.videoUrl && (
          <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-jura font-semibold text-green-300 text-lg">Video Ready!</h4>
                <p className="text-green-400 font-inter">Your personalized video has been generated</p>
              </div>
              <Button
                onClick={() => window.open(videoRequest.videoUrl, "_blank")}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Video
              </Button>
            </div>
          </div>
        )}

        {/* Activity Logs */}
        <div className="space-y-4">
          <h3 className="font-jura font-semibold text-white text-xl">Activity Log</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {videoRequest.logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div
                  className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                    log.logType === "SUCCESS"
                      ? "bg-green-500"
                      : log.logType === "ERROR"
                        ? "bg-red-500"
                        : log.logType === "WEBHOOK"
                          ? "bg-purple-500"
                          : "bg-blue-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-inter">{log.message}</p>
                  <p className="text-sm text-white/50 font-inter mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timestamps */}
        <div className="text-sm text-white/50 font-inter space-y-1 pt-4 border-t border-white/10">
          <p>Created: {new Date(videoRequest.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(videoRequest.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </Card>
  )
}
