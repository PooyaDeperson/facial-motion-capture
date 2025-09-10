import React, { useRef, useState } from "react";
import { Rnd } from "react-rnd";

const ScreenRecorder: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const cropRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });

    const cropDiv = cropRef.current;
    if (!cropDiv) return;

    const { width, height, x, y } = cropDiv.getBoundingClientRect();

    // Set canvas size to crop area
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw loop
    const drawFrame = () => {
      if (!recording) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        stream.getVideoTracks()[0].getSettings().width && stream.getVideoTracks()[0],
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
      );
      requestAnimationFrame(drawFrame);
    };
    setRecording(true);
    drawFrame();

    // Record canvas
    const canvasStream = canvas.captureStream(30);
    const recorder = new MediaRecorder(canvasStream);
    recorder.ondataavailable = (e) => setChunks((prev) => [...prev, e.data]);
    recorder.start();
    setMediaRecorder(recorder);
  };

const stopRecording = () => {
  setRecording(false);
  if (mediaRecorder) {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setChunks([]);
    };
    mediaRecorder.stop();
  }
};

  return (
    <div style={{ position: "absolute", top: 0, right: 0, zIndex: 9999 }}>
      <button onClick={startRecording} disabled={recording}>
        Record
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop
      </button>
      {downloadUrl && (
        <a href={downloadUrl} download="recording.webm">
          Download
        </a>
      )}

      {/* Crop rectangle */}
      <Rnd
        ref={cropRef}
        default={{ x: 100, y: 100, width: 400, height: 300 }}
        bounds="window"
        style={{
          border: "2px dashed red",
          position: "absolute",
          zIndex: 10000,
        }}
      />
    </div>
  );
};

export default ScreenRecorder;
