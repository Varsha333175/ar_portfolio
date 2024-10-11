import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, useGLTF, SpotLight, Html, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import './App.css';

// Component to create an orbit path
function OrbitPath({ radius, color }) {
  const points = [];
  const segments = 64;

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
  }

  return <Line points={points} color={color} lineWidth={0.5} />;
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

// Asteroid Belt Component
function AsteroidBelt() {
  const asteroids = [];
  for (let i = 0; i < 500; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 28 + Math.random() * 2;
    const position = new THREE.Vector3(
      distance * Math.cos(angle),
      (Math.random() - 0.5) * 0.5,
      distance * Math.sin(angle)
    );
    asteroids.push(
      <mesh position={position} scale={0.1}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
    );
  }
  return <group>{asteroids}</group>;
}

// Post-Processing Effects Component
function Effects() {
  return (
    <EffectComposer>
      <Bloom intensity={1.5} luminanceThreshold={0.1} luminanceSmoothing={0.9} />
      <DepthOfField focusDistance={0.02} focalLength={0.02} bokehScale={2} />
    </EffectComposer>
  );
}

// Background Nebula Sphere
function NebulaBackground() {
  const texture = new THREE.TextureLoader().load('/models/nebula3.webp');
  texture.mapping = THREE.EquirectangularReflectionMapping; // Use spherical mapping for a seamless wrap
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping; // This can reduce stretching at seams

  return (
    <Sphere args={[500, 64, 64]} scale={-1}>
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </Sphere>
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

        <NebulaBackground />
        <MovingStars />

        <Suspense fallback={null}>
          <Sun />
          <AsteroidBelt />
          
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

        <Effects />
        <OrbitControls maxPolarAngle={Math.PI / 2.5} minPolarAngle={Math.PI / 5} enableZoom minDistance={5} maxDistance={50} />
      </Canvas>
    </div>
  );
}

export default App;
