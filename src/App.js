import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

// Component to create an orbit path
function OrbitPath({ radius, color = '#00FFFF' }) {
  const points = [];
  const segments = 64;

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
  }

  return <Line points={points} color={color} lineWidth={0.5} />;
}

// Component for a planet that follows an orbit


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
      count={5000}
      factor={10}
      saturation={0}
      fade
      speed={0.3}
    />
  );
}
function OrbitingPlanet({ radius, orbitRadiusX, orbitRadiusZ, speed, color }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    ref.current.position.set(orbitRadiusX * Math.cos(t), 0, orbitRadiusZ * Math.sin(t));
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function EllipticalOrbitPath({ radiusX, radiusZ, color }) {
  const points = [];
  const segments = 100; // Higher segments for a smoother orbit

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



function App() {
  return (
    <div className="app">
      <Canvas 
  style={{ height: '100vh', width: '100vw', background: '#000' }}
  camera={{ position: [0, 15, 25], fov: 75 }}
>
  <ambientLight intensity={0.3} />
  <pointLight position={[10, 10, 10]} intensity={1} />

  <MovingStars />

  {/* Elliptical Orbits */}
  <EllipticalOrbitPath radiusX={12} radiusZ={8} color="#00FF00" />
  <EllipticalOrbitPath radiusX={18} radiusZ={14} color="#FF00FF" />

  {/* Planets on Elliptical Orbits */}
  <OrbitingPlanet radius={0.5} orbitRadiusX={12} orbitRadiusZ={8} speed={0.3} color="#FF5733" />
  <OrbitingPlanet radius={0.7} orbitRadiusX={18} orbitRadiusZ={14} speed={0.2} color="#3399FF" />

  <OrbitControls maxPolarAngle={Math.PI / 2.5} minPolarAngle={Math.PI / 5} />
</Canvas>

    </div>
  );
}

export default App;
