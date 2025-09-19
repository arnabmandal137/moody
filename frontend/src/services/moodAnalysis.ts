import * as faceapi from 'face-api.js';
import { MoodAnalysis } from '../types';

let modelsLoaded = false;

export const loadFaceApiModels = async (): Promise<void> => {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = '/models';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log('Face-api models loaded successfully');
  } catch (error) {
    console.error('Error loading face-api models:', error);
    throw new Error('Failed to load mood analysis models');
  }
};

export const analyzeMoodFromImage = async (imageElement: HTMLImageElement | HTMLVideoElement): Promise<MoodAnalysis> => {
  if (!modelsLoaded) {
    await loadFaceApiModels();
  }

  try {
    const detections = await faceapi
      .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    if (detections.length === 0) {
      throw new Error('No face detected in the image');
    }

    // Use the first detected face
    const detection = detections[0];
    const expressions = detection.expressions;

    // Calculate mood metrics based on facial expressions
    const happiness = expressions.happy;
    const stress = Math.max(expressions.angry, expressions.fearful, expressions.disgusted);
    
    // Valence: positive emotions vs negative emotions
    const positiveEmotions = expressions.happy;
    const negativeEmotions = expressions.sad + expressions.angry + expressions.fearful + expressions.disgusted;
    const valence = positiveEmotions - negativeEmotions; // Range: -1 to 1
    
    // Arousal: high energy emotions vs low energy emotions
    const highArousal = expressions.angry + expressions.fearful + expressions.surprised;
    const lowArousal = expressions.sad + expressions.neutral;
    const arousal = Math.min(1, (highArousal + expressions.happy * 0.5) / (highArousal + lowArousal + 0.1));
    
    // Confidence based on detection confidence
    const confidence = detection.detection.score;

    return {
      happiness: Math.round(happiness * 1000) / 1000,
      stress: Math.round(stress * 1000) / 1000,
      valence: Math.round(valence * 1000) / 1000,
      arousal: Math.round(arousal * 1000) / 1000,
      confidence: Math.round(confidence * 1000) / 1000,
    };
  } catch (error) {
    console.error('Error analyzing mood:', error);
    throw new Error('Failed to analyze mood from image');
  }
};

// Mock analysis for development/testing when models aren't available
export const getMockMoodAnalysis = (): MoodAnalysis => {
  return {
    happiness: Math.random() * 0.8 + 0.1, // 0.1 to 0.9
    stress: Math.random() * 0.6, // 0 to 0.6
    valence: (Math.random() - 0.5) * 1.6, // -0.8 to 0.8
    arousal: Math.random() * 0.8 + 0.1, // 0.1 to 0.9
    confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
  };
};