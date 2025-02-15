"use client"

import { motion } from "framer-motion"

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-800 to-primary-600">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-4 cyberpunk-text glitch"
          data-text="Ready to Experience the Future of Assistive Technology?"
        >
          Ready to Experience the Future of Assistive Technology?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl mb-8 holographic"
        >
          Join us in empowering independence through intelligent technology.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="cyberpunk-button text-primary-900 font-bold py-3 px-8 rounded-full text-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Get Started
        </motion.button>
      </div>
    </section>
  )
}

