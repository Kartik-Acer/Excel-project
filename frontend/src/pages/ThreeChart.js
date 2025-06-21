import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

const Bar3D = ({ position, height, color }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[position[0], height / 2, position[2]]}
      castShadow
    >
      <boxGeometry args={[0.8, height, 0.8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const ThreeChart = ({ data, config }) => {
  if (!data || !data.datasets || !data.datasets[0]) {
    return (
      <div
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>No data available for 3D chart</p>
      </div>
    );
  }

  const values = data.datasets[0].data;
  const labels = data.labels;
  const maxValue = Math.max(...values);
  const normalizedValues = values.map((val) => (val / maxValue) * 5); // Scale to max height of 5

  const colors = [
    "#667eea",
    "#764ba2",
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#ffeaa7",
    "#dda0dd",
  ];

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }} shadows>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Ground plane */}
        <mesh
          receiveShadow
          position={[0, -0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>

        {/* 3D Bars */}
        {normalizedValues.map((height, index) => (
          <Bar3D
            key={index}
            position={[index * 2 - (normalizedValues.length - 1), 0, 0]}
            height={height}
            color={colors[index % colors.length]}
          />
        ))}

        {/* Labels */}
        {labels.map((label, index) => (
          <Text
            key={index}
            position={[index * 2 - (normalizedValues.length - 1), -1, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.3}
            color="#333"
            anchorX="center"
            anchorY="middle"
          >
            {String(label).substring(0, 10)}
          </Text>
        ))}

        {/* Title */}
        <Text
          position={[0, 6, 0]}
          fontSize={0.5}
          color="#333"
          anchorX="center"
          anchorY="middle"
        >
          {config.title}
        </Text>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default ThreeChart;
