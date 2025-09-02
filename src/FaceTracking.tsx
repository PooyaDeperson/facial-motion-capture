// FaceTracking.tsx
import { useEffect } from "react";
import { FaceLandmarker, FaceLandmarkerOptions, FilesetResolver } from "@mediapipe/tasks-vision";
import { Euler, Matrix4 } from "three";

export let blendshapes: any[] = [];
export let rotation: Euler;
export let headMesh: any[] = [];

let video: HTMLVideoElement;
let faceLandmarker: FaceLandmarker;
let lastVideoTime = -1;

const options: FaceLandmarkerOptions = {
  baseOptions: {
    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
    delegate: "GPU"
  },
  numFaces: 1,
  runningMode: "VIDEO",
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: true,
};

async function setup() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, options);
}

async function predict() {
  let nowInMs = Date.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    const result = faceLandmarker.detectForVideo(video, nowInMs);

    if (result.faceBlendshapes?.length && result.faceBlendshapes[0].categories) {
      blendshapes = result.faceBlendshapes[0].categories;
      const matrix = new Matrix4().fromArray(result.facialTransformationMatrixes![0].data);
      rotation = new Euler().setFromRotationMatrix(matrix);
    }
  }
  window.requestAnimationFrame(predict);
}

export function useFaceTracking(onStreamReady: (vid: HTMLVideoElement) => void) {
  useEffect(() => { setup(); }, []);

  const handleStreamReady = (vid: HTMLVideoElement) => {
    video = vid;
    video.addEventListener("loadeddata", predict);
    onStreamReady(vid);
  };

  return { handleStreamReady };
}
