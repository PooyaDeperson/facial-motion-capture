import React, { useEffect } from "react";

interface AvatarSwitcherProps {
  onAvatarChange: (newUrl: string) => void;
  activeUrl: string | null;
}

const AvatarSwitcher: React.FC<AvatarSwitcherProps> = ({ onAvatarChange, activeUrl }) => {
  const avatars = [
    { name: "Avatar 1", url: "https://models.readyplayer.me/68c19bef8ac0d37a66aa2930.glb?morphTargets=ARKit&textureAtlas=1024" },
    { name: "Avatar 2", url: "https://models.readyplayer.me/68c1b98163cdbdf2d3403aab.glb?morphTargets=ARKit&textureAtlas=1024" },
    { name: "Avatar 3", url: "https://models.readyplayer.me/68dcef4322326403eca002f5.glb?morphTargets=ARKit&textureAtlas=1024" },
    { name: "Avatar 4", url: "https://models.readyplayer.me/68dcf93c9603200be52d3e3d.glb?morphTargets=ARKit&textureAtlas=1024" },
    { name: "Avatar 5", url: "https://models.readyplayer.me/68dcf9d16c40ed329a4e4681.glb?morphTargets=ARKit&textureAtlas=1024" },
  ];

  useEffect(() => {
    if (!activeUrl) {
      onAvatarChange(avatars[0].url);
    }
  }, []);

  return (
    <div className="avatar-switcher z-6">
      {avatars.map((avatar, index) => {
        const isActive = activeUrl === avatar.url;
        return (
          <button
            key={avatar.name}
            onClick={() => !isActive && onAvatarChange(avatar.url)}
            className={`avatar-btn avatar-selection avatar${index + 1} ${isActive ? "active" : ""}`}
            disabled={isActive} // prevent re-selecting
          >
            {/* {avatar.name} */}
          </button>
        );
      })}
    </div>
  );
};

export default AvatarSwitcher;
