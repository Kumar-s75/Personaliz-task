"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import {
  RefreshCw,
  Search,
  Download,
  Eye,
  MessageSquare,
  Video,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Activity,
} from "lucide-react"

interface VideoRequest {
  id: string
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  deliveryStatus: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED"
  videoUrl?: string
  userName: string
  userCity: string
  userPhone: string
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

export function AdminDashboard() {
  const [requests, setRequests] = useState<VideoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<VideoRequest | null>(null)

  // Load requests on component mount
  useEffect(() => {
    loadRequests()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadRequests, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      // Note: This would need to be implemented in the backend
      // For now, we'll simulate with empty data
      setRequests([])
    } catch (error: any) {
      console.error("Failed to load requests:", error)
      setError("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userPhone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />
      case "PROCESSING":
        return <RefreshCw className="w-4 h-4 animate-spin" />
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
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const exportData = () => {
    const csvContent = [
      ["ID", "Name", "City", "Phone", "Actor", "Status", "Delivery Status", "Created At"],
      ...filteredRequests.map((req) => [
        req.id,
        req.userName,
        req.userCity,
        req.userPhone,
        req.actor.name,
        req.status,
        req.deliveryStatus,
        new Date(req.createdAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `video-requests-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Statistics
  const stats = {
    total: requests.length,
    completed: requests.filter((r) => r.status === "COMPLETED").length,
    processing: requests.filter((r) => r.status === "PROCESSING").length,
    failed: requests.filter((r) => r.status === "FAILED").length,
    delivered: requests.filter((r) => r.deliveryStatus === "DELIVERED" || r.deliveryStatus === "READ").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor video generation and delivery status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadRequests} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-2xl font-bold text-foreground">{stats.processing}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-foreground">{stats.failed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold text-foreground">{stats.delivered}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, city, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-full sm:w-48">
            <Label htmlFor="status-filter">Status Filter</Label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Video Requests</h2>

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadRequests} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No video requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground">User</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Actor</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Delivery</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{request.userName}</p>
                          <p className="text-sm text-muted-foreground">{request.userCity}</p>
                          <p className="text-xs text-muted-foreground">{request.userPhone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-foreground">{request.actor.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(request.deliveryStatus)}>
                          <MessageSquare className="w-3 h-3" />
                          <span className="ml-1">{request.deliveryStatus}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-foreground">{new Date(request.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Button onClick={() => setSelectedRequest(request)} variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">Request Details</h3>
                <Button onClick={() => setSelectedRequest(null)} variant="outline" size="sm">
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User Name</Label>
                  <p className="text-foreground">{selectedRequest.userName}</p>
                </div>
                <div>
                  <Label>City</Label>
                  <p className="text-foreground">{selectedRequest.userCity}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-foreground">{selectedRequest.userPhone}</p>
                </div>
                <div>
                  <Label>Actor</Label>
                  <p className="text-foreground">{selectedRequest.actor.name}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {getStatusIcon(selectedRequest.status)}
                  <span className="ml-1">Generation: {selectedRequest.status}</span>
                </Badge>
                <Badge className={getStatusColor(selectedRequest.deliveryStatus)}>
                  <MessageSquare className="w-4 h-4" />
                  <span className="ml-1">WhatsApp: {selectedRequest.deliveryStatus}</span>
                </Badge>
              </div>

              {selectedRequest.videoUrl && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Label>Video URL</Label>
                  <p className="text-sm text-foreground break-all">{selectedRequest.videoUrl}</p>
                </div>
              )}

              <div>
                <Label>Activity Logs</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto mt-2">
                  {selectedRequest.logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg text-sm">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          log.logType === "SUCCESS"
                            ? "bg-green-500"
                            : log.logType === "ERROR"
                              ? "bg-red-500"
                              : log.logType === "WEBHOOK"
                                ? "bg-purple-500"
                                : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-foreground">{log.message}</p>
                        <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
