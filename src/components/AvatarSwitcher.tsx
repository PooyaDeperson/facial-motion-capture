import React, { useEffect } from "react";
import "./AvatarSwitcher.css";

interface AvatarSwitcherProps {
  onAvatarChange: (newUrl: string) => void;
  activeUrl: string | null;
}

const AvatarSwitcher: React.FC<AvatarSwitcherProps> = ({ onAvatarChange, activeUrl }) => {
  const avatars = [
    { name: "Avatar 1", url: "avatar/avatar1.glb" },
    { name: "Avatar 2", url: "avatar/avatar2.glb" },
  ];

  useEffect(() => {
    if (!activeUrl) {
      onAvatarChange(avatars[0].url);
    }
  }, []);

  return (
    <div className="avatar-switcher">
      {avatars.map((avatar) => (
        <button
          key={avatar.name}
          onClick={() => onAvatarChange(avatar.url)}
          className={`avatar-btn ${activeUrl === avatar.url ? "active" : ""}`}
        >
          {avatar.name}
        </button>
      ))}
    </div>
  );
};

export default AvatarSwitcher;
