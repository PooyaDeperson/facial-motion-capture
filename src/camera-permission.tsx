import { useEffect, useState } from "react";
import CustomDropdown, { Option } from "./components/CustomDropdown";

/**
 * Simple camera SVG icon (dummy)
 */
const CameraIcon = (
  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h2l2-3h10l2 3h2v13H3V7z" />
    <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

/**
 * Simple video SVG icon (dummy)
 */
const VideoIcon = (
  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276a1 1 0 011.447.894v8.764a1 1 0 01-1.447.894L15 14M4 6h11a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
  </svg>
);

/**
 * Reusable popup component for camera permission prompts
 */
function PermissionPopup({
  title,
  subtitle,
  buttonText,
  onClick,
  showButton,
}: any) {
  return (
    <div className="pp-container fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="pp-card bg-white rounded-2xl p-8 max-w-md text-center shadow-xl">
        <h2 className="pp-title text-xl font-bold mb-2">{title}</h2>
        <p className="pp-subtitle text-gray-600 mb-6">{subtitle}</p>
        {showButton && (
          <button
            onClick={onClick}
            className="pp-button bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

interface CameraPermissionsProps {
  onStreamReady: (video: HTMLVideoElement) => void;
}

/**
 * CameraPermissions component
 */
export default function CameraPermissions({ onStreamReady }: CameraPermissionsProps) {
  const [permissionState, setPermissionState] = useState<"prompt" | "denied" | "granted">("prompt");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const requestCamera = async (deviceId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { width: 1280, height: 720 },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setPermissionState("granted");

      const video = document.getElementById("video") as HTMLVideoElement;
      if (video) video.srcObject = stream;
      onStreamReady(video);
    } catch (err)
