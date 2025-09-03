import { useEffect, useState, useRef } from "react";

/**
 * A reusable popup component to show permission messages
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
        {/* Popup title */}
        <h2 className="pp-title text-xl font-bold mb-2">{title}</h2>

        {/* Popup subtitle */}
        <p className="pp-subtitle text-gray-600 mb-6">{subtitle}</p>

        {/* Action button if required */}
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

/**
 * Reusable custom dropdown component
 */
type Option = { label: string; value: string };

interface CustomDropdownProps {
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Track dropdown open/close state
  const dropdownRef = useRef<HTMLDivElement>(null); // Reference to dropdown container

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selecting an option
  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false); // close dropdown after selection
  };

  // Find the label of the selected value
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="cd-container relative w-60" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        type="button"
        className="cd-button w-full px-4 py-2 border rounded bg-white text-left flex justify-between items-center hover:border-blue-500 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedLabel || placeholder || "Select an option"}
        {/* Arrow indicator */}
        <span className={`cd-arrow ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <ul className="cd-list absolute w-full border rounded bg-white mt-1 max-h-60 overflow-auto z-10 shadow-lg">
          {options.map((option) => (
            <li
              key={option.value}
              className={`cd-list-item px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors duration-200
                ${value === option.value ? "cd-selected bg-blue-100 font-semibold" : ""}`}
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

/**
 * Main CameraPermissions component
 * Handles camera permission prompts, video streaming, and camera selection
 */
interface CameraPermissionsProps {
  onStreamReady: (video: HTMLVideoElement) => void;
}

export default function CameraPermissions({ onStreamReady }: CameraPermissionsProps) {
  // Permission state: "prompt", "denied", or "granted"
  const [permissionState, setPermissionState] = useState<"prompt" | "denied" | "granted">("prompt");
  
  // List of available video input devices
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  
  // Currently selected camera deviceId
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  /**
   * Request camera access from the user
   * @param deviceId optional deviceId to select specific camera
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
      setPermissionState("denied");
    }
  };

  /**
   * Load available video input devices (cameras)
   * Restores previously selected camera if saved
   */
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

  /**
   * Handle camera selection changes from dropdown
   */
  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
    requestCamera(deviceId);
  };

  // Check camera permissions on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "camera" as PermissionName }).then((result) => {
        setPermissionState(result.state as any);
        if (result.state === "granted") loadCameras();

        // Listen for permission changes (user granting/revoking)
        result.onchange = () => {
          setPermissionState(result.state as any);
          if (result.state === "granted") loadCameras();
        };
      });
    }
  }, []);

  // Map camera devices to dropdown options
  const dropdownOptions = cameras.map((cam, idx) => ({
    label: cam.label || `Camera ${idx + 1}`,
    value: cam.deviceId,
  }));

  return (
    <>
      {/* Show popup if permission is required */}
      {permissionState === "prompt" && (
        <PermissionPopup
          title="Camera Permission Required"
          subtitle="We need access to your camera to animate your avatar in real time."
          buttonText="Allow Camera"
          onClick={() => requestCamera(selectedCamera || undefined)}
          showButton
        />
      )}

      {/* Show popup if permission denied */}
      {permissionState === "denied" && (
        <PermissionPopup
          title="Camera Access Denied"
          subtitle="Please enable camera access in your browser settings to continue."
          showButton={false}
        />
      )}

      {/* Show custom dropdown if permission granted and multiple cameras available */}
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
