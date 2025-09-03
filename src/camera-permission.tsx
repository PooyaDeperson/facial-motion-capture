import { useEffect, useState, useRef } from "react";

// Reusable Permission Popup
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

// Reusable custom dropdown
type Option = { label: string; value: string };

interface CustomDropdownProps {
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="relative w-60" ref={dropdownRef}>
      <button
        type="button"
        className="w-full px-4 py-2 border rounded bg-white text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedLabel || placeholder || "Select an option"}
      </button>
      {isOpen && (
        <ul className="absolute w-full border rounded bg-white mt-1 max-h-60 overflow-auto z-10">
          {options.map((option) => (
            <li
              key={option.value}
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface CameraPermissionsProps {
  onStreamReady: (video: HTMLVideoElement) => void;
}

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
      video.srcObject = stream;
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

  const dropdownOptions = cameras.map((cam, idx) => ({
    label: cam.label || `Camera ${idx + 1}`,
    value: cam.deviceId,
  }));

  return (
    <>
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

      {permissionState === "granted" && cameras.length > 1 && (
        <div className="absolute top-4 right-4 z-50">
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
