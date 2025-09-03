import { useEffect, useState } from "react";

// Custom dropdown component
function CustomDropdown({ value, onChange, options }: { 
  value: string; 
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; 
  options: { value: string; label: string }[] 
}) {
  return (
    <div className="custom-dropdown">
      <select value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="dropdown-arrow">▼</div>
    </div>
  );
}

// A reusable popup component
function PermissionPopup({ title, subtitle, buttonText, onClick, showButton }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-xl">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        {showButton && (
          <button
            onClick={onClick}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700"
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

export default function CameraPermissions({ onStreamReady }: CameraPermissionsProps) {
  const [permissionState, setPermissionState] = useState<"prompt" | "denied" | "granted">("prompt");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  // Request access to camera with specific deviceId
  const requestCamera = async (deviceId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { width: 1280, height: 720 },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setPermissionState("granted");

      const video = document.getElementById("video") as HTMLVideoElement;
      video.srcObject = stream;
      onStreamReady(video);
    } catch (err) {
      setPermissionState("denied");
    }
  };

  // Load available cameras
  const loadCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(d => d.kind === "videoinput");
    setCameras(videoInputs);

    // Restore saved camera if exists
    const savedCamera = localStorage.getItem("selectedCamera");
    if (savedCamera && videoInputs.find(d => d.deviceId === savedCamera)) {
      setSelectedCamera(savedCamera);
      requestCamera(savedCamera);
    } else if (videoInputs.length > 0) {
      setSelectedCamera(videoInputs[0].deviceId);
    }
  };

  // Handle camera selection change
  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;
    setSelectedCamera(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
    requestCamera(deviceId);
  };

  useEffect(() => {
    // Initial check
    if (navigator.permissions) {
      navigator.permissions.query({ name: "camera" as PermissionName }).then((result) => {
        setPermissionState(result.state as any);
        if (result.state === "granted") {
          loadCameras();
        }
        result.onchange = () => {
          setPermissionState(result.state as any);
          if (result.state === "granted") {
            loadCameras();
          }
        };
      });
    }
  }, []);

  return (
    <>
      {/* Popups */}
      {permissionState === "prompt" && (
        <PermissionPopup
          title="Camera Permission Required"
          subtitle="We need access to your camera to animate your avatar in real time."
          buttonText="Allow Camera"
          onClick={() => requestCamera(selectedCamera || undefined)}
          showButton
        />
      )}
      {permissionState === "denied" && (
        <PermissionPopup
          title="Camera Access Denied"
          subtitle="Please enable camera access in your browser settings to continue."
          showButton={false}
        />
      )}

      {/* Camera selection dropdown (only if multiple cameras available) */}
      {permissionState === "granted" && cameras.length > 1 && (
        <div className="absolute top-4 right-4 z-50 bg-white shadow-md rounded-lg p-2">
          <CustomDropdown
            value={selectedCamera || ""}
            onChange={handleCameraChange}
            options={cameras.map((cam, idx) => ({
              value: cam.deviceId,
              label: cam.label || `Camera ${idx + 1}`
            }))}
          />
        </div>
      )}

      <style>{`
        .custom-dropdown {
          position: relative;
          display: inline-block;
          min-width: 180px;
        }
        
        .custom-dropdown select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          width: 100%;
          padding: 8px 12px;
          padding-right: 32px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: white;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          outline: none;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .custom-dropdown select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        .dropdown-arrow {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #6b7280;
          font-size: 12px;
        }
      `}</style>
    </>
  );
}