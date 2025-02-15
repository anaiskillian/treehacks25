"use client"

import { useState } from "react"
import { Upload, PlayCircle, PauseCircle, SkipForward, SkipBack } from "lucide-react"

export default function SmartReading() {
  const [text, setText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [readingSpeed, setReadingSpeed] = useState(1)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    // Here you would typically process the file and extract text
    // For this example, we're just simulating the process
    setText(
      "This is a sample text extracted from the uploaded document. Orion's AI can convert various document formats into readable text.",
    )
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    // Here you would typically start or pause the text-to-speech
  }

  return (
    <div className="cyberpunk-panel p-4">
      <h2 className="text-2xl font-bold mb-4 cyberpunk-text">Smart Reading</h2>
      <div className="mb-4">
        <label htmlFor="file-upload" className="cyberpunk-button flex items-center justify-center cursor-pointer">
          <Upload className="mr-2" /> Upload Document
        </label>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
      </div>
      {text && (
        <div>
          <div className="cyberpunk-panel p-4 mb-4">
            <p className="cyberpunk-text">{text}</p>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button className="cyberpunk-button" onClick={() => setReadingSpeed(Math.max(0.5, readingSpeed - 0.1))}>
              <SkipBack />
            </button>
            <button className="cyberpunk-button" onClick={togglePlayPause}>
              {isPlaying ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
            </button>
            <button className="cyberpunk-button" onClick={() => setReadingSpeed(Math.min(2, readingSpeed + 0.1))}>
              <SkipForward />
            </button>
          </div>
          <div className="flex items-center">
            <span className="mr-2 cyberpunk-text">Speed: {readingSpeed.toFixed(1)}x</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={readingSpeed}
              onChange={(e) => setReadingSpeed(Number.parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}

