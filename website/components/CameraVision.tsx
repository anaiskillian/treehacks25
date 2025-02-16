"use client"

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Eye, Type } from "lucide-react"

interface CameraVisionProps {
  onImageCapture: (imageData: string) => void;
}

export default function CameraVision({ onImageCapture }: CameraVisionProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([])
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      // Try to get all video input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      // Select the external camera if available, otherwise use the default camera
      const selectedCamera = videoDevices.length > 1 ? videoDevices[1] : videoDevices[0];

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera?.deviceId,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      onImageCapture(imageData);
      stopCamera();
    }
  }, [onImageCapture, stopCamera]);

  useEffect(() => {
    if (isStreaming) {
      // Simulating object detection
      const timer = setTimeout(() => {
        setDetectedObjects(["Book", "Chair", "Window"])
        setIsStreaming(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isStreaming])

  return (
    <div className="cyberpunk-panel p-4">
      <h2 className="text-2xl font-bold mb-4 cyberpunk-text">Camera Vision</h2>
      <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden mb-4">
        {isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Camera size={64} className="text-gray-600" />
          </div>
        )}
        {isStreaming && <div className="absolute inset-0 border-4 border-purple-500 animate-pulse rounded-lg"></div>}
      </div>
      <div className="flex justify-between mb-4">
        {!isStreaming ? (
          <button
            onClick={startCamera}
            className="cyberpunk-button flex items-center"
          >
            <Camera className="mr-2" /> Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={captureImage}
              className="cyberpunk-button flex items-center"
            >
              <Camera className="mr-2" /> Capture Image
            </button>
            <button
              onClick={stopCamera}
              className="cyberpunk-button flex items-center"
            >
              <Camera className="mr-2" /> Stop Camera
            </button>
          </>
        )}
        <button className="cyberpunk-button flex items-center">
          <Type className="mr-2" /> Text Recognition
        </button>
      </div>
      {detectedObjects.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-2 cyberpunk-text">Detected Objects:</h3>
          <ul className="list-disc list-inside">
            {detectedObjects.map((obj, index) => (
              <li key={index} className="cyberpunk-text">
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

