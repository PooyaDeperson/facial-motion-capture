import { useEffect, useRef } from "react";
import { FaceLandmarker, FaceLandmarkerOptions, FilesetResolver } from "@mediapipe/tasks-vision";
import { Euler, Matrix4 } from "three";

// --- Exported globals used by Avatar (unchanged) ---
export let blendshapes: any[] = [];
export let rotation: Euler;
export let headMesh: any[] = []; // ← Restored exactly as in original code

// --- FaceLandmarker instance (internal) ---
let faceLandmarker: FaceLandmarker;

const options: FaceLandmarkerOptions = {
  baseOptions: {
    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
    delegate: "GPU",
  },
  numFaces: 1,
  runningMode: "VIDEO",
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: true,
};

interface FaceTrackingProps {
  videoStream: MediaStream | null; // Accept video stream as prop
  onStreamReady: (vid: HTMLVideoElement) => void;
}

export default function FaceTracking({ videoStream, onStreamReady }: FaceTrackingProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastVideoTimeRef = useRef(-1);

  // --- Setup FaceLandmarker ---
  const setupLandmarker = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, options);
  };

  // --- Predict face every frame ---
  const predict = async () => {
    const video = videoRef.current;
    if (!video || !faceLandmarker) return;

    const nowInMs = Date.now();

    // Only process a new frame if video.currentTime has changed
    if (lastVideoTimeRef.current !== video.currentTime) {
      lastVideoTimeRef.current = video.currentTime;
      const result = faceLandmarker.detectForVideo(video, nowInMs);

      // Update blendshapes if detection exists
      if (result.faceBlendshapes?.length && result.faceBlendshapes[0].categories) {
        blendshapes = result.faceBlendshapes[0].categories;

        const matrix = new Matrix4().fromArray(result.facialTransformationMatrixes![0].data);
        rotation = new Euler().setFromRotationMatrix(matrix);
      }
    }

    requestAnimationFrame(predict);
  };

  useEffect(() => {
    if (!videoStream) return; // Wait until a camera stream exists

    const video = videoRef.current!;
    video.srcObject = videoStream; // Update video element with new stream

    // --- Reinitialize Mediapipe tracker whenever the stream changes ---
    setupLandmarker().then(() => {
      video.addEventListener("loadeddata", predict);
      onStreamReady(video);
    });

    return () => {
      // --- Cleanup: remove old event listener and close tracker ---
      video.removeEventListener("loadeddata", predict);
      faceLandmarker?.close();
    };
  }, [videoStream]);

  return <video ref={videoRef} className="camera-feed br-24 m-4" autoPlay playsInline />;
}
