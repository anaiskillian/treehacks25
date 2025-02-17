"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function Hero() {
  const router = useRouter()

  const handleTryNow = async () => {
    try {
      // Request camera permission first
      await navigator.mediaDevices.getUserMedia({ video: true })
      // If permission granted, navigate to the camera page
      router.push("/camera")
    } catch (error) {
      console.error("Camera permission denied:", error)
      alert("Please allow camera access to use this feature.")
    }
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-bold mb-4 text-white"
        >
          VisionMate
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl mb-8 text-gray-300"
        >
          Empowering independence through intelligent technology
        </motion.p>
        <motion.button
          onClick={handleTryNow}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg"
        >
          Try Now
        </motion.button>
      </div>
    </section>
  )
}
