"use client"

import { useState } from "react"
import { VideoGenerationForm } from "../components/VideoGenerationForm"
import { StatusDisplay } from "../components/StatusDisplay"
import { Header } from "../components/Header"

export default function Home() {
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)

  const handleVideoGenerated = (requestId: string) => {
    setCurrentRequestId(requestId)
  }

  const handleReset = () => {
    setCurrentRequestId(null)
  }

  return (
    <main className="min-h-screen bg-black">
      <Header />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-jura font-bold text-white mb-6 tracking-tight">
              Create Your Personalized Video
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto font-inter leading-relaxed">
              Generate AI-powered personalized videos with voice cloning and send them directly to WhatsApp. Choose your
              actor, enter your details, and watch the magic happen.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Video Generation Form */}
            <div className="space-y-8">
              <VideoGenerationForm onVideoGenerated={handleVideoGenerated} disabled={!!currentRequestId} />
            </div>

            {/* Status Display */}
            <div className="space-y-8">
              <StatusDisplay requestId={currentRequestId} onReset={handleReset} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
