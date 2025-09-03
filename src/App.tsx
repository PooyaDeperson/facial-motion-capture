import './App.css';
import { useState } from 'react';
import { Color } from 'three';
import { Canvas } from '@react-three/fiber';
import { useDropzone } from 'react-dropzone';
import CameraPermissions from './camera-permission';
import ColorSwitcher from './components/ColorSwitcher';
import FaceTracking from './FaceTracking';
import Avatar from './Avatar';

// Define avatar options - currently using duplicates for testing
// TODO: Replace these URLs with actual different avatar models when available
const AVATAR_OPTIONS = [
  {
    id: 'avatar1',
    name: 'Default Avatar',
    url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024'
  },
  {
    id: 'avatar2', 
    name: 'Avatar Style 2',
    url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024'
  },
  {
    id: 'avatar3',
    name: 'Avatar Style 3', 
    url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024'
  },
  {
    id: 'avatar4',
    name: 'Avatar Style 4',
    url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024'
  },
  {
    id: 'avatar5',
    name: 'Avatar Style 5',
    url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024'
  },
  {
    id: 'avatar6',
    name: 'Avatar Style 6',
    url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024'
  },
  {
    id: 'avatar7',
    name: 'Avatar Style 7',
    url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024'
  },
  {
    id: 'avatar8',
    name: 'Avatar Style 8',
    url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024'
  },
  {
    id: 'avatar9',
    name: 'Avatar Style 9',
    url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024'
  },
  {
    id: 'avatar10',
    name: 'Avatar Style 10',
    url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024'
  }
];

function App() {
  // State for currently selected avatar URL - starts with first avatar
  const [url, setUrl] = useState<string>(AVATAR_OPTIONS[0].url);
  
  // State for currently selected avatar ID - starts with first avatar
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(AVATAR_OPTIONS[0].id);
  
  // State to track loading status when switching avatars
  const [isLoadingAvatar, setIsLoadingAvatar] = useState<boolean>(false);
  
  // State to track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // Configure drag and drop functionality for GLB files
  // This allows users to drag custom GLB avatar files directly into the app
  const { getRootProps, isDragActive } = useDropzone({
    // Only accept GLB files
    accept: {
      'model/gltf-binary': ['.glb']
    },
    // Handle dropped files
    onDrop: files => {
      const file = files[0];
      if (file) {
        setIsLoadingAvatar(true);
        setIsInitialLoad(false);
        
        // Convert dropped file to data URL for use in Three.js
        const reader = new FileReader();
        reader.onload = () => {
          setUrl(reader.result as string);
          setSelectedAvatarId('custom'); // Mark as custom upload
          // Loading state will be handled by Avatar component
        };
        reader.readAsDataURL(file);
      }
    }
  });

  // Handle camera stream ready event
  const handleStreamReady = (vid: HTMLVideoElement) => {
    console.log("Video stream ready:", vid);
  };

  // Handle avatar selection from predefined options
  const handleAvatarSelect = (avatarId: string) => {
    if (avatarId === selectedAvatarId) return; // Don't reload same avatar
    
    setIsLoadingAvatar(true);
    setIsInitialLoad(false);
    
    const selectedAvatar = AVATAR_OPTIONS.find(avatar => avatar.id === avatarId);
    if (selectedAvatar) {
      setUrl(selectedAvatar.url);
      setSelectedAvatarId(avatarId);
      // Loading state will be handled by Avatar component
    }
  };

  // Handle custom URL input
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value.trim();
    if (inputUrl) {
      setIsLoadingAvatar(true);
      setIsInitialLoad(false);
      // Add required parameters for ReadyPlayerMe avatars if not present
      const finalUrl = inputUrl.includes('?') 
        ? `${inputUrl}&morphTargets=ARKit&textureAtlas=1024`
        : `${inputUrl}?morphTargets=ARKit&textureAtlas=1024`;
      
      setUrl(finalUrl);
      setSelectedAvatarId('custom-url');
    }
  };

  // Callback to handle when avatar loading is complete
  const handleAvatarLoaded = () => {
    setIsLoadingAvatar(false);
    setIsInitialLoad(false);
  };

  return (
    <div className="App">
      {/* Camera permissions component - handles webcam access */}
      <CameraPermissions onStreamReady={handleStreamReady} />

      {/* Control panel container - holds avatar selection and drag/drop */}
      <div className="controls-container" style={{ 
        display: 'flex', 
        gap: '20px', 
        padding: '20px',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>
        
        {/* Avatar Selection Grid */}
        <div className="avatar-selection" style={{ flex: '1', minWidth: '300px' }}>
          <h3>Select Avatar:</h3>
          
          {/* Loading indicator when switching avatars */}
          {(isLoadingAvatar || isInitialLoad) && (
            <div className="loading-indicator" style={{ 
              padding: '10px', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '5px',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              {isInitialLoad ? 'Loading initial avatar...' : 'Switching avatar...'}
            </div>
          )}
          
          {/* Grid of avatar selection buttons */}
          <div className="avatar-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar.id)}
                disabled={isLoadingAvatar}
                className={`avatar-button ${selectedAvatarId === avatar.id ? 'active' : ''}`}
                style={{
                  padding: '8px 12px',
                  border: selectedAvatarId === avatar.id ? '2px solid #007bff' : '1px solid #ccc',
                  borderRadius: '5px',
                  backgroundColor: selectedAvatarId === avatar.id ? '#e7f3ff' : 'white',
                  cursor: isLoadingAvatar ? 'not-allowed' : 'pointer',
                  opacity: isLoadingAvatar ? 0.6 : 1,
                  fontSize: '12px'
                }}
              >
                {avatar.name}
              </button>
            ))}
          </div>

          {/* Custom URL input field */}
          <input
            className="url-input"
            type="text"
            placeholder="Or paste custom RPM avatar URL here"
            onChange={handleUrlChange}
            disabled={isLoadingAvatar}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              opacity: isLoadingAvatar ? 0.6 : 1
            }}
          />
        </div>

        {/* Drag and Drop Zone - now in the same container as avatar selection */}
        <div className="upload-section" style={{ flex: '1', minWidth: '250px' }}>
          <h3>Upload Custom Avatar:</h3>
          <div 
            {...getRootProps({ 
              className: `dropzone ${isDragActive ? 'active' : ''}` 
            })}
            style={{
              border: '2px dashed #ccc',
              borderRadius: '10px',
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa',
              borderColor: isDragActive ? '#007bff' : '#ccc',
              opacity: isLoadingAvatar ? 0.6 : 1,
              pointerEvents: isLoadingAvatar ? 'none' : 'auto'
            }}
          >
            <p style={{ margin: 0, color: '#666' }}>
              {isDragActive 
                ? 'Drop the GLB file here!' 
                : 'Drag & drop RPM avatar GLB file here, or click to browse'
              }
            </p>
            <small style={{ color: '#999', display: 'block', marginTop: '10px' }}>
              Supports .glb files only
            </small>
          </div>
        </div>
      </div>

      {/* Face tracking component - handles MediaPipe face detection */}
      <FaceTracking onStreamReady={handleStreamReady} />

      {/* Three.js Canvas - renders the 3D scene */}
      <Canvas 
        style={{ height: 600 }} 
        camera={{ fov: 25 }} 
        shadows
      >
        {/* Lighting setup for the 3D scene */}
        <ambientLight intensity={0.5} />
        
        {/* Yellow point light from top-right */}
        <pointLight 
          position={[10, 10, 10]} 
          color={new Color(1, 1, 0)} 
          intensity={0.5} 
          castShadow 
        />
        
        {/* Red point light from left */}
        <pointLight 
          position={[-10, 0, 10]} 
          color={new Color(1, 0, 0)} 
          intensity={0.5} 
          castShadow 
        />
        
        {/* White point light from center */}
        <pointLight 
          position={[0, 0, 10]} 
          intensity={0.5} 
          castShadow 
        />
        
        {/* Avatar component - renders and animates the 3D avatar */}
        <Avatar 
          url={url} 
          onLoaded={handleAvatarLoaded}
        />
      </Canvas>

      {/* App logo */}
      <img className="logo" src="./logo.png" alt="App Logo" />
      
      {/* Color switcher component - probably for theme switching */}
      <ColorSwitcher />
    </div>
  );
}

export default App;