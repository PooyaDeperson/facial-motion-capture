import { Html, useProgress } from "@react-three/drei";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader">
        <div className="spinner" />
        <p>
          {/* {Math.round(progress)} */}
          Loading character...</p>
      </div>
    </Html>
  );
}

export default Loader;
