import { Html, useProgress } from "@react-three/drei";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader">
        <div className="spinner" />
        <p>{Math.round(progress)}% loaded</p>
      </div>
    </Html>
  );
}

export default Loader;
