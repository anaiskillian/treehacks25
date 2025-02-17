"use client"

import { motion, useAnimation } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function Hero() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const buttonControls = useAnimation()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const particleCount = 100

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 5 + 1
        this.speedX = Math.random() * 3 - 1.5
        this.speedY = Math.random() * 3 - 1.5
        this.color = `hsl(195, 41%, ${Math.random() * 50 + 25}%)`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.size > 0.2) this.size -= 0.1
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }

      draw() {
        ctx.fillStyle = this.color
        ctx.strokeStyle = this.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }
    }

    function init() {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()
        if (particles[i].size <= 0.2) {
          particles.splice(i, 1)
          i--
          particles.push(new Particle())
        }
      }
      requestAnimationFrame(animate)
    }

    init()
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleHoverStart = () => {
    setIsHovered(true)
    buttonControls.start({
      scale: 1.1,
      transition: { duration: 0.2 },
    })
  }

  const handleHoverEnd = () => {
    setIsHovered(false)
    buttonControls.start({
      scale: 1,
      transition: { duration: 0.2 },
    })
  }

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
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* Navigation Links */}
      <div className="absolute top-8 left-0 right-0 z-20 flex justify-center gap-6">
        <motion.a
          href="https://youtu.be/B5CtpyK8U3E"
          target="_blank"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="cyberpunk-button text-white font-bold py-3 px-6 rounded-lg text-lg bg-red-500 hover:bg-red-600 transition-colors"
        >
          Demo
        </motion.a>
        <motion.a
          href="https://github.com/anaiskillian/treehacks25"
          target="_blank"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="cyberpunk-button text-white font-bold py-3 px-6 rounded-lg text-lg bg-purple-500 hover:bg-purple-600 transition-colors"
        >
          GitHub
        </motion.a>
        <motion.a
          href="https://devpost.com/software/orion-pcwlg3"
          target="_blank"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="cyberpunk-button text-white font-bold py-3 px-6 rounded-lg text-lg bg-blue-500 hover:bg-blue-600 transition-colors"
        >
          Devpost
        </motion.a>
      </div>

      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-bold mb-4 cyberpunk-text glitch neon-text"
          data-text="VisionMate"
        >
          VisionMate
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl mb-8 holographic"
        >
          Empowering independence through intelligent technology
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="cyberpunk-button text-white font-bold py-3 px-6 rounded-full text-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
          onClick={handleTryNow}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Try Now
          <motion.span
            className="absolute inset-0 bg-white rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={isHovered ? { scale: 1.5, opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </motion.button>
      </div>
    </section>
  )
}
