import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, useGLTF } from '@react-three/drei';
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

// Component for rotating stars with reduced brightness
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
      count={3000} // Reduce star count
      factor={5} // Reduce brightness
      saturation={0}
      fade
      speed={0.3}
    />
  );
}

// Component for an orbiting planet using the Mercury model
function OrbitingMercury({ orbitRadiusX, orbitRadiusZ, speed }) {
  const ref = useRef();
  const { scene } = useGLTF('models/Mercury_1_4878.glb');

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    ref.current.position.set(orbitRadiusX * Math.cos(t), 0, orbitRadiusZ * Math.sin(t));
  });

  return <primitive object={scene} ref={ref} scale={0.001} />;
}

// Component for an orbiting planet using the Venus model
function OrbitingVenus({ orbitRadiusX, orbitRadiusZ, speed }) {
  const ref = useRef();
  const { scene } = useGLTF('models/Venus_1_12103.glb');

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    ref.current.position.set(orbitRadiusX * Math.cos(t), 0, orbitRadiusZ * Math.sin(t));
  });

  return <primitive object={scene} ref={ref} scale={0.002} />;
}

// Component for an orbiting planet using the Earth model
function OrbitingEarth({ orbitRadiusX, orbitRadiusZ, speed }) {
  const ref = useRef();
  const { scene } = useGLTF('models/Earth_1_12756.glb');

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    ref.current.position.set(orbitRadiusX * Math.cos(t), 0, orbitRadiusZ * Math.sin(t));
  });

  return <primitive object={scene} ref={ref} scale={0.002} />;
}

// Component for elliptical orbit path with updated colors
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

// Component for the Sun model with enhanced lighting
function Sun() {
  const { scene } = useGLTF('models/Sun_1_1391000.glb');
  return <primitive object={scene} scale={0.005} position={[0, 0, 0]} />;
}

function App() {
  return (
    <div className="app">
      <Canvas 
        style={{ height: '100vh', width: '100vw', background: '#0a0a0a' }} // Dark grey background
        camera={{ position: [0, 15, 25], fov: 75 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <directionalLight intensity={0.5} position={[5, 5, 5]} />

        <MovingStars />

        {/* Sun in the center */}
        <Suspense fallback={null}>
          <Sun />
        </Suspense>

        {/* Elliptical Orbits with updated colors */}
        <EllipticalOrbitPath radiusX={12} radiusZ={8} color="#A6E22E" /> // Bright green
        <EllipticalOrbitPath radiusX={18} radiusZ={14} color="#F92672" /> // Bright pink
        <EllipticalOrbitPath radiusX={24} radiusZ={20} color="#66D9EF" /> // Light blue

        {/* Mercury, Venus, and Earth on Elliptical Orbits */}
        <Suspense fallback={null}>
          <OrbitingMercury orbitRadiusX={12} orbitRadiusZ={8} speed={0.3} />
          <OrbitingVenus orbitRadiusX={18} orbitRadiusZ={14} speed={0.2} />
          <OrbitingEarth orbitRadiusX={24} orbitRadiusZ={20} speed={0.1} />
        </Suspense>

        <OrbitControls maxPolarAngle={Math.PI / 2.5} minPolarAngle={Math.PI / 5} />
      </Canvas>
    </div>
  );
}

export default App;
