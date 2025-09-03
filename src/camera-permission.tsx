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
  onStreamReady: (video: HTMLVideoElement, isStreamReady: boolean) => void;
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
      onStreamReady(video, true); // Pass true to indicate stream is ready
    } catch (err) {
      setPermissionState("denied");
            onStreamReady(null, false); // Pass false if stream is not ready

    }
  };

  const loadCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === "videoinput");
    setCameras(videoInputs);

    const savedCamera = localStorage.getItem("selectedCamera");
    if (savedCamera && videoInputs.find((d) => d.deviceId === savedCamera)) {
      setSelectedCamera(savedCamera);
      requestCamera(savedCamera);
    } else if (videoInputs.length > 0) {
      setSelectedCamera(videoInputs[0].deviceId);
    }
  };

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
    requestCamera(deviceId);
  };

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "camera" as PermissionName }).then((result) => {
        setPermissionState(result.state as any);
        if (result.state === "granted") loadCameras();

        result.onchange = () => {
          setPermissionState(result.state as any);
          if (result.state === "granted") loadCameras();
        };
      });
    }
  }, []);

  // Map cameras to dropdown options with dummy SVG icons
  const dropdownOptions: Option[] = cameras.map((cam, idx) => {
    const icon = idx % 2 === 0 ? CameraIcon : VideoIcon; // Alternate icons as dummy
    return {
      label: cam.label || `Camera ${idx + 1}`,
      value: cam.deviceId,
      icon,
    };
  });

  return (
    <>
      {/* Permission prompt */}
      {permissionState === "prompt" && (
        <PermissionPopup
          title="Camera Permission Required"
          subtitle="We need access to your camera to animate your avatar in real time."
          buttonText="Allow Camera"
          onClick={() => requestCamera(selectedCamera || undefined)}
          showButton
        />
      )}

      {/* Denied prompt */}
      {permissionState === "denied" && (
        <PermissionPopup
          title="Camera Access Denied"
          subtitle="Please enable camera access in your browser settings to continue."
          showButton={false}
        />
      )}

      {/* Dropdown for camera selection */}
      {permissionState === "granted" && cameras.length > 1 && (
        <div className="cp-dropdown absolute top-4 right-4 z-50">
          <CustomDropdown
            options={dropdownOptions}
            value={selectedCamera}
            onChange={handleCameraChange}
            placeholder="Select camera"
          />
        </div>
      )}
    </>
  );
}
