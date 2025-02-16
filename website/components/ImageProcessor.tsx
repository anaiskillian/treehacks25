"use client"

import { useState, useRef } from 'react';
import CameraVision from './CameraVision';

export default function ImageProcessor() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useCamera, setUseCamera] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const processImage = async (imageData: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Convert base64 to blob
      const base64Response = await fetch(imageData);
      const blob = await base64Response.blob();

      // Create a File object
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/image-processing', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      setResult(data.result);

      if (data.audioUrl && audioRef.current) {
        audioRef.current.src = data.audioUrl;
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setUseCamera(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        processImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4">
      {!useCamera ? (
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4"
          />
          <button
            onClick={() => setUseCamera(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ml-4"
          >
            Use Camera
          </button>
        </div>
      ) : (
        <CameraVision onImageCapture={processImage} />
      )}

      {isLoading && <div>Processing image...</div>}
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Result:</h3>
          <p>{result}</p>
        </div>
      )}

      <audio ref={audioRef} controls className="mt-4" />
    </div>
  );
} 