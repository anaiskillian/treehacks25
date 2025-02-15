"use client"

import { useState } from "react"
import { AlertTriangle, Phone } from "lucide-react"

export default function EmergencySOS() {
  const [isSOSActive, setIsSOSActive] = useState(false)

  const toggleSOS = () => {
    setIsSOSActive(!isSOSActive)
    // Here you would typically trigger the actual SOS functionality
    // For this example, we're just simulating the process
    if (!isSOSActive) {
      alert("SOS activated! Emergency contacts will be notified.")
    } else {
      alert("SOS deactivated.")
    }
  }

  return (
    <div className="cyberpunk-panel p-4">
      <h2 className="text-2xl font-bold mb-4 cyberpunk-text">Emergency SOS</h2>
      <div className="flex flex-col items-center">
        <button
          className={`cyberpunk-button w-32 h-32 rounded-full flex items-center justify-center mb-4 ${
            isSOSActive ? "bg-red-600 animate-pulse" : "bg-gray-600"
          }`}
          onClick={toggleSOS}
        >
          <AlertTriangle size={64} />
        </button>
        <p className="cyberpunk-text mb-4">
          {isSOSActive ? "SOS Active - Help is on the way!" : "Press to activate SOS"}
        </p>
        {isSOSActive && (
          <div className="flex items-center">
            <Phone className="mr-2 animate-pulse" />
            <span className="cyberpunk-text">Contacting emergency services...</span>
          </div>
        )}
      </div>
    </div>
  )
}

