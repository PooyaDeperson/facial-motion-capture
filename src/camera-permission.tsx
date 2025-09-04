import { useEffect, useState } from "react";
import CustomDropdown, { Option } from "./components/CustomDropdown";

interface CameraPermissionsProps {
  onStreamReady: (video: HTMLVideoElement) => void;
  onConfirm: () => void; // ✅ new prop for "Let's go"
}

export default function CameraPermissions({ onStreamReady, onConfirm }: CameraPermissionsProps) {
  const [step, setStep] = useState<"prompt" | "loading" | "select" | "denied">("prompt");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const requestCamera = async (deviceId?: string) => {
    try {
      setStep("loading");
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { width: 1280, height: 720 },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = document.getElementById("video") as HTMLVideoElement;
      if (video) video.srcObject = stream;
      setStep("select");
      onStreamReady(video);
    } catch {
      setStep("denied");
    }
  };

  const loadCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === "videoinput");
    setCameras(videoInputs);

    const saved = localStorage.getItem("selectedCamera");
    if (saved && videoInputs.find((d) => d.deviceId === saved)) {
      setSelectedCamera(saved);
      requestCamera(saved);
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
      navigator.permissions.query({ name: "camera" as PermissionName }).then((res) => {
        if (res.state === "granted") loadCameras();
        setStep(res.state === "denied" ? "denied" : "prompt");
        res.onchange = () => {
          if (res.state === "granted") loadCameras();
        };
      });
    }
  }, []);

  const dropdownOptions: Option[] = cameras.map((cam, idx) => ({
    label: cam.label || `Camera ${idx + 1}`,
    value: cam.deviceId,
    leftIcon: <span className="icon-placeholder" />,
  }));

  return (
    <div className="popup-container pos-abs z-7 m-5 p-1 br-20">
      <div className="inner-container p-5 flex-col br-16 gap-4">
        {/* Step 1: Ask permission */}
        {step === "prompt" && (
          <>
            <h1>pssst… give camera access to animate!</h1>
            <p>let us use your camera to bring your character’s face to life in real time</p>
            <button className="button primary flex items-center gap-2" onClick={() => requestCamera()}>
              allow camera access
            </button>
          </>
        )}

        {/* Step 1.5: Loading */}
        {step === "loading" && (
          <button className="button primary flex items-center gap-2">
            <span className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            setting up camera...
          </button>
        )}

        {/* Step 2: Selection */}
        {step === "select" && (
          <>
            <div className="flex items-center justify-between gap-2">
              <h1>Select face camera</h1>
              <CustomDropdown
                options={dropdownOptions}
                value={selectedCamera}
                onChange={handleCameraChange}
                placeholder="Select camera"
              />
            </div>
            <video id="video" autoPlay playsInline className="w-full br-16" />
            <button className="button primary" onClick={onConfirm}>
              Let’s go
            </button>
          </>
        )}

        {/* Step 3: Denied */}
        {step === "denied" && (
          <>
            <h1>oh... you haven’t given camera access yet.</h1>
            <p>you’re missing out on the fun!</p>
          </>
        )}
      </div>
    </div>
  );
}
