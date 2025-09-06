import { useEffect, useState } from "react";
import CustomDropdown, { Option } from "./components/CustomDropdown";

// Dummy icons for dropdown (unchanged)
const CameraIcon = (
  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h2l2-3h10l2 3h2v13H3V7z" />
    <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const VideoIcon = (
  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276a1 1 0 011.447.894v8.764a1 1 0 01-1.447.894L15 14M4 6h11a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
  </svg>
);

/**
 * Reusable popup for camera permission prompts
 */
function PermissionPopup({
  title,
  subtitle,
  buttonText,
  onClick,
  showButton,
}: any) {
  return (
    <div className="popup-container pos-abs z-7 m-5 p-1 br-20">
      <div className="inner-container p-5 flex-col br-16">
        <div className="text-container flex-col gap-2">
          <h1 className="title">{title}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>
        {showButton && (
          <button onClick={onClick} className="button primary">
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

interface CameraPermissionsProps {
  onStreamReady: (vid: HTMLVideoElement) => void;
}

export default function CameraPermissions({ onStreamReady }: CameraPermissionsProps) {
  const [permissionState, setPermissionState] = useState<"prompt" | "denied" | "granted">("prompt");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  /**
   * Request camera stream. If deviceId is provided, use that camera.
   */
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
      console.error("Failed to get camera stream:", err);
      setPermissionState("denied");
    }
  };

  /**
   * Load all available cameras
   */
  const loadCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === "videoinput");
    setCameras(videoInputs);

    // Restore last selected camera from localStorage if available
    const savedCamera = localStorage.getItem("selectedCamera");
    if (savedCamera && videoInputs.find((d) => d.deviceId === savedCamera)) {
      setSelectedCamera(savedCamera);
      requestCamera(savedCamera);
    } else if (videoInputs.length > 0) {
      setSelectedCamera(videoInputs[0].deviceId);
      requestCamera(videoInputs[0].deviceId);
    }
  };

  /**
   * Handle dropdown camera selection
   */
  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
    requestCamera(deviceId); // Request new camera stream
  };

  /**
   * On mount: robustly detect camera permissions and available devices
   */
  useEffect(() => {
    const init = async () => {
      try {
        // Try to request a temporary video stream to detect permission
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setPermissionState("granted");

        // Stop tracks immediately; we only wanted permission
        tempStream.getTracks().forEach((track) => track.stop());

        // Now load all cameras
        loadCameras();
      } catch (err: any) {
        if (err.name === "NotAllowedError") setPermissionState("denied");
        else setPermissionState("prompt");
      }
    };

    init();

    // Optional: listen to browser permission changes
    if (navigator.permissions) {
      navigator.permissions.query({ name: "camera" as PermissionName }).then((result) => {
        result.onchange = () => {
          setPermissionState(result.state as any);
          if (result.state === "granted") loadCameras();
        };
      });
    }
  }, []);

  // Map cameras to dropdown options with icons
  const dropdownOptions: Option[] = cameras.map((cam, idx) => {
    const icon = idx % 2 === 0 ? CameraIcon : VideoIcon;
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
          title="pssst… give camera access to animate!"
          subtitle="let us use your camera to bring your character’s face to life in real time"
          buttonText="allow camera access"
          onClick={() => requestCamera(selectedCamera || undefined)}
          showButton
        />
      )}

      {/* Denied prompt */}
      {permissionState === "denied" && (
        <PermissionPopup
          title="oh... you haven’t given camera access yet."
          subtitle="you’re missing out on the fun!"
          showButton={false}
        />
      )}

      {/* Camera selection dropdown */}
      {permissionState === "granted" && cameras.length > 1 && (
        <div className="cp-dropdown pos-abs top-0 left-0 z-7 m-6">
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
