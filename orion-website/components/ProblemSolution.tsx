"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export default function ProblemSolution() {
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-20 bg-primary-900">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-12"
        >
          <motion.div variants={itemVariants} className="cyberpunk-panel p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4 cyberpunk-text glitch" data-text="The Problem">
              The Problem
            </h2>
            <p className="text-primary-100">
              Blind and visually impaired individuals face immense challenges in navigating everyday environments and
              accessing information. Current assistive technologies often require users to manually switch between
              multiple tools, creating frustration and inefficiency.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="cyberpunk-panel p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4 cyberpunk-text glitch" data-text="Our Solution">
              Our Solution
            </h2>
            <p className="text-primary-100">
              AssistiveAI is an intelligent, context-aware AI agent that helps blind and visually impaired users by
              automatically selecting and using the most appropriate tool for the situation. The agent offers seamless
              transitions between Braille, speech-to-text, and haptic feedback, depending on the user's context.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

