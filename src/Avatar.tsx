import { useEffect, useRef } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { blendshapes, rotation, headMesh } from './FaceTracking';

// Props interface for the Avatar component
interface AvatarProps {
  url: string;                          // URL or data URL of the GLB model
  onLoaded?: () => void;               // Callback when model finishes loading
}

/**
 * Avatar component renders the GLTF model and applies real-time face tracking
 * 
 * This component:
 * - Loads GLB models from URLs or file uploads
 * - Applies MediaPipe blendshapes to morph targets
 * - Applies head rotation from face tracking
 * - Manages loading states
 */
function Avatar({ url, onLoaded }: AvatarProps) {
  // Load the GLTF model using React Three Fiber's useGLTF hook
  // This hook handles caching and loading states automatically
  const { scene } = useGLTF(url);
  
  // Extract nodes from the scene using useGraph
  // This gives us access to individual meshes and bones in the model
  const { nodes } = useGraph(scene);
  
  // Reference to track if we've already called onLoaded for this URL
  const loadedUrlRef = useRef<string | null>(null);

  // Effect to handle model loading and mesh registration
  useEffect(() => {
    // Clear the headMesh array when loading a new model
    // This prevents old mesh references from interfering with new model
    headMesh.length = 0;
    
    // Register different possible mesh names from ReadyPlayerMe avatars
    // These are the standard mesh names that RPM uses for different avatar parts
    
    // Main head mesh - contains primary facial features
    if (nodes.Wolf3D_Head) {
      headMesh.push(nodes.Wolf3D_Head);
      console.log('Registered Wolf3D_Head mesh');
    }
    
    // Teeth mesh - for mouth/smile animations
    if (nodes.Wolf3D_Teeth) {
      headMesh.push(nodes.Wolf3D_Teeth);
      console.log('Registered Wolf3D_Teeth mesh');
    }
    
    // Beard mesh - if avatar has facial hair
    if (nodes.Wolf3D_Beard) {
      headMesh.push(nodes.Wolf3D_Beard);
      console.log('Registered Wolf3D_Beard mesh');
    }
    
    // Full avatar mesh - sometimes used instead of separate parts
    if (nodes.Wolf3D_Avatar) {
      headMesh.push(nodes.Wolf3D_Avatar);
      console.log('Registered Wolf3D_Avatar mesh');
    }
    
    // Custom head mesh - for customized avatars
    if (nodes.Wolf3D_Head_Custom) {
      headMesh.push(nodes.Wolf3D_Head_Custom);
      console.log('Registered Wolf3D_Head_Custom mesh');
    }
    
    // Additional possible mesh names - add more as needed
    // TODO: Expand this list based on different avatar types you encounter
    if (nodes.Head) {
      headMesh.push(nodes.Head);
      console.log('Registered Head mesh');
    }
    
    if (nodes.Face) {
      headMesh.push(nodes.Face);
      console.log('Registered Face mesh');
    }

    // Log all available nodes for debugging purposes
    // This helps identify mesh names in new avatar models
    console.log('Available nodes in loaded model:', Object.keys(nodes));
    console.log(`Registered ${headMesh.length} meshes for blendshape animation`);
    
    // Call onLoaded callback if provided and this is a new URL
    if (onLoaded && loadedUrlRef.current !== url) {
      loadedUrlRef.current = url;
      onLoaded();
    }
  }, [nodes, url, onLoaded]);

  // Animation frame loop - runs 60 times per second
  useFrame(() => {
    // Only animate if we have blendshape data from MediaPipe
    if (blendshapes.length > 0) {
      
      // Apply blendshapes (facial expressions) to all registered head meshes
      blendshapes.forEach(blendshape => {
        headMesh.forEach(mesh => {
          // Find the morph target index for this blendshape
          // ARKit blendshapes map to specific morph targets in RPM avatars
          const morphTargetIndex = mesh.morphTargetDictionary?.[blendshape.categoryName];
          
          if (morphTargetIndex !== undefined && morphTargetIndex >= 0) {
            // Apply the blendshape strength to the morph target
            // Score is between 0-1, representing how much to apply the morph
            mesh.morphTargetInfluences[morphTargetIndex] = blendshape.score;
          }
        });
      });
      
      // Apply head rotation to bone hierarchy
      // This creates natural head movement that follows face tracking
      
      // Main head rotation - direct 1:1 mapping
      if (nodes.Head) {
        nodes.Head.rotation.set(rotation.x, rotation.y, rotation.z);
      }
      
      // Neck rotation - reduced influence for more natural movement
      // Dividing by 5 makes neck movement more subtle
      if (nodes.Neck) {
        nodes.Neck.rotation.set(
          rotation.x / 5 + 0.3,  // Add slight forward tilt offset
          rotation.y / 5, 
          rotation.z / 5
        );
      }
      
      // Spine rotation - even more subtle for realistic body movement
      // Upper spine should move less than head/neck
      if (nodes.Spine2) {
        nodes.Spine2.rotation.set(
          rotation.x / 10, 
          rotation.y / 10, 
          rotation.z / 10
        );
      }
      
      // Additional bone support - add more bones as needed
      // TODO: Add support for other bone names found in different avatar rigs
      
      // Alternative bone names that might be used
      if (nodes.head && !nodes.Head) {
        nodes.head.rotation.set(rotation.x, rotation.y, rotation.z);
      }
      
      if (nodes.neck && !nodes.Neck) {
        nodes.neck.rotation.set(rotation.x / 5 + 0.3, rotation.y / 5, rotation.z / 5);
      }
      
      if (nodes.spine_02 && !nodes.Spine2) {
        nodes.spine_02.rotation.set(rotation.x / 10, rotation.y / 10, rotation.z / 10);
      }
    }
  });

  // Render the loaded 3D model
  // Position places avatar in front of camera with slight offset
  return (
    <primitive 
      object={scene} 
      position={[0, -1.75, 3]}  // x: center, y: lower on screen, z: distance from camera
      scale={[1, 1, 1]}         // Keep original scale - adjust if needed
    />
  );
}

// Preload the default avatar to improve initial loading time
// This loads the model in the background before it's needed
useGLTF.preload("https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024");

export default Avatar;