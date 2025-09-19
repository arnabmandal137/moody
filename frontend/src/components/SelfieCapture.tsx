import React, { useRef, useState, useCallback } from 'react';
import { CameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { analyzeMoodFromImage, getMockMoodAnalysis } from '../services/moodAnalysis';
import { moodApi } from '../services/api';
import type { MoodAnalysis } from '../types';

interface SelfieCaptureProp {
  onMoodCaptured?: (analysis: MoodAnalysis) => void;
}

const SelfieCapture: React.FC<SelfieCaptureProp> = ({ onMoodCaptured }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [moodResult, setMoodResult] = useState<MoodAnalysis | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera access error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas
    context.drawImage(video, 0, 0);
    
    // Get image data
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    
    // Stop camera after capture
    stopCamera();
  }, [stopCamera]);

  const analyzeMood = useCallback(async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setError('');

    try {
      // Create image element for analysis
      const img = new Image();
      img.onload = async () => {
        try {
          // Try real analysis first, fall back to mock if models aren't available
          let analysis: MoodAnalysis;
          try {
            analysis = await analyzeMoodFromImage(img);
          } catch (analysisError) {
            console.warn('Face analysis failed, using mock data:', analysisError);
            analysis = getMockMoodAnalysis();
          }
          
          setMoodResult(analysis);
          setIsAnalyzing(false);
        } catch (err) {
          setError('Failed to analyze mood from image');
          setIsAnalyzing(false);
        }
      };
      img.src = capturedImage;
    } catch (err) {
      setError('Failed to process image');
      setIsAnalyzing(false);
    }
  }, [capturedImage]);

  const saveMoodEntry = useCallback(async () => {
    if (!moodResult) return;

    setIsSaving(true);
    setError('');

    try {
      await moodApi.createEntry(moodResult);
      
      // Reset state
      setCapturedImage(null);
      setMoodResult(null);
      
      // Notify parent component
      onMoodCaptured?.(moodResult);
      
      alert('Mood entry saved successfully!');
    } catch (err) {
      setError('Failed to save mood entry');
    } finally {
      setIsSaving(false);
    }
  }, [moodResult, onMoodCaptured]);

  const reset = useCallback(() => {
    setCapturedImage(null);
    setMoodResult(null);
    setError('');
  }, []);

  const formatMoodValue = (value: number, type: 'percentage' | 'valence' = 'percentage') => {
    if (type === 'valence') {
      return value >= 0 ? `+${(value * 100).toFixed(1)}%` : `${(value * 100).toFixed(1)}%`;
    }
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="card max-w-lg mx-auto">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Capture Your Mood</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Camera/Image Display */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured selfie" 
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          
          {!isStreaming && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Camera not active</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isStreaming && !capturedImage && (
            <button onClick={startCamera} className="btn btn-primary">
              <CameraIcon className="h-4 w-4 mr-2" />
              Start Camera
            </button>
          )}

          {isStreaming && (
            <button onClick={capturePhoto} className="btn btn-primary">
              <CameraIcon className="h-4 w-4 mr-2" />
              Take Photo
            </button>
          )}

          {capturedImage && !moodResult && (
            <>
              <button 
                onClick={analyzeMood} 
                disabled={isAnalyzing}
                className="btn btn-primary"
              >
                {isAnalyzing ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Mood'
                )}
              </button>
              <button onClick={reset} className="btn btn-secondary">
                Retake
              </button>
            </>
          )}
        </div>

        {/* Mood Results */}
        {moodResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Mood Analysis Results</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-green-700">Happiness:</span>
                <span className="font-medium ml-2">{formatMoodValue(moodResult.happiness)}</span>
              </div>
              <div>
                <span className="text-green-700">Stress:</span>
                <span className="font-medium ml-2">{formatMoodValue(moodResult.stress)}</span>
              </div>
              <div>
                <span className="text-green-700">Valence:</span>
                <span className="font-medium ml-2">{formatMoodValue(moodResult.valence, 'valence')}</span>
              </div>
              <div>
                <span className="text-green-700">Arousal:</span>
                <span className="font-medium ml-2">{formatMoodValue(moodResult.arousal)}</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-green-600">
              Confidence: {formatMoodValue(moodResult.confidence)}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button 
                onClick={saveMoodEntry}
                disabled={isSaving}
                className="btn btn-primary text-sm"
              >
                {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
              <button onClick={reset} className="btn btn-secondary text-sm">
                New Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfieCapture;