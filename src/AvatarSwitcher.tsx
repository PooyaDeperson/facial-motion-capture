// AvatarSwitcher.tsx
import React from "react";

interface AvatarSwitcherProps {
  selectedUrl: string;
  onSelect: (url: string) => void;
}

const avatars = [
  {
    name: "Avatar 1",
    url: "https://models.readyplayer.me/68c19bef8ac0d37a66aa2930.glb?morphTargets=ARKit&textureAtlas=1024",
  },
  {
    name: "Avatar 2",
    url: "https://models.readyplayer.me/68c1b98163cdbdf2d3403aab.glb",
  },
];

export default function AvatarSwitcher({ selectedUrl, onSelect }: AvatarSwitcherProps) {
  return (
    <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
      {avatars.map((avatar) => (
        <button
          key={avatar.url}
          onClick={() => onSelect(avatar.url)}
          style={{
            padding: "8px 16px",
            borderRadius: "5px",
            border: selectedUrl === avatar.url ? "2px solid #007bff" : "1px solid gray",
            background: selectedUrl === avatar.url ? "#e0f0ff" : "#fff",
            cursor: "pointer",
          }}
        >
          {avatar.name}
        </button>
      ))}
    </div>
  );
}
