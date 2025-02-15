import Hero from "@/components/Hero"
import ProblemSolution from "@/components/ProblemSolution"
import Features from "@/components/Features"
import HowItWorks from "@/components/HowItWorks"
import CTA from "@/components/CTA"

export default function Home() {
  return (
    <main className="min-h-screen bg-primary-900 text-primary-100">
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <CTA />
    </main>
  )
}

