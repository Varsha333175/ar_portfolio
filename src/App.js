import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, useGLTF, SpotLight } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import './App.css';

// Component to create an orbit path
function EllipticalOrbitPath({ radiusX, radiusZ, color, lineWidth }) {
  const points = [];
  const segments = 100;

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(radiusX * Math.cos(theta), 0, radiusZ * Math.sin(theta)));
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <lineBasicMaterial attach="material" color={color} linewidth={lineWidth} />
    </line>
  );
}

// Component for rotating stars
function MovingStars() {
  const starsRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    starsRef.current.rotation.x = t * 0.02;
    starsRef.current.rotation.y = t * 0.05;
  });

  return (
    <Stars
      ref={starsRef}
      radius={300}
      depth={100}
      count={2000}
      factor={4}
      saturation={0}
      fade
      speed={0.3}
    />
  );
}

// Camera Controller Component to move the camera to selected planet
function CameraController({ planetPosition, selectedPlanet }) {
  const { camera } = useThree();

  useFrame(() => {
    if (selectedPlanet) {
      camera.position.lerp(planetPosition, 0.05);
      camera.lookAt(planetPosition);
    }
  });

  return null;
}


// Generic Planet Component
function Planet({ modelPath, orbitRadiusX, orbitRadiusZ, speed, scale, rotationSpeed, isSelected, setPlanetPosition }) {
  const ref = useRef();
  const { scene } = useGLTF(modelPath);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    const x = orbitRadiusX * Math.cos(t);
    const z = orbitRadiusZ * Math.sin(t);
    ref.current.position.set(x, 0, z);
    ref.current.rotation.y += rotationSpeed;

    if (isSelected) {
      setPlanetPosition(new THREE.Vector3(x, 0, z));
    }
  });

  return (
    <primitive
      object={scene}
      ref={ref}
      scale={isSelected ? scale * 1.2 : scale} // Increase scale when selected
    />
  );
}

// Sun Component with glow effect
function Sun() {
  const { scene } = useGLTF('models/Sun_1_1391000.glb');
  return <primitive object={scene} scale={0.005} position={[0, 0, 0]} castShadow />;
}

// Background Nebula
function NebulaBackground() {
  const texture = new THREE.TextureLoader().load('models/dark_nebula.webp');
  texture.wrapS = THREE.MirroredRepeatWrapping;
  texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.repeat.set(1, 1);

  return (
    <Sphere args={[500, 128, 128]} scale={-1}>
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </Sphere>
  );
}
function App() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [planetPosition, setPlanetPosition] = useState(new THREE.Vector3(0, 0, 0));

  const handlePlanetSelect = (event) => {
    setSelectedPlanet(event.target.value);
  };

  return (
    <div className="app">
      <select onChange={handlePlanetSelect} className="planet-dropdown">
        <option value="">Select a Planet</option>
        <option value="Mercury">Mercury</option>
        <option value="Venus">Venus</option>
        <option value="Earth">Earth</option>
        <option value="Mars">Mars</option>
        <option value="Jupiter">Jupiter</option>
        <option value="Saturn">Saturn</option>
      </select>

      <Canvas 
        style={{ height: '100vh', width: '100vw', background: '#0a0a0a' }}
        camera={{ position: [0, 15, 25], fov: 75 }}
        shadows
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <directionalLight intensity={0.8} position={[-10, -10, -10]} castShadow />
        <SpotLight position={[5, 10, 10]} intensity={1.5} angle={0.2} penumbra={0.9} castShadow />

        <NebulaBackground />
        <MovingStars />

        <CameraController planetPosition={planetPosition} selectedPlanet={selectedPlanet} />

        <Suspense fallback={null}>
          <Sun />

          {/* Planets with conditional selection */}
          <Planet modelPath="models/Mercury_1_4878.glb" orbitRadiusX={12} orbitRadiusZ={8} speed={0.1} scale={0.003} rotationSpeed={0.002} isSelected={selectedPlanet === "Mercury"} setPlanetPosition={setPlanetPosition} />
          <Planet modelPath="models/Venus_1_12103.glb" orbitRadiusX={18} orbitRadiusZ={14} speed={0.08} scale={0.004} rotationSpeed={0.0015} isSelected={selectedPlanet === "Venus"} setPlanetPosition={setPlanetPosition} />
          <Planet modelPath="models/Earth_1_12756.glb" orbitRadiusX={24} orbitRadiusZ={20} speed={0.06} scale={0.004} rotationSpeed={0.0012} isSelected={selectedPlanet === "Earth"} setPlanetPosition={setPlanetPosition} />
          <Planet modelPath="models/24881_Mars_1_6792.glb" orbitRadiusX={30} orbitRadiusZ={26} speed={0.05} scale={0.0035} rotationSpeed={0.001} isSelected={selectedPlanet === "Mars"} setPlanetPosition={setPlanetPosition} />
          <Planet modelPath="models/Jupiter_1_142984.glb" orbitRadiusX={38} orbitRadiusZ={32} speed={0.04} scale={0.008} rotationSpeed={0.0008} isSelected={selectedPlanet === "Jupiter"} setPlanetPosition={setPlanetPosition} />
          <Planet modelPath="models/Saturn_1_120536.glb" orbitRadiusX={46} orbitRadiusZ={40} speed={0.03} scale={0.007} rotationSpeed={0.0006} isSelected={selectedPlanet === "Saturn"} setPlanetPosition={setPlanetPosition} />
        </Suspense>

        {/* Orbits */}
        <EllipticalOrbitPath radiusX={12} radiusZ={8} color="#A6E22E" lineWidth={2} />
        <EllipticalOrbitPath radiusX={18} radiusZ={14} color="#F92672" lineWidth={2} />
        <EllipticalOrbitPath radiusX={24} radiusZ={20} color="#66D9EF" lineWidth={2} />
        <EllipticalOrbitPath radiusX={30} radiusZ={26} color="#FFA500" lineWidth={2} />
        <EllipticalOrbitPath radiusX={38} radiusZ={32} color="#FF4500" lineWidth={2} />
        <EllipticalOrbitPath radiusX={46} radiusZ={40} color="#FFD700" lineWidth={2} />

        <OrbitControls maxPolarAngle={Math.PI / 2.5} minPolarAngle={Math.PI / 5} enableZoom minDistance={5} maxDistance={70} />
      </Canvas>
    </div>
  );
}

export default App;


