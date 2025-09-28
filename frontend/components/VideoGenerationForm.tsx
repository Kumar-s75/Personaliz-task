"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Select } from "../components/ui/Select"
import { Card } from "../components/ui/Card"
import { Loader2, Play, User, MapPin, Phone } from "lucide-react"
import { apiService } from "../lib/api"

interface Actor {
  id: string
  name: string
  description: string
  voiceId: string
  imageUrl?: string
}

interface VideoGenerationFormProps {
  onVideoGenerated: (requestId: string) => void
  disabled?: boolean
}

export function VideoGenerationForm({ onVideoGenerated, disabled = false }: VideoGenerationFormProps) {
  const [formData, setFormData] = useState({
    userName: "",
    userCity: "",
    userPhone: "",
    actorId: "",
  })
  const [actors, setActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingActors, setLoadingActors] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load actors on component mount
  useEffect(() => {
    loadActors()
  }, [])

  const loadActors = async () => {
    try {
      setLoadingActors(true)
      const response = await apiService.getActors()
      setActors(response.data)
    } catch (error) {
      console.error("Failed to load actors:", error)
      setError("Failed to load actors. Please refresh the page.")
    } finally {
      setLoadingActors(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.userName.trim()) {
      setError("Please enter your name")
      return false
    }
    if (!formData.userCity.trim()) {
      setError("Please enter your city")
      return false
    }
    if (!formData.userPhone.trim()) {
      setError("Please enter your phone number")
      return false
    }
    if (!formData.actorId) {
      setError("Please select an actor")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)
      setError(null)

      const response = await apiService.generateVideo(formData)

      if (response.success) {
        onVideoGenerated(response.requestId)
        // Reset form
        setFormData({
          userName: "",
          userCity: "",
          userPhone: "",
          actorId: "",
        })
      } else {
        setError(response.message || "Failed to start video generation")
      }
    } catch (error: any) {
      console.error("Video generation error:", error)
      setError(error.response?.data?.message || "Failed to generate video. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const selectedActor = actors.find((actor) => actor.id === formData.actorId)

  return (
    <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-jura font-bold text-white mb-3 tracking-tight">Generate Video</h2>
          <p className="text-white/70 font-inter text-lg">Fill in your details to create a personalized video</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-3">
            <Label htmlFor="userName" className="flex items-center gap-3 text-white font-inter font-medium text-base">
              <User className="w-5 h-5 text-primary" />
              Your Name
            </Label>
            <Input
              id="userName"
              type="text"
              placeholder="Enter your full name"
              value={formData.userName}
              onChange={(e) => handleInputChange("userName", e.target.value)}
              disabled={disabled || loading}
              className="w-full h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 font-inter focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* City Input */}
          <div className="space-y-3">
            <Label htmlFor="userCity" className="flex items-center gap-3 text-white font-inter font-medium text-base">
              <MapPin className="w-5 h-5 text-primary" />
              Your City
            </Label>
            <Input
              id="userCity"
              type="text"
              placeholder="Enter your city"
              value={formData.userCity}
              onChange={(e) => handleInputChange("userCity", e.target.value)}
              disabled={disabled || loading}
              className="w-full h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 font-inter focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* Phone Input */}
          <div className="space-y-3">
            <Label htmlFor="userPhone" className="flex items-center gap-3 text-white font-inter font-medium text-base">
              <Phone className="w-5 h-5 text-primary" />
              WhatsApp Number
            </Label>
            <Input
              id="userPhone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.userPhone}
              onChange={(e) => handleInputChange("userPhone", e.target.value)}
              disabled={disabled || loading}
              className="w-full h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 font-inter focus:border-primary focus:ring-primary/20"
            />
            <p className="text-sm text-white/50 font-inter">Include country code (e.g., +1 for US)</p>
          </div>

          {/* Actor Selection */}
        <div className="space-y-3">
  <Label htmlFor="actorId" className="text-white font-inter font-medium text-base">
    Choose Actor
  </Label>
  {loadingActors ? (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="ml-3 text-white/70 font-inter text-lg">Loading actors...</span>
    </div>
  ) : (
    <select
      id="actorId"
      value={formData.actorId}
      onChange={(e) => handleInputChange("actorId", e.target.value)}
      disabled={disabled || loading}
      className="w-full h-12 bg-white/5 border-white/20 text-white font-inter focus:border-primary"
    >
      <option value="" className="bg-black text-white">
        Select an actor
      </option>
      {actors.map((actor) => (
        <option key={actor.id} value={actor.id} className="bg-black text-white">
          {actor.name}
        </option>
      ))}
    </select>
  )}
</div>

          {/* Selected Actor Preview */}
          {selectedActor && (
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h4 className="font-jura font-semibold text-white text-lg">{selectedActor.name}</h4>
                  <p className="text-white/70 font-inter">{selectedActor.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 font-inter">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={disabled || loading || loadingActors}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-inter font-semibold text-lg rounded-xl transition-all duration-200"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-3" />
                Generate Personalized Video
              </>
            )}
          </Button>
        </form>
      </div>
    </Card>
  )
}
