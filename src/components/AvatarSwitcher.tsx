import React from 'react';
import './AvatarSwitcher.css';

interface AvatarSwitcherProps {
  onAvatarChange: (newUrl: string) => void;
}

const AvatarSwitcher: React.FC<AvatarSwitcherProps> = ({ onAvatarChange }) => {
  const avatars = [
    { name: 'Avatar 1', url: 'avatar/avatar1.glb' },
    { name: 'Avatar 2', url: 'avatar/avatar2.glb' }
  ];

  return (
    <div className="avatar-switcher">
      {avatars.map((avatar) => (
        <button key={avatar.name} onClick={() => onAvatarChange(avatar.url)}>
          {avatar.name}
        </button>
      ))}
    </div>
  );
};

export default AvatarSwitcher;
