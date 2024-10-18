import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, useGLTF, SpotLight, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import './App.css';

function MercurySurface() {
  return (
    <>
      <pointLight position={[-5, 2, 5]} intensity={1} color="#FF4500" />
      <pointLight position={[5, 2, 5]} intensity={1} color="#00BFFF" />
      
      {/* Sunlit Side (Hot Zone) */}
      <Text
        position={[-3, 1.5, 0]} 
        fontSize={1.1}
        color="#FF4500"
        emissive="#FF4500"
        emissiveIntensity={1.2}
        outlineWidth={0.05}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        Resilience
      </Text>
      <Text
        position={[-3, 0, 0]} 
        fontSize={0.8}
        color="#FF6347"
        emissive="#FF6347"
        emissiveIntensity={1.0}
        outlineWidth={0.05}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        Overcoming Challenges
      </Text>

      {/* Dark Side (Cold Zone) */}
      <Text
        position={[3, 1.5, 0]} 
        fontSize={1.1}
        color="#00BFFF"
        emissive="#00BFFF"
        emissiveIntensity={1.2}
        outlineWidth={0.05}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        Adaptability
      </Text>
      <Text
        position={[3, 0, 0]} 
        fontSize={0.8}
        color="#87CEFA"
        emissive="#87CEFA"
        emissiveIntensity={1.0}
        outlineWidth={0.05}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        Versatility
      </Text>
    </>
  );
}


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

// Generic Planet Component with labels
// Generic Planet Component with improved labels that follow the planet
// Generic Planet Component with labels that follow the planet
// Generic Planet Component with labels that follow the planet



function Planet({ modelPath, orbitRadiusX, orbitRadiusZ, speed, scale, rotationSpeed, selected, onClick, name }) {
  const ref = useRef();
  const labelRef = useRef();
  const { scene } = useGLTF(modelPath);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    const x = orbitRadiusX * Math.cos(t);
    const z = orbitRadiusZ * Math.sin(t);

    if (!selected) {
      // Position the planet along its orbit
      ref.current.position.set(x, 0, z);
      ref.current.rotation.y += rotationSpeed;

      // Position the label for visibility above the planet
      if (labelRef.current) {
        const labelY = name === "Certifications" ? 4.5 : name === "Education" ? 5 : 2.5; // Adjusted y position
        labelRef.current.position.set(x, labelY, z);
      }
    } else {
      ref.current.position.set(0, 0, 0);
      if (labelRef.current) {
        labelRef.current.position.set(0, 2.5, 0);
      }
    }
  });

  return (
    <>
      <primitive object={scene} ref={ref} scale={scale} onClick={onClick} />
      {!selected && (
        <Text 
          ref={labelRef} 
          fontSize={1.1} // Increased font size for better visibility
          color="#00BFFF" // Changed to a gold/yellow color
          anchorX="center" 
          anchorY="middle"
          outlineWidth={0.05} 
          outlineColor="#000000" // Black outline for contrast
        >
          {name}
        </Text>
      )}
    </>
  );
}



// ... the rest of the App component remains the same


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



function SurfaceOverlay({ showSurfaceView, onClose, imagePath, content }) {
  const overlayRef = useRef();
  const contentRef = useRef();

  useEffect(() => {
    if (showSurfaceView) {
      gsap.fromTo(
        overlayRef.current,
        { autoAlpha: 0, scale: 0.8 },
        { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out" }
      );

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power3.out" }
      );
    }
  }, [showSurfaceView]);

  if (!showSurfaceView) return null;

  return (
    <div className="surface-overlay" ref={overlayRef}>
      <img src={imagePath} alt="Planet Surface" className="surface-image" />
      <div className="overlay-content" ref={contentRef}>
        {content}
      </div>
      <button 
        className="close-button" 
        onClick={() => {
          gsap.to(overlayRef.current, {
            autoAlpha: 0,
            scale: 0.8,
            duration: 0.5,
            ease: "power3.in",
            onComplete: onClose
          });
        }}>
        Close
      </button>
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
    Mercury: [6, 0, 3],
    Venus: [10, 0, 6],
    Earth: [14, 0, 10],
    Mars: [18, 0, 13],
    Jupiter: [24, 0, 18],
    Saturn: [30, 0, 22],
  };

  const handlePlanetClick = (planet) => {
    setShowSurfaceView(true);

    switch (planet) {
      case 'Mercury':
      setSurfaceImage('models/mercury_surface.jpg');
      setSurfaceContent(
        <div>
          <h1 style={{ 
            color: '#ECECEC',  // Light silver, closer to Mercury’s surface tone
            textShadow: '0 0 15px rgba(236, 236, 236, 0.6)', // Subtle silver glow
            fontSize: '2.2rem',
            fontWeight: 'bold',
            letterSpacing: '1.2px'
          }}>
            Professional Summary
          </h1>
          <p style={{ 
            color: '#B0B0B0', // Soft gray for readable contrast
            fontSize: '1.1rem',
            lineHeight: '1.7',
            maxWidth: '85%', // Slightly wider for better use of space
            textAlign: 'justify',
            margin: '20px auto',
            padding: '0 20px',  // Adds subtle padding for better structure
          }}>
            A highly adaptable Full Stack Developer with over 2 years of experience, embodying resilience in the face of complex challenges. Just as Mercury endures extreme environments, I thrive in fast-paced, high-pressure environments, delivering scalable solutions using Java (v8+), Spring Boot, and AngularJS. Whether it’s optimizing APIs or enhancing system security, I consistently find innovative ways to tackle problems. My expertise spans AWS cloud solutions, CI/CD pipelines, and database management, allowing me to create robust software that withstands the toughest demands, much like Mercury's ability to survive the extremes of space.
          </p>
        </div>
      );
        break;
      case 'Venus':
        setSurfaceImage('models/venus_surface.jpg');
        setSurfaceContent(<p>Experience Overview</p>);
        break;
      case 'Earth':
        setSurfaceImage('models/earth_surface.jpg');
        setSurfaceContent(<p>Skills</p>);
        break;
      case 'Mars':
        setSurfaceImage('models/mars_surface.jpg');
        setSurfaceContent(<p>Projects</p>);
        break;
      case 'Jupiter':
        setSurfaceImage('models/jupiter_surface.jpg');
        setSurfaceContent(<p>Certifications</p>);
        break;
      case 'Saturn':
        setSurfaceImage('models/saturn_surface.jpg');
        setSurfaceContent(<p>Education</p>);
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
          <option value="" disabled>Select a section</option>
          <option value="Mercury">Professional Summary</option>
          <option value="Venus">Experience Overview</option>
          <option value="Earth">Skills</option>
          <option value="Mars">Projects</option>
          <option value="Jupiter">Certifications</option>
          <option value="Saturn">Education</option>
        </select>
        <button onClick={() => setSelectedPlanet(null)}>Reset View</button>
      </div>

      <Canvas
        style={{ height: '100vh', width: '100vw', background: '#0a0a0a' }}
        camera={{ position: [0, 35, 45], fov: 75 }}
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
  
  {(selectedPlanet === null || selectedPlanet === "Mercury") && (
    <Planet 
      modelPath="models/Mercury_1_4878.glb" 
      orbitRadiusX={6} 
      orbitRadiusZ={3} 
      speed={4.15 / 10}  // Slowed down by dividing by 10
      scale={0.003} 
      rotationSpeed={0.002} 
      selected={selectedPlanet === "Mercury"}
      onClick={() => handlePlanetClick("Mercury")}
      name="Summary"
    />
  )}
  {(selectedPlanet === null || selectedPlanet === "Venus") && (
    <Planet 
      modelPath="models/Venus_1_12103.glb" 
      orbitRadiusX={10} 
      orbitRadiusZ={6} 
      speed={1.62 / 10}  // Slowed down by dividing by 10
      scale={0.004} 
      rotationSpeed={0.0015} 
      selected={selectedPlanet === "Venus"}
      onClick={() => handlePlanetClick("Venus")}
      name="Experience"
    />
  )}
  {(selectedPlanet === null || selectedPlanet === "Earth") && (
    <Planet 
      modelPath="models/Earth_1_12756.glb" 
      orbitRadiusX={14} 
      orbitRadiusZ={10} 
      speed={1.0 / 10}  // Slowed down by dividing by 10
      scale={0.004} 
      rotationSpeed={0.0012} 
      selected={selectedPlanet === "Earth"}
      onClick={() => handlePlanetClick("Earth")}
      name="Skills"
    />
  )}
  {(selectedPlanet === null || selectedPlanet === "Mars") && (
    <Planet 
      modelPath="models/24881_Mars_1_6792.glb" 
      orbitRadiusX={18} 
      orbitRadiusZ={13} 
      speed={0.53 / 10}  // Slowed down by dividing by 10
      scale={0.0035} 
      rotationSpeed={0.001} 
      selected={selectedPlanet === "Mars"}
      onClick={() => handlePlanetClick("Mars")}
      name="Projects"
    />
  )}
  {(selectedPlanet === null || selectedPlanet === "Jupiter") && (
    <Planet 
      modelPath="models/Jupiter_1_142984.glb" 
      orbitRadiusX={24} 
      orbitRadiusZ={18} 
      speed={0.084 / 10}  // Slowed down by dividing by 10
      scale={0.008} 
      rotationSpeed={0.0008} 
      selected={selectedPlanet === "Jupiter"}
      onClick={() => handlePlanetClick("Jupiter")}
      name="Certifications"
    />
  )}
  {(selectedPlanet === null || selectedPlanet === "Saturn") && (
    <Planet 
      modelPath="models/Saturn_1_120536.glb" 
      orbitRadiusX={30} 
      orbitRadiusZ={22} 
      speed={0.034 / 10}  // Slowed down by dividing by 10
      scale={0.007} 
      rotationSpeed={0.0006} 
      selected={selectedPlanet === "Saturn"}
      onClick={() => handlePlanetClick("Saturn")}
      name="Education"
    />
  )}
</Suspense>


        {selectedPlanet === null && (
          <>
            <EllipticalOrbitPath radiusX={6} radiusZ={3} color="#A6E22E" lineWidth={2} />
            <EllipticalOrbitPath radiusX={10} radiusZ={6} color="#F92672" lineWidth={2} />
            <EllipticalOrbitPath radiusX={14} radiusZ={10} color="#66D9EF" lineWidth={2} />
            <EllipticalOrbitPath radiusX={18} radiusZ={13} color="#FFA500" lineWidth={2} />
            <EllipticalOrbitPath radiusX={24} radiusZ={18} color="#FF4500" lineWidth={2} />
            <EllipticalOrbitPath radiusX={30} radiusZ={22} color="#FFD700" lineWidth={2} />
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
