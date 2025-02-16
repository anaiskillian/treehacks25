"use client"; // ✅ Ensure this runs only on the client

import { motion, useAnimation } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function Hero() {
  const [isClient, setIsClient] = useState(false); // ✅ Ensure rendering only happens on client
  const [isHovered, setIsHovered] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const buttonControls = useAnimation();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setIsClient(true); // ✅ Only allow rendering after hydration is complete
  }, []);

  const handleTryNowClick = async () => {
    try {
      console.log("🎥 Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (!videoRef.current) {
        console.error("❌ Error: Video element not found.");
        alert("Error: Video element not found.");
        return;
      }

      videoRef.current.srcObject = stream;
      setCameraActive(true); // ✅ Show message when camera starts

      await new Promise((resolve) => (videoRef.current!.onloadedmetadata = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");

      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg");
        sendImageToBackend(imageData);
      }

      stream.getTracks().forEach((track) => track.stop()); // ✅ Stop camera after capture
      setTimeout(() => setCameraActive(false), 2000); // ✅ Hide message after 2 sec
    } catch (error) {
      console.error("❌ Error accessing webcam:", error);
      alert("Please grant webcam permissions to use this feature.");
    }
  };

  // ✅ If not client-side, return an empty component (prevents hydration error)
  if (!isClient) return null;

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
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
          className="cyberpunk-button text-black font-bold py-3 px-6 rounded-full text-lg"
          onClick={handleTryNowClick}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
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

        {cameraActive && <p className="text-green-500 mt-4">📷 Camera is active...</p>}

        <video ref={videoRef} autoPlay playsInline className="hidden"></video>
      </div>
    </section>
  );
}
