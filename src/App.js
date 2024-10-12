import React, { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF, SpotLight, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

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
      radius={200}
      depth={100}
      count={3000} 
      factor={5}
      saturation={0}
      fade
      speed={0.3}
    />
  );
}

// Component for the Sun with bloom and flare effect
function Sun() {
  const { scene } = useGLTF('models/Sun_1_1391000.glb');
  return <primitive object={scene} scale={0.005} position={[0, 0, 0]} castShadow />;
}

// Generic Orbiting Planet Component
function OrbitingPlanet({ modelPath, orbitRadiusX, orbitRadiusZ, speed, scale, rotationSpeed }) {
  const ref = useRef();
  const { scene } = useGLTF(modelPath);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    ref.current.position.set(orbitRadiusX * Math.cos(t), 0, orbitRadiusZ * Math.sin(t));
    ref.current.rotation.y += rotationSpeed;  // Rotate planet on its axis
  });

  return (
    <primitive object={scene} ref={ref} scale={scale} castShadow receiveShadow />
  );
}

// Component for Elliptical Orbit Paths
function EllipticalOrbitPath({ radiusX, radiusZ, color }) {
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
      <lineBasicMaterial attach="material" color={color} />
    </line>
  );
}

// Video Background Component
function VideoBackground() {
  const [videoTexture, setVideoTexture] = useState(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/models/nebulamp.mp4'; // Replace with the path to your MP4 file
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.play();

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    setVideoTexture(texture);
  }, []);

  return (
    videoTexture ? (
      <Sphere args={[500, 64, 64]} scale={-1}>
        <meshBasicMaterial map={videoTexture} side={THREE.BackSide} />
      </Sphere>
    ) : null
  );
}

function App() {
  return (
    <div className="app">
      <Canvas 
        style={{ height: '100vh', width: '100vw', background: '#0a0a0a' }}
        camera={{ position: [0, 15, 25], fov: 75 }}
        shadows
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={2} castShadow />
        <directionalLight intensity={1} position={[-10, -10, -10]} castShadow />
        <SpotLight position={[5, 10, 10]} intensity={2} angle={0.15} penumbra={1} castShadow />

        {/* Video Background */}
        <Suspense fallback={null}>
          <VideoBackground />
        </Suspense>

        <MovingStars />

        <Suspense fallback={null}>
          <Sun />
          
          {/* Mercury */}
          <OrbitingPlanet modelPath="models/Mercury_1_4878.glb" orbitRadiusX={12} orbitRadiusZ={8} speed={0.3} scale={0.001} rotationSpeed={0.005} />
          
          {/* Venus */}
          <OrbitingPlanet modelPath="models/Venus_1_12103.glb" orbitRadiusX={18} orbitRadiusZ={14} speed={0.2} scale={0.002} rotationSpeed={0.004} />

          {/* Earth with atmosphere */}
          <OrbitingPlanet modelPath="models/Earth_1_12756.glb" orbitRadiusX={24} orbitRadiusZ={20} speed={0.1} scale={0.002} rotationSpeed={0.003} />
        </Suspense>

        {/* Orbit Paths */}
        <EllipticalOrbitPath radiusX={12} radiusZ={8} color="#A6E22E" />
        <EllipticalOrbitPath radiusX={18} radiusZ={14} color="#F92672" />
        <EllipticalOrbitPath radiusX={24} radiusZ={20} color="#66D9EF" />

        <OrbitControls maxPolarAngle={Math.PI / 2.5} minPolarAngle={Math.PI / 5} enableZoom minDistance={5} maxDistance={50} />
      </Canvas>
    </div>
  );
}

export default App;
