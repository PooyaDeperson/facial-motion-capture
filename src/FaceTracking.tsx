// src/FaceTracking.tsx
import { useEffect, useRef } from "react";
import { FaceLandmarker, FaceLandmarkerOptions, FilesetResolver } from "@mediapipe/tasks-vision";
import { Euler, Matrix4 } from "three";
import { captureFrame } from "./animationRecorder";

export let blendshapes: any[] = [];
export let rotation = { x: 0, y: 0, z: 0 };
export let headMesh: any[] = [];

let faceLandmarker: FaceLandmarker;
let lastVideoTime = -1;

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

function FaceTracking({ videoStream }: { videoStream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const setupFaceLandmarker = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, options);
  };

  const predict = () => {
    const vid = videoRef.current;
    if (!vid || !faceLandmarker) return;

    const nowInMs = Date.now();
    if (lastVideoTime !== vid.currentTime) {
      lastVideoTime = vid.currentTime;
      const result = faceLandmarker.detectForVideo(vid, nowInMs);

      if (result.faceBlendshapes?.length && result.faceBlendshapes[0].categories) {
        blendshapes = result.faceBlendshapes[0].categories;
        const matrix = new Matrix4().fromArray(result.facialTransformationMatrixes![0].data);
        const euler = new Euler().setFromRotationMatrix(matrix);
        rotation = { x: euler.x, y: euler.y, z: euler.z };
        captureFrame(blendshapes, rotation);
      }
    }
    requestAnimationFrame(predict);
  };

  useEffect(() => {
    if (!videoStream) return;
    const vid = videoRef.current;
    if (!vid) return;
    vid.srcObject = videoStream;
    vid.onloadeddata = () => {
      setupFaceLandmarker().then(predict);
    };
  }, [videoStream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      id="video"
      className="camera-feed w-1 tb:w-400 br-12 tb:br-24 m-4"
      style={{}}
    />
  );
}

export default FaceTracking;
