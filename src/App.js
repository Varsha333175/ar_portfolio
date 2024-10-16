import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, useGLTF, SpotLight } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
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
function CameraController({ selectedPlanet, planetPositions }) {
  const { camera } = useThree();
  const prevPlanet = useRef(null);

  useEffect(() => {
    if (selectedPlanet && planetPositions[selectedPlanet]) {
      const [x, y, z] = planetPositions[selectedPlanet];
      if (prevPlanet.current !== selectedPlanet) {
        gsap.to(camera.position, {
          x: x + 5,
          y: y + 2,
          z: z + 5,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => camera.lookAt(x, y, z)
        });
        prevPlanet.current = selectedPlanet;
      }
    } else {
      gsap.to(camera.position, {
        x: 0,
        y: 15,
        z: 25,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => camera.lookAt(0, 0, 0)
      });
      prevPlanet.current = null;
    }
  }, [selectedPlanet, planetPositions, camera]);

  return null;
}

// Generic Planet Component
function Planet({ modelPath, orbitRadiusX, orbitRadiusZ, speed, scale, rotationSpeed, selected, onClick }) {
  const ref = useRef();
  const { scene } = useGLTF(modelPath);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    const x = orbitRadiusX * Math.cos(t);
    const z = orbitRadiusZ * Math.sin(t);

    if (!selected) {
      ref.current.position.set(x, 0, z);
      ref.current.rotation.y += rotationSpeed;
    } else {
      ref.current.position.set(0, 0, 0);
    }
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

// Surface Overlay Component
function SurfaceOverlay({ showSurfaceView, onClose, imagePath, content }) {
  if (!showSurfaceView) return null;

  return (
    <div className="surface-overlay">
      <img src={imagePath} alt="Planet Surface" className="surface-image" />
      <div className="overlay-content">
        {content}
      </div>
      <button className="close-button" onClick={onClose}>Close</button>
    </div>
  );
}

// Controls Component
function Controls({ selectedPlanet, planetRef }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (selectedPlanet && planetRef.current) {
      controlsRef.current.target.copy(planetRef.current.position);
      controlsRef.current.update();
    } else {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [selectedPlanet, planetRef]);

  return <OrbitControls ref={controlsRef} args={[camera, gl.domElement]} enableZoom enablePan={false} />;
}

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showSurfaceView, setShowSurfaceView] = useState(false);
  const [surfaceImage, setSurfaceImage] = useState('');
  const [surfaceContent, setSurfaceContent] = useState(null);
  const planetRef = useRef();

  const planetPositions = {
    Mercury: [12, 0, 8],
    Venus: [18, 0, 14],
    Earth: [24, 0, 20],
    Mars: [30, 0, 26],
    Jupiter: [38, 0, 32],
    Saturn: [46, 0, 40],
  };

  const handlePlanetClick = (planet) => {
    setShowSurfaceView(true);

    // Set surface image and content based on the selected planet
    switch (planet) {
      case 'Mercury':
        setSurfaceImage('models/mercury_surface.jpg');
        setSurfaceContent(<p>Mercury - Professional Summary</p>);
        break;
      case 'Venus':
        setSurfaceImage('models/venus_surface.jpg');
        setSurfaceContent(<p>Venus - Experience Overview</p>);
        break;
      case 'Earth':
        setSurfaceImage('models/earth_surface.jpg');
        setSurfaceContent(<p>Earth - Skill Set</p>);
        break;
      case 'Mars':
        setSurfaceImage('models/mars_surface.jpg');
        setSurfaceContent(<p>Mars - Projects</p>);
        break;
      case 'Jupiter':
        setSurfaceImage('models/jupiter_surface.jpg');
        setSurfaceContent(<p>Jupiter - Certifications</p>);
        break;
      case 'Saturn':
        setSurfaceImage('models/saturn_surface.jpg');
        setSurfaceContent(<p>Saturn - Education</p>);
        break;
      default:
        break;
    }
  };

  const handleCloseSurfaceView = () => {
    setShowSurfaceView(false);
  };

  return (
    <div className="app">
      <div className="dropdown">
        <label htmlFor="planet-select">Select a planet: </label>
        <select
          id="planet-select"
          onChange={(e) => setSelectedPlanet(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Select a planet</option>
          <option value="Mercury">Mercury</option>
          <option value="Venus">Venus</option>
          <option value="Earth">Earth</option>
          <option value="Mars">Mars</option>
          <option value="Jupiter">Jupiter</option>
          <option value="Saturn">Saturn</option>
        </select>
        <button onClick={() => setSelectedPlanet(null)}>Reset View</button>
      </div>

      <Canvas
        style={{ height: '100vh', width: '100vw', background: '#0a0a0a' }}
        camera={{ position: [0, 15, 25], fov: 75 }}
        shadows
      >
        <CameraController selectedPlanet={selectedPlanet} planetPositions={planetPositions} />
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <SpotLight position={[5, 10, 10]} intensity={2} angle={0.15} penumbra={1} castShadow />

        <NebulaBackground />
        <MovingStars />

        <Suspense fallback={null}>
          {selectedPlanet === null && <Sun />}
          {/* Planets */}
          {(selectedPlanet === null || selectedPlanet === "Mercury") && (
            <Planet 
              modelPath="models/Mercury_1_4878.glb" 
              orbitRadiusX={12} 
              orbitRadiusZ={8} 
              speed={0.1} 
              scale={0.003} 
              rotationSpeed={0.002} 
              selected={selectedPlanet === "Mercury"}
              onClick={() => handlePlanetClick("Mercury")}
              ref={selectedPlanet === "Mercury" ? planetRef : null}
            />
          )}
          {(selectedPlanet === null || selectedPlanet === "Venus") && (
            <Planet 
              modelPath="models/Venus_1_12103.glb" 
              orbitRadiusX={18} 
              orbitRadiusZ={14} 
              speed={0.08} 
              scale={0.004} 
              rotationSpeed={0.0015} 
              selected={selectedPlanet === "Venus"}
              onClick={() => handlePlanetClick("Venus")}
              ref={selectedPlanet === "Venus" ? planetRef : null}
            />
          )}
          {(selectedPlanet === null || selectedPlanet === "Earth") && (
            <Planet 
              modelPath="models/Earth_1_12756.glb" 
              orbitRadiusX={24} 
              orbitRadiusZ={20} 
              speed={0.06} 
              scale={0.004} 
              rotationSpeed={0.0012} 
              selected={selectedPlanet === "Earth"}
              onClick={() => handlePlanetClick("Earth")}
              ref={selectedPlanet === "Earth" ? planetRef : null}
            />
          )}
          {(selectedPlanet === null || selectedPlanet === "Mars") && (
            <Planet 
              modelPath="models/24881_Mars_1_6792.glb" 
              orbitRadiusX={30} 
              orbitRadiusZ={26} 
              speed={0.05} 
              scale={0.0035} 
              rotationSpeed={0.001} 
              selected={selectedPlanet === "Mars"}
              onClick={() => handlePlanetClick("Mars")}
              ref={selectedPlanet === "Mars" ? planetRef : null}
            />
          )}
          {(selectedPlanet === null || selectedPlanet === "Jupiter") && (
            <Planet 
              modelPath="models/Jupiter_1_142984.glb" 
              orbitRadiusX={38} 
              orbitRadiusZ={32} 
              speed={0.04} 
              scale={0.008} 
              rotationSpeed={0.0008} 
              selected={selectedPlanet === "Jupiter"}
              onClick={() => handlePlanetClick("Jupiter")}
              ref={selectedPlanet === "Jupiter" ? planetRef : null}
            />
          )}
          {(selectedPlanet === null || selectedPlanet === "Saturn") && (
            <Planet 
              modelPath="models/Saturn_1_120536.glb" 
              orbitRadiusX={46} 
              orbitRadiusZ={40} 
              speed={0.03} 
              scale={0.007} 
              rotationSpeed={0.0006} 
              selected={selectedPlanet === "Saturn"}
              onClick={() => handlePlanetClick("Saturn")}
              ref={selectedPlanet === "Saturn" ? planetRef : null}
            />
          )}
        </Suspense>

        {selectedPlanet === null && (
          <>
            <EllipticalOrbitPath radiusX={12} radiusZ={8} color="#A6E22E" lineWidth={2} />
            <EllipticalOrbitPath radiusX={18} radiusZ={14} color="#F92672" lineWidth={2} />
            <EllipticalOrbitPath radiusX={24} radiusZ={20} color="#66D9EF" lineWidth={2} />
            <EllipticalOrbitPath radiusX={30} radiusZ={26} color="#FFA500" lineWidth={2} />
            <EllipticalOrbitPath radiusX={38} radiusZ={32} color="#FF4500" lineWidth={2} />
            <EllipticalOrbitPath radiusX={46} radiusZ={40} color="#FFD700" lineWidth={2} />
          </>
        )}

        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.1} luminanceSmoothing={0.9} />
        </EffectComposer>
        <Controls selectedPlanet={selectedPlanet} planetRef={planetRef} />
      </Canvas>

      <SurfaceOverlay showSurfaceView={showSurfaceView} onClose={handleCloseSurfaceView} imagePath={surfaceImage} content={surfaceContent} />
    </div>
  );
}

export default App;
