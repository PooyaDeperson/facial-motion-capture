import { useEffect } from "react";
import { FaceLandmarker, FaceLandmarkerOptions, FilesetResolver } from "@mediapipe/tasks-vision";
import { Euler, Matrix4 } from "three";

// Shared globals — Avatar still uses these
export let blendshapes: any[] = [];
export let rotation: Euler;
export let headMesh: any[] = [];

// Internal Mediapipe variables
let video: HTMLVideoElement;
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

function FaceTracking({ onStreamReady }: { onStreamReady: (vid: HTMLVideoElement) => void }) {
  const setup = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, options);
  };

  const predict = async () => {
    const nowInMs = Date.now();
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
  };

  const handleVideoReady = (vid: HTMLVideoElement) => {
    video = vid;
    video.addEventListener("loadeddata", predict);
    onStreamReady(vid);
  };

  useEffect(() => {
    setup();
  }, []);

  return (
    <video
      className="camera-feed w-67 tb:w-400 br-24 m-4"
      id="video"
      autoPlay
      playsInline
      ref={(el) => {
        if (el) handleVideoReady(el);
      }}
    ></video>
  );
}

export default FaceTracking;
