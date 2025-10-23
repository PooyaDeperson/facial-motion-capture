// AvatarLoader.tsx
import React, { useEffect, useState } from "react";

interface AvatarLoaderProps {
  visible: boolean;
  initialMessage?: string;
  secondMessage?: string;
  thirdMessage?: string;
  secondDelay?: number; // default 10s
  thirdDelay?: number;  // default 20s
}

const AvatarLoader: React.FC<AvatarLoaderProps> = ({
  visible,
  initialMessage = "Just a little patience...",
  secondMessage = "Someone’s on the way!",
  thirdMessage = "I promise, someone is coming...",
  secondDelay = 10000,
  thirdDelay = 20000,
}) => {
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (!visible) return;

    setMessage(initialMessage); // reset when visible again

    const timers: NodeJS.Timeout[] = [];

    // show message 2
    timers.push(
      setTimeout(() => {
        setMessage(secondMessage);
      }, secondDelay)
    );

    // show message 3
    timers.push(
      setTimeout(() => {
        setMessage(thirdMessage);
      }, thirdDelay)
    );

    return () => timers.forEach(clearTimeout);
  }, [visible, initialMessage, secondMessage, thirdMessage, secondDelay, thirdDelay]);

  if (!visible) return null;

return (
  <div
    className="avatar-loader-container flex flex-col items-center justify-center space-y-3 fixed inset-0 bg-white/80 backdrop-blur-sm z-50"
    style={{
      backgroundImage: "url('/images/app/image_avatar_skeleton.svg')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center bottom",
      backgroundSize: "cover",
    }}
  >
    {/* <div className="spinner w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" /> */}
    <p className="avatar-loader-text text-gray-700 text-sm">{message}</p>
  </div>
);

};

export default AvatarLoader;
