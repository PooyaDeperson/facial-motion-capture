import { useEffect, useState } from "react";
import CustomDropdown, { Option } from "./components/CustomDropdown";

/* icons omitted for brevity — keep your CameraIcon / VideoIcon as before */
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

function PermissionPopup({ title, subtitle, buttonText, onClick, showButton }: any) {
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
  onStreamReady: (video: HTMLVideoElement) => void;
}

export default function CameraPermissions({ onStreamReady }: CameraPermissionsProps) {
  const [permissionState, setPermissionState] = useState<"prompt" | "denied" | "granted">("prompt");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const stopTracks = (stream: MediaStream | null | undefined) => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
  };

  const requestCamera = async (deviceId?: string): Promise<MediaStream | null> => {
    try {
      const constraints: MediaStreamConstraints = deviceId
        ? { video: { deviceId: { exact: deviceId } }, audio: false }
        : { video: { width: 1280, height: 720 }, audio: false };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      setPermissionState("granted");

      const video = document.getElementById("video") as HTMLVideoElement | null;
      if (video) {
        // stop previous stream
        const oldStream = video.srcObject as MediaStream | null;
        if (oldStream && oldStream !== stream) stopTracks(oldStream);

        video.srcObject = stream;
        // some browsers require an explicit play after attaching srcObject
        try {
          await video.play();
        } catch (err) {
          // ignore play errors; user interaction was the click that triggered this function
          console.warn("video.play() failed:", err);
        }
      }

      onStreamReady(video as HTMLVideoElement);
      return stream;
    } catch (err) {
      console.error("requestCamera error:", err);
      // do not aggressively set "denied" here — let openDefaultCamera decide after first try.
      throw err;
    }
  };

  /**
   * Called when the user clicks "allow camera access".
   * 1) Trigger default getUserMedia() to prompt the browser
   * 2) enumerateDevices() to get full list with labels
   * 3) select saved or first camera and switch to it if needed
   * 4) try to "prime" remaining cameras (best-effort; failure is ignored)
   */
  const openDefaultCamera = async () => {
    try {
      // 1) Prompt for a camera (no deviceId) — this is the critical step to ensure permission UI appears
      const initialStream = await requestCamera();

      // 2) Now enumerate devices (labels/deviceIds should be available after permission)
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setCameras(videoInputs);

      // prefer saved camera if present, otherwise pick first
      const savedCamera = localStorage.getItem("selectedCamera");
      const desired =
        savedCamera && videoInputs.find((d) => d.deviceId === savedCamera)
          ? savedCamera
          : videoInputs.length > 0
          ? videoInputs[0].deviceId
          : null;

      if (desired) {
        setSelectedCamera(desired);
        // if initialStream is not already from desired device, switch
        const currentDeviceId = initialStream?.getVideoTracks()?.[0]?.getSettings()?.deviceId;
        if (currentDeviceId !== desired) {
          try {
            await requestCamera(desired);
          } catch (err) {
            console.warn("Switch to desired camera failed:", err);
          }
        } else {
          // initial stream already matches desired — nothing to do
        }
      }

      // 4) Best-effort: try to "prime" other cameras so switching later won't prompt
      // NOTE: some browsers / mobile safari may not allow priming or multiple cameras simultaneously.
      for (const cam of videoInputs) {
        if (cam.deviceId === desired) continue;
        try {
          const s = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: cam.deviceId } },
            audio: false,
          });
          // stop immediately — we just wanted to grant permission
          stopTracks(s);
        } catch (e) {
          // ignore failures — some browsers will refuse/ignore priming attempts
          console.warn("Priming camera failed (ignored):", cam.deviceId, e);
        }
      }

      setPermissionState("granted");
    } catch (err: any) {
      console.error("openDefaultCamera failed:", err);
      setPermissionState("denied");
    }
  };

  const handleCameraChange = async (deviceId: string) => {
    try {
      setSelectedCamera(deviceId);
      localStorage.setItem("selectedCamera", deviceId);
      await requestCamera(deviceId);
    } catch (err) {
      console.error("handleCameraChange error:", err);
      // Show a friendly denied state if switching fails with NotAllowedError
      setPermissionState("denied");
    }
  };

  useEffect(() => {
    // If permissions API is available and already granted, openDefaultCamera immediately.
    if (navigator.permissions && (navigator as any).permissions.query) {
      (navigator as any).permissions.query({ name: "camera" as PermissionName }).then((result: any) => {
        setPermissionState(result.state as any);
        if (result.state === "granted") {
          // user already granted; start
          openDefaultCamera();
        }
        result.onchange = () => {
          setPermissionState(result.state as any);
          if (result.state === "granted") openDefaultCamera();
        };
      }).catch(() => {
        // permissions.query might throw on some browsers — ignore and rely on user interaction
      });
    }
    // else: do nothing until user clicks "allow camera access"
  }, []);

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
      {permissionState === "prompt" && (
        <PermissionPopup
          title="pssst… give camera access to animate!"
          subtitle="let us use your camera to bring your character’s face to life in real time"
          buttonText="allow camera access"
          onClick={openDefaultCamera}
          showButton
        />
      )}

      {permissionState === "denied" && (
        <PermissionPopup title="oh... you haven’t given camera access yet." subtitle="you’re missing out on the fun!" showButton={false} />
      )}

      {permissionState === "granted" && cameras.length > 1 && (
        <div className="cp-dropdown pos-abs top-0 left-0 z-7 m-6">
          <CustomDropdown options={dropdownOptions} value={selectedCamera} onChange={handleCameraChange} placeholder="Select camera" />
        </div>
      )}
    </>
  );
}
