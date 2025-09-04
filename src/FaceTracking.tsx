import { useEffect } from "react";
import {
  FaceLandmarker,
  FaceLandmarkerOptions,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import { Euler, Matrix4 } from "three";

// Shared globals — Avatar still uses these
export let blendshapes: any[] = [];
export let rotation: Euler;
export let headMesh: any[] = [];

// Internal Mediapipe variables
let faceLandmarker: FaceLandmarker;
let lastVideoTime = -1;

// Options for Mediapipe FaceLandmarker
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
  videoElement: HTMLVideoElement;
}

function FaceTracking({ videoElement }: FaceTrackingProps) {
  const setup = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(
      filesetResolver,
      options
    );
    startPrediction();
  };

  const startPrediction = () => {
    const predict = async () => {
      if (!videoElement || !faceLandmarker) return;

      const nowInMs = Date.now();
      if (lastVideoTime !== videoElement.currentTime) {
        lastVideoTime = videoElement.currentTime;
        const result = faceLandmarker.detectForVideo(videoElement, nowInMs);

        if (result.faceBlendshapes?.length && result.faceBlendshapes[0].categories) {
          blendshapes = result.faceBlendshapes[0].categories;

          const matrix = new Matrix4().fromArray(
            result.facialTransformationMatrixes![0].data
          );
          rotation = new Euler().setFromRotationMatrix(matrix);
        }
      }
      window.requestAnimationFrame(predict);
    };

    window.requestAnimationFrame(predict);
  };

  useEffect(() => {
    if (videoElement) {
      setup();
    }
  }, [videoElement]);

  return null; // no extra <video> rendered
}

export default FaceTracking;
