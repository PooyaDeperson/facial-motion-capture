import { useEffect, useState } from "react";
import CustomDropdown, { Option } from "./components/CustomDropdown";

interface CameraPermissionsProps {
  onStreamReady: (video: HTMLVideoElement) => void;
  onContinue: () => void;
}

function PermissionPopup({
  title,
  subtitle,
  buttonText,
  onClick,
  showButton,
  children,
}: any) {
  return (
    <div className="popup-container pos-abs z-7 m-5 p-1 br-20">
      <div className="inner-container p-5 flex-col br-16">
        <div className="text-container flex-col gap-2">
          <h1 className="title">{title}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>
        {children}
        {showButton && (
          <button onClick={onClick} className="button primary">
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CameraPermissions({
  onStreamReady,
  onContinue,
}: CameraPermissionsProps) {
  const [permissionState, setPermissionState] = useState<
    "prompt" | "denied" | "granted"
  >("prompt");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const requestCamera = async (deviceId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { width: 1280, height: 720 },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setPermissionState("granted");

      // Stop previous tracks if switching cameras
      videoStream?.getTracks().forEach((track) => track.stop());

      setVideoStream(stream); // store new stream in state
      setStep((prev) => (prev === 1 ? 2 : prev)); // only advance step if in step 1
    } catch {
      setPermissionState("denied");
    }
  };

  const loadCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === "videoinput");
    setCameras(videoInputs);

    if (videoInputs.length > 0) {
      const firstCamId = videoInputs[0].deviceId;
      setSelectedCamera(firstCamId);
      requestCamera(firstCamId); // preview first camera automatically
    }
  };

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    requestCamera(deviceId);
  };

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "camera" as PermissionName })
        .then((result) => {
          setPermissionState(result.state as any);
          if (result.state === "granted") {
            loadCameras();
          }
          result.onchange = () => {
            setPermissionState(result.state as any);
            if (result.state === "granted") loadCameras();
          };
        });
    }
  }, []);

  const dropdownOptions: Option[] = cameras.map((cam, idx) => ({
    label: cam.label || `Camera ${idx + 1}`,
    value: cam.deviceId,
  }));

  return (
    <>
      {/* Step 1: Permission */}
      {step === 1 && permissionState === "prompt" && (
        <PermissionPopup
          title="pssst… give camera access to animate!"
          subtitle="let us use your camera to bring your character’s face to life in real time"
          buttonText="allow camera access"
          onClick={() => requestCamera()} // fallback default camera
          showButton
        />
      )}

      {step === 1 && permissionState === "denied" && (
        <PermissionPopup
          title="oh... you haven’t given camera access yet."
          subtitle="you’re missing out on the fun!"
          showButton={false}
        />
      )}

      {/* Step 2: Preview + Camera selection */}
      {step === 2 && permissionState === "granted" && (
        <PermissionPopup
          title="Looking good!"
          subtitle="Choose your camera and continue"
          buttonText="Continue"
          onClick={onContinue}
          showButton
        >
          <video
            id="preview-video"
            autoPlay
            muted
            playsInline
            className="w-64 h-48 br-8 bg-black"
            ref={(video) => {
              if (video && videoStream) {
                video.srcObject = videoStream;
                video.play().catch(() => {});
              }
            }}
          />

          {/* Always show dropdown if at least one camera exists */}
          {cameras.length > 0 && (
            <div className="mt-3">
              <CustomDropdown
                options={dropdownOptions}
                value={selectedCamera}
                onChange={handleCameraChange}
                placeholder="Select camera"
              />
            </div>
          )}
        </PermissionPopup>
      )}
    </>
  );
}
