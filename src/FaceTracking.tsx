// FaceTracking.tsx
import { useEffect, useRef } from "react";
import { FaceLandmarker, FaceLandmarkerOptions, FilesetResolver } from "@mediapipe/tasks-vision";
import { Euler, Matrix4 } from "three";

export let blendshapes: any[] = [];
export let rotation: Euler | undefined;
export let headMesh: any[] = [];

let faceLandmarker: FaceLandmarker | null = null;
let lastVideoTime = -1;
let frameCount = 0;

const CPU_ONLY_OPTIONS: FaceLandmarkerOptions = {
  baseOptions: {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    delegate: "CPU", // FORCED CPU
  },
  numFaces: 1,
  runningMode: "VIDEO",
  // tuned for stability; adjust if needed
  minFaceDetectionConfidence: 0.4,
  minFacePresenceConfidence: 0.35,
  minTrackingConfidence: 0.3,
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: true,
};

function FaceTracking({
  videoStream,
  onMediapipeReady,
}: {
  videoStream: MediaStream;
  onMediapipeReady?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const setupFaceLandmarkerCPU = async () => {
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        // pinned wasm fileset; adjust version if you want to test other versions
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      // close any existing instance first
      if (faceLandmarker) {
        try {
          faceLandmarker.close();
        } catch (e) {
          console.warn("Error closing previous FaceLandmarker:", e);
        }
        faceLandmarker = null;
      }

      faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, CPU_ONLY_OPTIONS);
      console.log("✅ FaceLandmarker initialized (CPU).");

      if (onMediapipeReady) onMediapipeReady();
    } catch (err) {
      console.error("Failed to initialize FaceLandmarker (CPU):", err);
      faceLandmarker = null;
    }
  };

  const predict = () => {
    const vid = videoRef.current;
    if (!vid || !faceLandmarker) {
      requestAnimationFrame(predict);
      return;
    }

    const nowInMs = performance.now();
    // only process when video time changes to avoid duplicate frames
    if (lastVideoTime !== vid.currentTime) {
      lastVideoTime = vid.currentTime;

      try {
        const result = faceLandmarker.detectForVideo(vid, nowInMs);

        // update blendshapes
        if (result.faceBlendshapes?.length && result.faceBlendshapes[0].categories) {
          blendshapes = result.faceBlendshapes[0].categories;
        }

        // update rotation from facial transformation matrix
        const mData = result.facialTransformationMatrixes?.[0]?.data;
        if (mData && mData.length === 16) {
          const matrix = new Matrix4().fromArray(mData);
          const e = new Euler().setFromRotationMatrix(matrix);
          // basic sanity check
          if (Number.isFinite(e.x) && Number.isFinite(e.y) && Number.isFinite(e.z)) {
            rotation = e;
          } else {
            console.warn("Non-finite rotation detected; rotation ignored.", e);
          }
        }

        // simple heuristic: if nothing updated for many frames, try reinit (still CPU)
        frameCount++;
        if (frameCount % 1000 === 0) {
          console.log("🔁 Periodic CPU re-init (testing).");
          setupFaceLandmarkerCPU();
        }

      } catch (e) {
        console.error("Error during detectForVideo; attempting CPU re-init:", e);
        // try to reinitialize once on CPU (avoid infinite loop)
        setupFaceLandmarkerCPU();
      }
    }

    requestAnimationFrame(predict);
  };

  useEffect(() => {
    if (!videoStream) return;
    const vid = videoRef.current;
    if (!vid) return;

    // set up video element
    vid.srcObject = videoStream;
    vid.playsInline = true;
    vid.muted = true;
    vid.autoplay = true;

    // Do NOT force a transform here unless you intentionally want mirroring.
    // Leave orientation as-is for testing CPU behavior.

    const onLoaded = async () => {
      // ALWAYS use CPU for testing
      await setupFaceLandmarkerCPU();
      // start loop
      requestAnimationFrame(predict);
    };

    vid.addEventListener("loadeddata", onLoaded);

    return () => {
      vid.removeEventListener("loadeddata", onLoaded);
      // cleanup mediapipe instance
      if (faceLandmarker) {
        try {
          faceLandmarker.close();
        } catch (e) {
          console.warn("Error closing FaceLandmarker on unmount:", e);
        }
        faceLandmarker = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoStream]); // re-run when video stream changes

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
