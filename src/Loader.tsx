// Loader.tsx
import React from "react";

interface LoaderProps {
  visible: boolean;
}

const Loader: React.FC<LoaderProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="loader">
      <div className="spinner" />
      <p className="avatar-loader-text">Avatar coming...</p>
    </div>
  );
};

export default Loader;
