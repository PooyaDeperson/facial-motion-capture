import { useEffect, useState, ReactNode } from "react";

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

const RefreshIcon = (
  <svg className="w-5 h-5 text-gray-600 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

interface Option {
  label: string;
  value: string;
  leftIcon?: ReactNode;
}

interface CustomDropdownProps {
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="flex-col gap-1" ref={dropdownRef}>
      <button
        type="button"
        className="dropdown flex-row camera-dropdown post-rel flex items-center justify-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="has-icon left-side camera-icon dimmed">{selectedOption?.leftIcon}</span>
        <span className="dropdown-text">{selectedOption?.label || placeholder || "Select an option"}</span>
        <span className={`has-icon right-side dropdown-icon ${isOpen ? "rotated-180" : ""}`}></span>
      </button>
      {isOpen && (
        <ul className="flex-col gap-1 pos-rel camera-dropdown-list-container top-0 left-0 br-16">
          {options.map((option) => (
            <li key={option.value} className="camera-dropdown-list-item">
              <button
                type="button"
                className={`dropdown flex-row items-center justify-between w-full gap-2 ${value === option.value ? "cd-selected" : ""}`}
                onClick={() => handleSelect(option.value)}
              >
                <span className="has-icon left-side camera-icon dimmed">{option.leftIcon}</span>
                <span className="dropdown-text">{option.label}</span>
                <span className="has-icon right-side selected-icon"></span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function PermissionPopup({
  title,
  subtitle,
  buttonText,
  onClick,
  showButton,
  isLoading,
  children,
}: {
  title: string | ReactNode;
  subtitle: string;
  buttonText: string;
  onClick: () => void;
  showButton: boolean;
  isLoading: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="popup-container pos-abs z-7 m-5 p-1 br-20">
      <div className="inner-container p-5 flex-col br-16">
        <div className="text-container flex-col gap-2">
          <h1 className="title">{title}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>
        {children}
        {showButton && (
          <button onClick={onClick} className="button primary" disabled={isLoading}>
            {isLoading ? <span className="loader"></span> : buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

interface CameraPermissionsProps {
  onStreamReady: (video: HTMLVideoElement) => void;
  onRestart: () => void;
}

export default function CameraPermissions({ onStreamReady, onRestart }: CameraPermissionsProps) {
  const [permissionState, setPermissionState] = useState<"prompt" | "denied" | "granted" | "confirming">("prompt");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const requestCamera = async (deviceId?: string) => {
    setIsLoading(true);
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { width: 1280, height: 720 },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setPermissionState("confirming");
      const video = document.getElementById("video") as HTMLVideoElement;
      if (video) {
        video.srcObject = stream;
        setVideoElement(video);
      }
      setIsLoading(false);
    } catch (err) {
      setPermissionState("denied");
      setIsLoading(false);
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

  const handleConfirm = () => {
    if (videoElement) onStreamReady(videoElement);
    setPermissionState("granted");
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

  const dropdownOptions: Option[] = cameras.map((cam, idx) => ({
    label: cam.label || `Camera ${idx + 1}`,
    value: cam.deviceId,
    leftIcon: idx % 2 === 0 ? CameraIcon : VideoIcon,
  }));

  if (permissionState === "prompt") {
    return (
      <PermissionPopup
        title="pssst… give camera access to animate!"
        subtitle="Let us use your camera to bring your character’s face to life in real time"
        buttonText="Allow camera access"
        onClick={() => requestCamera(selectedCamera || undefined)}
        showButton
        isLoading={isLoading}
      />
    );
  }

  if (permissionState === "denied") {
    return (
      <PermissionPopup
        title="Oh... you haven’t given camera access yet."
        subtitle="You’re missing out on the fun!"
        showButton={false}
        isLoading={false}
      />
    );
  }

  if (permissionState === "confirming") {
    return (
      <PermissionPopup
        title={
          <div className="flex items-center gap-2">
            <span>Select face camera</span>
            {cameras.length > 1 && (
              <div className="cp-dropdown">
                <CustomDropdown
                  options={dropdownOptions}
                  value={selectedCamera}
                  onChange={handleCameraChange}
                  placeholder="Select camera"
                />
              </div>
            )}
          </div>
        }
        subtitle=""
        buttonText="Let’s go"
        onClick={handleConfirm}
        showButton
        isLoading={false}
      >
        <div className="video-feed-container">
          <video id="video" autoPlay playsInline muted className="video-feed" />
        </div>
      </PermissionPopup>
    );
  }

  return (
    <div className="refresh-icon-container pos-abs top-0 left-0 z-7 m-6" onClick={onRestart}>
      {RefreshIcon}
    </div>
  );
}
