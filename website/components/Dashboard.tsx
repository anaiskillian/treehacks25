import { motion } from "framer-motion"
import { Mic, Camera, Book, User, Settings, AlertTriangle } from "lucide-react"

const DashboardIcon = ({ icon: Icon, label, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="flex flex-col items-center cursor-pointer cyberpunk-glow"
    onClick={onClick}
  >
    <Icon size={48} className="mb-2" />
    <span className="cyberpunk-text">{label}</span>
  </motion.div>
)

export default function Dashboard({ setActiveSection }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      <DashboardIcon icon={Camera} label="Camera Vision" onClick={() => setActiveSection("camera")} />
      <DashboardIcon icon={Book} label="Smart Reading" onClick={() => setActiveSection("reading")} />
      <DashboardIcon icon={Mic} label="AI Assistant" onClick={() => setActiveSection("assistant")} />
      <DashboardIcon icon={Settings} label="Preferences" onClick={() => setActiveSection("preferences")} />
      <DashboardIcon icon={AlertTriangle} label="Emergency SOS" onClick={() => setActiveSection("sos")} />
      <DashboardIcon icon={User} label="User Profile" onClick={() => setActiveSection("profile")} />
    </div>
  )
}

