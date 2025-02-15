"use client"

import { useState } from "react"
import { Volume2, Type, Vibrate } from "lucide-react"

export default function UserPreferences() {
  const [preferences, setPreferences] = useState({
    speech: true,
    braille: false,
    haptic: true,
    voiceSpeed: 1,
  })

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="cyberpunk-panel p-4">
      <h2 className="text-2xl font-bold mb-4 cyberpunk-text">User Preferences</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="cyberpunk-text flex items-center">
            <Volume2 className="mr-2" /> Speech Output
          </span>
          <button
            className={`cyberpunk-toggle ${preferences.speech ? "cyberpunk-toggle-active" : ""}`}
            onClick={() => togglePreference("speech")}
          >
            <span className="cyberpunk-toggle-switch" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="cyberpunk-text flex items-center">
            <Type className="mr-2" /> Braille Output
          </span>
          <button
            className={`cyberpunk-toggle ${preferences.braille ? "cyberpunk-toggle-active" : ""}`}
            onClick={() => togglePreference("braille")}
          >
            <span className="cyberpunk-toggle-switch" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="cyberpunk-text flex items-center">
            <Vibrate className="mr-2" /> Haptic Feedback
          </span>
          <button
            className={`cyberpunk-toggle ${preferences.haptic ? "cyberpunk-toggle-active" : ""}`}
            onClick={() => togglePreference("haptic")}
          >
            <span className="cyberpunk-toggle-switch" />
          </button>
        </div>
        <div>
          <label htmlFor="voice-speed" className="block mb-2 cyberpunk-text">
            Voice Speed: {preferences.voiceSpeed.toFixed(1)}x
          </label>
          <input
            id="voice-speed"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={preferences.voiceSpeed}
            onChange={(e) => setPreferences((prev) => ({ ...prev, voiceSpeed: Number.parseFloat(e.target.value) }))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

