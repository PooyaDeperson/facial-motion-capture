import { useEffect, useState, useRef } from "react";
import { ChevronDown, Camera } from 'lucide-react';

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

// Custom Camera Selector Component
function CustomCameraSelector({ 
  cameras, 
  selectedCamera, 
  onCameraChange 
}: {
  cameras: MediaDeviceInfo[];
  selectedCamera: string | null;
  onCameraChange: (deviceId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCameraSelect = (cameraId: string) => {
    onCameraChange(cameraId);
    setIsOpen(false);
  };

  const selectedCameraLabel = cameras.find(cam => cam.deviceId === selectedCamera)?.label || 
    `Camera ${cameras.findIndex(cam => cam.deviceId === selectedCamera) + 1}`;

  return (
    <div className="absolute top-4 right-4 z-50">
      <div ref={dropdownRef} className="relative inline-block">
        {/* Custom Select Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-black/10 rounded-xl px-4 py-3 font-medium text-sm text-gray-700 cursor-pointer transition-all duration-200 shadow-lg hover:bg-white hover:border-black/15 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg min-w-[180px] select-none"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <Camera className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
            {selectedCameraLabel}
          </span>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Custom Dropdown */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-black/10 rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden z-[1000] min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-150">
            <ul className="list-none p-2 m-0 max-h-60 overflow-y-auto">
              {cameras.map((camera, idx) => (
                <li key={camera.deviceId}>
                  <button
                    onClick={() => handleCameraSelect(camera.deviceId)}
                    className={`flex items-center gap-2.5 w-full p-3 border-none bg-transparent text-gray-700 text-sm text-left cursor-pointer rounded-lg transition-all duration-150 relative ${
                      selectedCamera === camera.deviceId 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'hover:bg-indigo-50/50 hover:text-indigo-600'
                    }`}
                    role="option"
                    aria-selected={selectedCamera === camera.deviceId}
                  >
                    <Camera className={`w-3.5 h-3.5 flex-shrink-0 ${
                      selectedCamera === camera.deviceId ? 'opacity-100' : 'opacity-70'
                    }`} />
                    <span>{camera.label || `Camera ${idx + 1}`}</span>
                    {selectedCamera === camera.deviceId && (
                      <div className="absolute right-3 w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-in {
          animation: animate-in 0.15s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Scrollbar styling */
        ul::-webkit-scrollbar {
          width: 6px;
        }
        
        ul::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ul::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        ul::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        
        /* Focus styles */
        button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      `}</style>
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
  const handleCameraChange = (deviceId: string) => {
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

      {/* Custom Camera selection dropdown (only if multiple cameras available) */}
      {permissionState === "granted" && cameras.length > 1 && (
        <CustomCameraSelector
          cameras={cameras}
          selectedCamera={selectedCamera}
          onCameraChange={handleCameraChange}
        />
      )}
    </>
  );
}