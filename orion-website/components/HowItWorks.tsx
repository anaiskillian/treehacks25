"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const steps = [
  {
    title: "Data Collection",
    description: "Sensors collect environmental data and user context.",
  },
  {
    title: "AI Processing",
    description: "Advanced edge AI processes the collected data in real-time.",
  },
  {
    title: "Tool Selection",
    description: "The AI agent selects the most appropriate assistive tool.",
  },
  {
    title: "Feedback Delivery",
    description: "The chosen tool provides feedback to the user (Braille, speech, or haptic).",
  },
]

export default function HowItWorks() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <section className="py-20 bg-primary-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 cyberpunk-text glitch" data-text="How It Works">
          How It Works
        </h2>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="relative"
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants} className="flex items-start mb-8">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-primary-900 font-bold text-xl mr-4">
                {index + 1}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 cyberpunk-text">{step.title}</h3>
                <p className="text-primary-100">{step.description}</p>
              </div>
            </motion.div>
          ))}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary-500" />
        </motion.div>
      </div>
    </section>
  )
}

