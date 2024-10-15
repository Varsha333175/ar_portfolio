import React, { useRef, useState, useEffect, Suspense } from 'react';
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



// Generic Planet Component


// Sun Component with glow effect


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
function CameraController({ selectedPlanet, planetPositions }) {
  const { camera } = useThree();

  useEffect(() => {
    if (selectedPlanet && planetPositions[selectedPlanet]) {
      const [x, y, z] = planetPositions[selectedPlanet];
      camera.position.set(x + 5, y + 2, z + 5); // Offset the camera to ensure visibility
      camera.lookAt(x, y, z); // Make sure the camera centers on the planet
    } else {
      // Reset to original position if no planet is selected
      camera.position.set(0, 15, 25);
      camera.lookAt(0, 0, 0);
    }
  }, [selectedPlanet, planetPositions, camera]);

  return null;
}


// Planet Component
function Planet({ modelPath, orbitRadiusX, orbitRadiusZ, speed, scale, rotationSpeed, selected }) {
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

  return <primitive object={scene} ref={ref} scale={scale} />;
}

// Sun Component (only shown in full solar system view)
function Sun() {
  const { scene } = useGLTF('models/Sun_1_1391000.glb');
  return <primitive object={scene} scale={0.005} position={[0, 0, 0]} castShadow />;
}

// Controls Component - updates the controls based on the selected planet
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

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      maxPolarAngle={Math.PI / 2.5}
      minPolarAngle={Math.PI / 5}
      enableZoom
      minDistance={selectedPlanet ? 1 : 5}
      maxDistance={selectedPlanet ? 20 : 70}
    />
  );
}

// Unique ResumeSection Component with styles and animations
function ResumeSection({ section }) {
  return (
    <div className={`resume-section ${section.replace(/\s+/g, '-').toLowerCase()}`}>
      {section === "Professional Summary" && (
        <div className="fade-in" style={{ backgroundColor: "#ffeb3b" }}>
          <h2>Professional Summary</h2>
          <p>
            Full Stack Developer with 2+ years of experience in Java, Spring Boot, and AngularJS.
            Skilled in optimizing APIs and improving system performance in Agile teams.
          </p>
        </div>
      )}
      {section === "Education" && (
        <div className="slide-in" style={{ backgroundColor: "#42a5f5" }}>
          <h2>Education</h2>
          <p>
            Master’s in Computer Science from the University of North Carolina at Charlotte, expected May 2024. GPA: 3.9/4.0
          </p>
        </div>
      )}
      {section === "Skills" && (
        <div className="scale-in" style={{ backgroundColor: "#66bb6a" }}>
          <h2>Skills</h2>
          <p>
            Programming Languages: Java, JavaScript, Python, Ruby, PHP. Frameworks: Spring Boot, Hibernate, AngularJS, React.
          </p>
        </div>
      )}
      {section === "Work Experience" && (
        <div className="rotate-in" style={{ backgroundColor: "#ef5350" }}>
          <h2>Work Experience</h2>
          <p>
            PwC US (Sep 2021 - Dec 2022): Architected REST APIs and redesigned user interface for improved performance.
          </p>
        </div>
      )}
      {section === "Projects" && (
        <div className="zoom-in" style={{ backgroundColor: "#ab47bc" }}>
          <h2>Projects</h2>
          <p>
            Developed a real-time communication platform and a cybersecurity encryption system, achieving high performance and security.
          </p>
        </div>
      )}
      {section === "Certifications & Leadership" && (
        <div className="pop-in" style={{ backgroundColor: "#ffa726" }}>
          <h2>Certifications & Leadership</h2>
          <p>
            Certified AWS Solutions Architect – Associate, and Java SE 11 Developer. 2nd place in a state-level hackathon.
          </p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const planetRef = useRef();

  const sectionMapping = {
    Mercury: "Professional Summary",
    Venus: "Education",
    Earth: "Skills",
    Mars: "Work Experience",
    Jupiter: "Projects",
    Saturn: "Certifications & Leadership"
  };

  return (
    <div className="app">
      {/* Dropdown menu for selecting planets */}
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

      {/* Display Resume Section */}
      {selectedPlanet && (
        <ResumeSection section={sectionMapping[selectedPlanet]} />
      )}

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

        <Suspense fallback={null}>
          {selectedPlanet === null && <Sun />}

          {/* Planet components */}
          {(selectedPlanet === null || selectedPlanet === "Mercury") && (
            <Planet modelPath="models/Mercury_1_4878.glb" orbitRadiusX={12} orbitRadiusZ={8} speed={0.1} scale={0.003} rotationSpeed={0.002} selected={selectedPlanet === "Mercury"} ref={selectedPlanet === "Mercury" ? planetRef : null} />
          )}
          {(selectedPlanet === null || selectedPlanet === "Venus") && (
            <Planet modelPath="models/Venus_1_12103.glb" orbitRadiusX={18} orbitRadiusZ={14} speed={0.08} scale={0.004} rotationSpeed={0.0015} selected={selectedPlanet === "Venus"} ref={selectedPlanet === "Venus" ? planetRef : null} />
          )}
          {(selectedPlanet === null || selectedPlanet === "Earth") && (
            <Planet modelPath="models/Earth_1_12756.glb" orbitRadiusX={24} orbitRadiusZ={20} speed={0.06} scale={0.004} rotationSpeed={0.0012} selected={selectedPlanet === "Earth"} ref={selectedPlanet === "Earth" ? planetRef : null} />
          )}
          {(selectedPlanet === null || selectedPlanet === "Mars") && (
            <Planet modelPath="models/24881_Mars_1_6792.glb" orbitRadiusX={30} orbitRadiusZ={26} speed={0.05} scale={0.0035} rotationSpeed={0.001} selected={selectedPlanet === "Mars"} ref={selectedPlanet === "Mars" ? planetRef : null} />
          )}
          {(selectedPlanet === null || selectedPlanet === "Jupiter") && (
            <Planet modelPath="models/Jupiter_1_142984.glb" orbitRadiusX={38} orbitRadiusZ={32} speed={0.04} scale={0.008} rotationSpeed={0.0008} selected={selectedPlanet === "Jupiter"} ref={selectedPlanet === "Jupiter" ? planetRef : null} />
          )}
          {(selectedPlanet === null || selectedPlanet === "Saturn") && (
            <Planet modelPath="models/Saturn_1_120536.glb" orbitRadiusX={46} orbitRadiusZ={40} speed={0.03} scale={0.007} rotationSpeed={0.0006} selected={selectedPlanet === "Saturn"} ref={selectedPlanet === "Saturn" ? planetRef : null} />
          )}
        </Suspense>

        {/* Orbits - Only show if no planet is selected */}
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

        {/* Controls component for orbiting around the selected planet or the Sun */}
        <Controls selectedPlanet={selectedPlanet} planetRef={planetRef} />
      </Canvas>
    </div>
  );
}

export default App;
