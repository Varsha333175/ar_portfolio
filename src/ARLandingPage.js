import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import './ARLandingPage.css';

function RotatingOrb({ position, color, label, description, icon, angleOffset }) {
  const ref = useRef();
  const infoRef = useRef();

  const handlePointerEnter = () => {
    ref.current.scale.set(1.3, 1.3, 1.3);
    infoRef.current.style.opacity = 1;
    infoRef.current.style.transform = 'translate(-50%, -120%)';
  };

  const handlePointerLeave = () => {
    ref.current.scale.set(1, 1, 1);
    infoRef.current.style.opacity = 0;
    infoRef.current.style.transform = 'translate(-50%, -100%)';
  };

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const radius = 6;
    const angle = angleOffset + elapsed * 0.2;
    ref.current.position.set(
      radius * Math.cos(angle),
      0,
      radius * Math.sin(angle)
    );
  });

  return (
    <group
      ref={ref}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </Sphere>
      <Html center>
        <div className="orb-content">
          <div className="icon">{icon}</div>
          <p>{label}</p>
          <div className="info-box" ref={infoRef}>{description}</div>
        </div>
      </Html>
    </group>
  );
}

function ARLandingPage() {
  const navigate = useNavigate();
  const orbPositions = [
    [6, 0, 0],       // Placeholder for Idea
    [0, 0, 6],       // Placeholder for Design
    [-6, 0, 0],      // Placeholder for Development
    [0, 0, -6],      // Placeholder for Launch
  ];

  const handleEnterClick = () => {
    navigate('/portfolio');
  };

  return (
    <div className="ar-landing-page">
      <h1 className="title">Welcome to My AR Portfolio</h1>
      <Canvas style={{ width: '100%', height: '100vh', background: '#00172D' }} camera={{ position: [0, 5, 14], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Rotating Orbs */}
        <RotatingOrb position={orbPositions[0]} color="#48CAE4" label="Idea" description="Where everything begins" icon="💡" angleOffset={0} />
        <RotatingOrb position={orbPositions[1]} color="#0096C7" label="Design" description="Shaping the vision" icon="✏️" angleOffset={Math.PI / 2} />
        <RotatingOrb position={orbPositions[2]} color="#0077B6" label="Development" description="Bringing it to life" icon="⚙️" angleOffset={Math.PI} />
        <RotatingOrb position={orbPositions[3]} color="#023E8A" label="Launch" description="Sharing with the world" icon="🚀" angleOffset={(3 * Math.PI) / 2} />
      </Canvas>
      <button className="enter-button" onClick={handleEnterClick}>Enter AR Experience</button>
    </div>
  );
}

export default ARLandingPage;
