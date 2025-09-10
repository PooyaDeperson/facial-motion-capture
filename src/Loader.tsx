import { Html, useProgress } from "@react-three/drei";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader">
        <div className="spinner" />
        <p className="avatar-loader-text">
          {/* {Math.round(progress)} */}
          avatar coming...</p>
      </div>
    </Html>
  );
}

export default Loader;
