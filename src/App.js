import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Line } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import gsap from 'gsap';
import * as THREE from 'three';
import './App.css';

function FloatingObject({ position, color, label, onClick }) {
  const ref = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!isHovered) {
      ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime()) * 0.5;
    }
    ref.current.scale.set(
      isHovered ? 1.2 + Math.sin(clock.getElapsedTime() * 3) * 0.05 : 1,
      isHovered ? 1.2 + Math.sin(clock.getElapsedTime() * 3) * 0.05 : 1,
      isHovered ? 1.2 + Math.sin(clock.getElapsedTime() * 3) * 0.05 : 1
    );
  });

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    gsap.to(ref.current.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.2, yoyo: true, repeat: 1 });
    gsap.to(ref.current.rotation, { y: `+=${Math.PI}`, duration: 0.6 });
    onClick(label);
  };

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={handleMouseEnter}
      onPointerOut={handleMouseLeave}
      onClick={handleClick}
    >
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial color={color} emissive={isHovered ? color : 'black'} emissiveIntensity={isHovered ? 2 : 0.5} />
      </Sphere>
      <Html distanceFactor={10}>
        <div style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>{label}</div>
      </Html>
    </mesh>
  );
}

function FloatingParticles({ mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 } }) {
  const pointsRef = useRef();
  const particleCount = 2000;
  const particlesPosition = useMemo(() => {
    const positions = [];
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, [particleCount]);

  useEffect(() => {
    if (pointsRef.current) {
      pointsRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(particlesPosition, 3)
      );
    }
  }, [particlesPosition]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position;
    if (!positions) return;

    const x = (mousePosition.x / window.innerWidth - 0.5) * 10;
    const y = (mousePosition.y / window.innerHeight - 0.5) * 10;

    for (let i = 0; i < positions.array.length; i += 3) {
      const dx = x - positions.array[i];
      const dy = y - positions.array[i + 1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 2) {
        positions.array[i] -= dx * 0.05;
        positions.array[i + 1] -= dy * 0.05;
      } else {
        positions.array[i] += (Math.random() - 0.5) * 0.05;
        positions.array[i + 1] += (Math.random() - 0.5) * 0.05;
      }
    }
    positions.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial size={0.1} color="#00FFFF" sizeAttenuation />
    </points>
  );
}

function CameraController({ mousePosition }) {
  const { camera } = useThree();

  useFrame(() => {
    const x = (mousePosition.x / window.innerWidth - 0.5) * 2;
    const y = (mousePosition.y / window.innerHeight - 0.5) * 2;
    gsap.to(camera.position, { x: x * 1.5, y: -y * 1.5, duration: 0.5 });
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function ContentOverlay({ activeSection, handleClose }) {
  const overlayRef = useRef();

  useEffect(() => {
    if (activeSection) {
      gsap.fromTo(overlayRef.current, { x: 300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 });
    }
  }, [activeSection]);

  const handleCloseClick = () => {
    gsap.to(overlayRef.current, { x: 300, opacity: 0, duration: 0.5, onComplete: handleClose });
  };

  return (
    <div ref={overlayRef} style={overlayStyle}>
      <div className="scan-line"></div>
      <h2>{activeSection}</h2>
      <p>This is the detailed information for the {activeSection} section.</p>
      <button onClick={handleCloseClick}>Close</button>
    </div>
  );
}

function AnimatedConnections() {
  const lines = [
    { start: [-3, 0, 0], end: [3, 0, 0] },
    { start: [3, 0, 0], end: [0, 3, -3] },
    { start: [0, 3, -3], end: [-3, 0, 0] }
  ];

  return (
    <>
      {lines.map((line, index) => (
        <Line
          key={index}
          points={[line.start, line.end]}
          color="cyan"
          lineWidth={1}
          dashed
          dashSize={0.3}
          gapSize={0.2}
        />
      ))}
    </>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const handleMouseMove = (event) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleSectionClick = (label) => {
    setActiveSection(label);
  };

  const handleClose = () => {
    setActiveSection(null);
  };

  return (
    <div onMouseMove={handleMouseMove}>
      <Canvas style={{ height: '100vh', background: '#121212' }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <CameraController mousePosition={mousePosition} />
        <FloatingParticles mousePosition={mousePosition} />
        <FloatingObject position={[-3, 0, 0]} color="blue" label="Skills" onClick={handleSectionClick} />
        <FloatingObject position={[3, 0, 0]} color="green" label="Projects" onClick={handleSectionClick} />
        <FloatingObject position={[0, 3, -3]} color="purple" label="Experience" onClick={handleSectionClick} />
        <AnimatedConnections />
        <OrbitControls />
        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>

      {activeSection && <ContentOverlay activeSection={activeSection} handleClose={handleClose} />}
    </div>
  );
}

const overlayStyle = {
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: 'translate(-50%, -20%)',
  background: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
  overflow: 'hidden',
  border: '2px solid rgba(0, 255, 255, 0.3)',
  zIndex: 1000,
};

export default App
