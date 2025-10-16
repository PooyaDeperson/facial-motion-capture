// FaceTracking.tsx
import { useEffect, useRef } from "react";
import { FaceLandmarker, FaceLandmarkerOptions, FilesetResolver } from "@mediapipe/tasks-vision";
import { Euler, Matrix4 } from "three";

export let blendshapes: any[] = [];
export let rotation: Euler;
export let headMesh: any[] = [];

let faceLandmarker: FaceLandmarker | null = null;
let lastVideoTime = -1;
let frameCount = 0;

function isProblematicSamsung() {
  const ua = navigator.userAgent.toLowerCase();
  return /samsung|sm-s92|sm-s93|sm-s94|sm-s25|sm-s24/.test(ua);
}

const getOptions = (delegate: "CPU" | "GPU"): FaceLandmarkerOptions => ({
  baseOptions: {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    delegate,
  },
  numFaces: 1,
  runningMode: "VIDEO",
  minFaceDetectionConfidence: 0.4,
  minFacePresenceConfidence: 0.4,
  minTrackingConfidence: 0.3,
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: true,
});

function FaceTracking({
  videoStream,
  onMediapipeReady,
}: {
  videoStream: MediaStream;
  onMediapipeReady?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const delegateRef = useRef<"CPU" | "GPU">("GPU");

  const setupFaceLandmarker = async (delegate: "CPU" | "GPU" = "GPU") => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, getOptions(delegate));
    delegateRef.current = delegate;

    if (onMediapipeReady) onMediapipeReady();
  };

  const reinitializeWithCPU = async () => {
    console.warn("⚠️ GPU delegate may be unstable, switching to CPU...");
    if (faceLandmarker) faceLandmarker.close();
    await setupFaceLandmarker("CPU");
  };

  const predict = () => {
    const vid = videoRef.current;
    if (!vid || !faceLandmarker) return;

    const nowInMs = performance.now();
    if (lastVideoTime !== vid.currentTime) {
      lastVideoTime = vid.currentTime;
      const result = faceLandmarker.detectForVideo(vid, nowInMs);

      if (result.faceBlendshapes?.length && result.faceBlendshapes[0].categories) {
        blendshapes = result.faceBlendshapes[0].categories;

        const mData = result.facialTransformationMatrixes?.[0]?.data;
        if (mData && mData.length === 16) {
          const matrix = new Matrix4().fromArray(mData);
          rotation = new Euler().setFromRotationMatrix(matrix);
        }
      }

      // Sanity check: if pose freezes or gets NaN, reset tracking
      if (!rotation || isNaN(rotation.x) || isNaN(rotation.y) || isNaN(rotation.z)) {
        console.warn("🌀 Detected invalid rotation matrix, resetting tracking...");
        setupFaceLandmarker(delegateRef.current);
      }

      // Periodic reinit to avoid drift / freeze every ~500 frames
      frameCount++;
      if (frameCount % 500 === 0) {
        console.log("🔁 Periodic tracking reset...");
        setupFaceLandmarker(delegateRef.current);
      }
    }

    requestAnimationFrame(predict);
  };

  useEffect(() => {
    if (!videoStream) return;
    const vid = videoRef.current;
    if (!vid) return;

    vid.srcObject = videoStream;
    vid.playsInline = true;
    vid.muted = true;
    vid.autoplay = true;
    vid.style.transform = "scaleX(-1)"; // Mirror once; Samsung sometimes auto-mirrors

    vid.onloadeddata = async () => {
      // Detect problematic device
      const useCPU = isProblematicSamsung();
      await setupFaceLandmarker(useCPU ? "CPU" : "GPU");
      predict();
    };

    return () => {
      if (faceLandmarker) {
        faceLandmarker.close();
        faceLandmarker = null;
      }
    };
  }, [videoStream]);

  return (
    <video
      ref={videoRef}
      id="video"
      className="camera-feed w-1 tb:w-400 br-12 tb:br-24 m-4"
      autoPlay
      playsInline
      muted
    />
  );
}

export default FaceTracking;
