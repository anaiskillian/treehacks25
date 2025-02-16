"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Eye, Type } from "lucide-react"

export default function CameraVision() {
  const [isScanning, setIsScanning] = useState(false)
  const [detectedObjects, setDetectedObjects] = useState([])
  const videoRef = useRef(null)

  useEffect(() => {
    if (isScanning) {
      // Simulating object detection
      const timer = setTimeout(() => {
        setDetectedObjects(["Book", "Chair", "Window"])
        setIsScanning(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isScanning])

  const startScanning = () => {
    setIsScanning(true)
    // Here you would typically start the actual camera feed and object detection
    // For this example, we're just simulating the process
  }

  return (
    <div className="cyberpunk-panel p-4">
      <h2 className="text-2xl font-bold mb-4 cyberpunk-text">Camera Vision</h2>
      <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden mb-4">
        {isScanning ? (
          <video ref={videoRef} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Camera size={64} className="text-gray-600" />
          </div>
        )}
        {isScanning && <div className="absolute inset-0 border-4 border-purple-500 animate-pulse rounded-lg"></div>}
      </div>
      <div className="flex justify-between mb-4">
        <button className="cyberpunk-button flex items-center" onClick={startScanning}>
          <Eye className="mr-2" /> Scan Environment
        </button>
        <button className="cyberpunk-button flex items-center">
          <Type className="mr-2" /> Text Recognition
        </button>
      </div>
      {detectedObjects.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-2 cyberpunk-text">Detected Objects:</h3>
          <ul className="list-disc list-inside">
            {detectedObjects.map((obj, index) => (
              <li key={index} className="cyberpunk-text">
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

