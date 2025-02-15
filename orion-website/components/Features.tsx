"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Eye, MessageSquare, Zap, Watch } from "lucide-react"

const features = [
  {
    icon: Eye,
    title: "Vision/Text to Braille",
    description: "Convert visual content into Braille for tactile feedback.",
  },
  {
    icon: MessageSquare,
    title: "Vision to Speech",
    description: "Convert visual content into speech output for auditory feedback.",
  },
  {
    icon: Zap,
    title: "Dynamic Agent Framework",
    description: "AI agent decides the most appropriate tool based on the environment.",
  },
  {
    icon: Watch,
    title: "Apple Watch App",
    description: "Utilize vibration and proximity sensing to alert users about dangers.",
  },
]

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-20 bg-primary-800">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 cyberpunk-text glitch" data-text="Key Features">
          Key Features
        </h2>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} className="cyberpunk-panel p-6 rounded-lg">
              <feature.icon className="w-12 h-12 text-primary-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2 cyberpunk-text">{feature.title}</h3>
              <p className="text-primary-100">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

