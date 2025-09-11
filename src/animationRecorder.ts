// src/animationRecorder.ts

/** 
 * Represents a single recorded frame of animation
 */
export interface FrameData {
  time: number; // timestamp in ms
  blendshapes: { [key: string]: number }; // e.g., { "JawOpen": 0.5, "SmileLeft": 0.3 }
  rotation: { x: number; y: number; z: number }; // Euler rotation of the avatar root
}

/** Array of recorded frames */
export let recording: FrameData[] = [];

/** Recording state */
export let isRecording = false;

/**
 * Start recording animation frames
 */
export function startRecording() {
  recording = []; // clear previous recording
  isRecording = true;
  console.log("Animation recording started.");
}

/**
 * Stop recording animation frames
 */
export function stopRecording() {
  isRecording = false;
  console.log(`Animation recording stopped. Total frames: ${recording.length}`);
}

/**
 * Capture a single frame
 * Call this every time you have a new blendshape + rotation update
 * 
 * @param blendshapes Array of Mediapipe blendshapes categories (from FaceTracking.tsx)
 * @param rotation Euler rotation of the avatar root
 */
export function captureFrame(blendshapes: any[], rotation: { x: number; y: number; z: number }) {
  if (!isRecording) return;

  const frame: FrameData = {
    time: performance.now(), // timestamp in ms
    blendshapes: blendshapes.reduce((acc, b) => {
      acc[b.categoryName] = b.score; // convert Mediapipe categories to key-value
      return acc;
    }, {} as { [key: string]: number }),
    rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
  };

  recording.push(frame);
}

/**
 * Get a copy of all recorded frames
 */
export function getRecording(): FrameData[] {
  return [...recording];
}

/**
 * Clear all recorded frames
 */
export function clearRecording() {
  recording = [];
  console.log("Recording cleared.");
}
