import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, useGLTF, SpotLight } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import './App.css';

// Component to create an orbit path
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

// Camera control to zoom to clicked planet
function CameraControl({ targetPosition, zoomIn }) {
  const { camera } = useThree();
  useFrame(() => {
    if (zoomIn) {
      camera.position.lerp(targetPosition, 0.05);
      camera.lookAt(targetPosition);
    } else {
      camera.position.lerp(new THREE.Vector3(0, 15, 25), 0.05);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  });
  return null;
}

// Generic Planet Component
function Planet({ modelPath, orbitRadiusX, orbitRadiusZ, speed, scale, rotationSpeed, onClick, label }) {
  const ref = useRef();
  const { scene } = useGLTF(modelPath);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    ref.current.position.set(orbitRadiusX * Math.cos(t), 0, orbitRadiusZ * Math.sin(t));
    ref.current.rotation.y += rotationSpeed;
  });

  return <primitive object={scene} ref={ref} scale={scale} onClick={onClick} />;
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

// Overlay Component for Section Information
function InfoOverlay({ section, onClose }) {
  return (
    <div className="info-overlay">
      <h2>{section.title}</h2>
      <p>{section.content}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

function App() {
  const [zoomTarget, setZoomTarget] = useState(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // Portfolio sections data
  const sections = {
    Mercury: { title: "About Me", content: "I am a passionate developer..." },
    Venus: { title: "Skills", content: "JavaScript, React, Node.js..." },
    Earth: { title: "Projects", content: "Portfolio Website, E-commerce App..." },
    Mars: { title: "Experience", content: "Worked at XYZ company..." },
    Jupiter: { title: "Education", content: "Bachelor's in Computer Science..." },
    Saturn: { title: "Contact", content: "Email: example@example.com..." }
  };

  const handlePlanetClick = (position, sectionName) => {
    setZoomTarget(new THREE.Vector3(position.x, position.y, position.z));
    setSelectedSection(sections[sectionName]);
    setIsZoomedIn(true);
  };

  const handleBackgroundClick = () => {
    setIsZoomedIn(false);
    setSelectedSection(null);
  };

  return (
    <div className="app" onClick={handleBackgroundClick}>
      <Canvas 
        style={{ height: '100vh', width: '100vw', background: '#0a0a0a' }}
        camera={{ position: [0, 15, 25], fov: 75 }}
        shadows
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <directionalLight intensity={1} position={[-10, -10, -10]} castShadow />
        <SpotLight position={[5, 10, 10]} intensity={2} angle={0.15} penumbra={1} castShadow />

        <NebulaBackground />
        <MovingStars />

        {isZoomedIn && <CameraControl targetPosition={zoomTarget} zoomIn={isZoomedIn} />}

        <Suspense fallback={null}>
          <Sun />
          
          {/* Mercury */}
          <Planet 
            modelPath="models/Mercury_1_4878.glb" 
            orbitRadiusX={12} 
            orbitRadiusZ={8} 
            speed={0.4} 
            scale={0.003} 
            rotationSpeed={0.001} 
            onClick={(e) => handlePlanetClick(e.object.position, "Mercury")}
          />
          
          {/* Venus */}
          <Planet 
            modelPath="models/Venus_1_12103.glb" 
            orbitRadiusX={18} 
            orbitRadiusZ={14} 
            speed={0.3} 
            scale={0.004} 
            rotationSpeed={0.0008} 
            onClick={(e) => handlePlanetClick(e.object.position, "Venus")}
          />

          {/* Earth */}
          <Planet 
            modelPath="models/Earth_1_12756.glb" 
            orbitRadiusX={24} 
            orbitRadiusZ={20} 
            speed={0.25} 
            scale={0.004} 
            rotationSpeed={0.0007} 
            onClick={(e) => handlePlanetClick(e.object.position, "Earth")}
          />

          {/* Mars */}
          <Planet 
            modelPath="models/24881_Mars_1_6792.glb" 
            orbitRadiusX={30} 
            orbitRadiusZ={26} 
            speed={0.2} 
            scale={0.0035} 
            rotationSpeed={0.0005} 
            onClick={(e) => handlePlanetClick(e.object.position, "Mars")}
          />

          {/* Jupiter */}
          <Planet 
            modelPath="models/Jupiter_1_142984.glb" 
            orbitRadiusX={38} 
            orbitRadiusZ={32} 
            speed={0.15} 
            scale={0.008} 
            rotationSpeed={0.0004} 
            onClick={(e) => handlePlanetClick(e.object.position, "Jupiter")}
          />

          {/* Saturn */}
          <Planet 
            modelPath="models/Saturn_1_120536.glb" 
            orbitRadiusX={46} 
            orbitRadiusZ={40} 
            speed={0.1} 
            scale={0.007} 
            rotationSpeed={0.0003} 
            onClick={(e) => handlePlanetClick(e.object.position, "Saturn")}
          />
        </Suspense>

        {/* Orbits */}
        <EllipticalOrbitPath radiusX={12} radiusZ={8} color="#A6E22E" />
        <EllipticalOrbitPath radiusX={18} radiusZ={14} color="#F92672" />
        <EllipticalOrbitPath radiusX={24} radiusZ={20} color="#66D9EF" />
        <EllipticalOrbitPath radiusX={30} radiusZ={26} color="#FFA500" />
        <EllipticalOrbitPath radiusX={38} radiusZ={32} color="#FF4500" />
        <EllipticalOrbitPath radiusX={46} radiusZ={40} color="#FFD700" />

        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.1} luminanceSmoothing={0.9} />
        </EffectComposer>

        <OrbitControls maxPolarAngle={Math.PI / 2.5} minPolarAngle={Math.PI / 5} enableZoom={!isZoomedIn} minDistance={5} maxDistance={70} />
      </Canvas>

      {/* Info Overlay */}
      {selectedSection && (
        <InfoOverlay section={selectedSection} onClose={() => setSelectedSection(null)} />
      )}
    </div>
  );
}

export default App;
