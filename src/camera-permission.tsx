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
  subtitle,
  buttonText,
  onClick,
  showButton,
}: any) {
  return (
    <div className="popup-container pos-abs z-7 ml-5 mt-5">
      <div className="inner-container">
        <p className="subtitle">{subtitle}</p>
        {showButton && (
          <button
            onClick={onClick}
            className=""
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
    } catch (err) {
      setPermissionState("denied");
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
          subtitle="Pssst… let us access your camera so we can animate your character's face in real time!"
          buttonText="allow camera access"
          onClick={() => requestCamera(selectedCamera || undefined)}
          showButton
        />
      )}

      {/* Denied prompt */}
      {permissionState === "denied" && (
        <PermissionPopup
          subtitle="hmmm… looks like you're missing out on the fun!You haven't given camera access yet."
          showButton={false}
        />
      )}

      {/* Dropdown for camera selection */}
      {permissionState === "granted" && cameras.length > 1 && (
        <div className="cp-dropdown pos-abs top-0 left-0 z-5 m-5">
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
