"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import OpenAI from "openai"

export default function CameraVision() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [description, setDescription] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"describe" | "read">("describe")

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      // Try external camera first, fall back to default if not available
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      const constraints = {
        video: videoDevices.length > 1 
          ? { deviceId: { exact: videoDevices[1].deviceId } }
          : true
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setError("Error: Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream
    stream?.getTracks().forEach(track => track.stop())
  }

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL("image/jpeg").split(",")[1]
  }

  const analyzeImage = async () => {
    if (isAnalyzing) return
    setIsAnalyzing(true)
    setError(null)

    const frame = captureFrame()
    if (!frame) {
      setError("Failed to capture frame")
      setIsAnalyzing(false)
      return
    }

    try {
      const prompt = mode === "describe" 
        ? "What is in this image? Give a two sentence summary."
        : "Only give the complete text for the following image."

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${frame}` },
              },
            ],
          },
        ],
      })

      const result = response.choices[0].message.content
      setDescription(result || "No description available")

      // Generate speech using OpenAI TTS
      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: result || "No description available",
      })

      // Convert the binary response to a blob and play it
      const audioBlob = new Blob([await speech.arrayBuffer()], { type: 'audio/mp3' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()

    } catch (error: any) {
      console.error("Error in analysis:", error)
      setError(error.message || "Failed to analyze image")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-lg overflow-hidden"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute bottom-4 left-4 space-x-4">
          <button
            onClick={() => setMode("describe")}
            className={`px-4 py-2 rounded ${
              mode === "describe" ? "bg-blue-500" : "bg-gray-500"
            } text-white`}
          >
            Describe Scene
          </button>
          <button
            onClick={() => setMode("read")}
            className={`px-4 py-2 rounded ${
              mode === "read" ? "bg-blue-500" : "bg-gray-500"
            } text-white`}
          >
            Read Text
          </button>
          <button
            onClick={analyzeImage}
            className="px-4 py-2 rounded bg-green-500 text-white"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800 p-6 rounded-lg"
      >
        <h2 className="text-2xl font-bold mb-3 text-white">
          {mode === "describe" ? "Scene Description:" : "Text Content:"}
        </h2>
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <p className="text-xl text-white">
            {description || "Click Analyze to process the scene"}
          </p>
        )}
      </motion.div>
    </div>
  )
}

