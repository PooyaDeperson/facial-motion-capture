import { useEffect, useRef, useState } from "react";
import CustomDropdown, { Option } from "./components/CustomDropdown";

const CameraIcon = <svg className="w-4 h-4 text-gray-600">...</svg>;
const VideoIcon = <svg className="w-4 h-4 text-gray-600">...</svg>;

function PermissionPopup({ title, subtitle, buttonText, onClick, showButton }: any) {
  return (
    <div className="popup-container pos-abs z-7 m-5 p-1 br-20">
      <div className="inner-container p-5 flex-col br-16">
        <h1 className="title">{title}</h1>
        <p className="subtitle">{subtitle}</p>
        {showButton && <button onClick={onClick} className="button primary">{buttonText}</button>}
      </div>
    </div>
  );
}

interface CameraPermissionsProps {
  onStreamReady: (vid: HTMLVideoElement) => void;
}

export default function CameraPermissions({ onStreamReady }: CameraPermissionsProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permissionState, setPermissionState] = useState<"prompt" | "denied" | "granted">("prompt");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  // Request camera using ref
  const requestCamera = async (deviceId?: string) => {
    try {
      if (!videoRef.current) return;

      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { width: 1280, height: 720 },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      setPermissionState("granted");
      onStreamReady(videoRef.current);
    } catch (err) {
      console.error(err);
      setPermissionState("denied");
    }
  };

  // Load all cameras
  const loadCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === "videoinput");
    setCameras(videoInputs);

    const savedCamera = localStorage.getItem("selectedCamera");
    if (savedCamera && videoInputs.find(d => d.deviceId === savedCamera)) {
      setSelectedCamera(savedCamera);
      requestCamera(savedCamera);
    } else if (videoInputs.length > 0) {
      setSelectedCamera(videoInputs[0].deviceId);
      requestCamera(videoInputs[0].deviceId);
    }
  };

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
    requestCamera(deviceId);
  };

  // On mount, check permissions
  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // stop temporary tracks
        stream.getTracks().forEach(track => track.stop());
        setPermissionState("granted");
        loadCameras();
      } catch (err: any) {
        setPermissionState(err.name === "NotAllowedError" ? "denied" : "prompt");
      }
    };
    init();
  }, []);

  // Map dropdown options
  const dropdownOptions: Option[] = cameras.map((cam, idx) => ({
    label: cam.label || `Camera ${idx + 1}`,
    value: cam.deviceId,
    icon: idx % 2 === 0 ? CameraIcon : VideoIcon
  }));

  return (
    <>
      {/* Hidden video element used for streaming */}
      <video ref={videoRef} className="camera-feed br-24 m-4" autoPlay playsInline />

      {permissionState === "prompt" && (
        <PermissionPopup
          title="Give camera access to animate!"
          subtitle="Your character will follow your face in real time"
          buttonText="Allow Camera Access"
          showButton
          onClick={() => requestCamera(selectedCamera || undefined)}
        />
      )}

      {permissionState === "denied" && (
        <PermissionPopup
          title="Camera access denied"
          subtitle="Please allow camera to animate your character"
          showButton={false}
        />
      )}

      {permissionState === "granted" && cameras.length > 1 && (
        <div className="cp-dropdown pos-abs top-0 left-0 z-7 m-6">
          <CustomDropdown
            options={dropdownOptions}
            value={selectedCamera}
            onChange={handleCameraChange}
            placeholder="Select Camera"
          />
        </div>
      )}
    </>
  );
}
