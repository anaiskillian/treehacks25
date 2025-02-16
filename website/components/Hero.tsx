"use client";
import axios from "axios";

import { motion, useAnimation } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function Hero() {
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const buttonControls = useAnimation();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setIsClient(true);

    // ✅ Listen for the "S" key to take a screenshot
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "s") {
        console.log("📸 'S' key pressed - Capturing Screenshot");
        captureImage();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
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
      setCameraActive(true);
    } catch (error) {
      console.error("❌ Error accessing webcam:", error);
      alert("Please grant webcam permissions to use this feature.");
    }
  };

  const captureImage = () => {
    if (!videoRef.current) {
      console.error("❌ Error: No video stream found.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");

    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
      sendImageToBackend(imageData);
    }
  };

  const sendImageToBackend = async (imageData: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://your-vercel-app.vercel.app/api/process-image";
  
    try {
      const response = await axios.post(backendUrl, {
        image: imageData, // Send the image data in the request body
      }, {
        headers: { "Content-Type": "application/json" },  // ✅ Ensure proper headers
      });
  
      alert(`Python script output: ${response.data.message}`);
    } catch (error) {
      console.error("Error sending image:", error);
      alert(`Failed to send image: ${error.response?.data?.error || error.message}`);
    }
  };  

  if (!isClient) return null;

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
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

        {cameraActive && <p className="text-green-500 mt-4">📷 Camera is active... Press "S" to take a screenshot.</p>}

        {/* ✅ Now the camera will always be visible */}
        <video ref={videoRef} autoPlay playsInline className="border border-gray-300 rounded-md shadow-lg mt-4"></video>
      </div>
    </section>
  );
}
