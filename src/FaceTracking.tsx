import { useEffect } from "react";
import { FaceLandmarker, FaceLandmarkerOptions, FilesetResolver } from "@mediapipe/tasks-vision";
import { Euler, Matrix4 } from "three";

export let blendshapes: any[] = [];
export let rotation: Euler;

let video: HTMLVideoElement;
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

function FaceTracking({ onStreamReady, onFrame }: { onStreamReady: (vid: HTMLVideoElement) => void, onFrame?: (frameData: any) => void }) {
  const setup = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
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

        if (onFrame) {
          onFrame({
            timestamp: nowInMs,
            blendshapes,
            headRotation: { x: rotation.x, y: rotation.y, z: rotation.z },
            // neckRotation can be derived if needed
          });
        }
      }
    }
    window.requestAnimationFrame(predict);
  };

  const handleVideoReady = (vid: HTMLVideoElement) => {
    video = vid;
    video.addEventListener("loadeddata", predict);
    onStreamReady(vid);
  };

  useEffect(() => { setup(); }, []);

  return <video id="video" autoPlay playsInline ref={el => el && handleVideoReady(el)} className="camera-feed w-67 tb:w-400 br-24 m-4" />;
}

export default FaceTracking;
