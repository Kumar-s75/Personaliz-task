import { Video, Zap } from "lucide-react"

export function Header() {
  return (
    <header className="bg-black/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-jura font-bold text-white tracking-tight">Personaliz</h1>
              <p className="text-sm text-white/60 font-inter">AI Video Generation</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm text-white/60 font-inter">
            <Zap className="w-5 h-5 text-primary" />
            <span>Powered by SyncLabs & WhatsApp</span>
          </div>
        </div>
      </div>
    </header>
  )
}
