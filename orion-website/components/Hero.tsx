"use client"

import { motion, useAnimation } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export default function Hero() {
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

  const handleTryNowClick = () => {
    alert("Orion AI is launching... Prepare for an immersive experience!")
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-bold mb-4 cyberpunk-text glitch neon-text"
          data-text="Orion"
        >
          Orion
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
          className="cyberpunk-button text-black font-bold py-3 px-6 rounded-full text-lg"
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
          onClick={handleTryNowClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Try Now
          <motion.span
            className="absolute inset-0 bg-primary-300 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={isHovered ? { scale: 1.5, opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </motion.button>
      </div>
    </section>
  )
}

