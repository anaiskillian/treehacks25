"use client"

import { useState, useEffect } from "react"
import { Mic, Send } from "lucide-react"

export default function AIAssistant() {
  const [input, setInput] = useState("")
  const [conversation, setConversation] = useState([])
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    if (isListening) {
      // Simulating speech recognition
      const timer = setTimeout(() => {
        setInput("Where am I?")
        setIsListening(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isListening])

  const handleSend = () => {
    if (input.trim()) {
      setConversation([...conversation, { type: "user", text: input }])
      // Here you would typically send the input to your AI backend and get a response
      // For this example, we're just simulating the process
      setTimeout(() => {
        setConversation((prev) => [
          ...prev,
          {
            type: "ai",
            text: "Based on your GPS location, you are currently at 123 Main Street. There's a coffee shop to your right and a crosswalk 10 meters ahead.",
          },
        ])
      }, 1000)
      setInput("")
    }
  }

  const startListening = () => {
    setIsListening(true)
    // Here you would typically start the actual speech recognition
  }

  return (
    <div className="cyberpunk-panel p-4">
      <h2 className="text-2xl font-bold mb-4 cyberpunk-text">AI Assistant</h2>
      <div className="h-64 overflow-y-auto mb-4 cyberpunk-panel p-2">
        {conversation.map((message, index) => (
          <div key={index} className={`mb-2 ${message.type === "user" ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block p-2 rounded-lg ${message.type === "user" ? "bg-purple-600" : "bg-gray-700"}`}
            >
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="cyberpunk-input flex-grow mr-2"
          placeholder="Ask me anything..."
        />
        <button className="cyberpunk-button mr-2" onClick={handleSend}>
          <Send />
        </button>
        <button className={`cyberpunk-button ${isListening ? "animate-pulse" : ""}`} onClick={startListening}>
          <Mic />
        </button>
      </div>
    </div>
  )
}

