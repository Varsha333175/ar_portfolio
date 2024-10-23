import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, useGLTF, SpotLight, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faRocket } from '@fortawesome/free-solid-svg-icons';
import { FaCode, FaCalendarAlt, FaChartLine, FaRocket, FaUsers } from 'react-icons/fa'; // Import necessary icons
import { faHeart, faPalette, faBriefcase, faCalendarAlt,faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faShoppingCart, faCommentDots, faTachometerAlt, faTasks, faBlog } from '@fortawesome/free-solid-svg-icons';


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


function SurfaceOverlay({ showSurfaceView, onClose, imagePath, content, customClass }) {
  const overlayRef = useRef();

  useEffect(() => {
    if (showSurfaceView) {
      gsap.fromTo(
        overlayRef.current,
        { autoAlpha: 0, scale: 0.8 },
        { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [showSurfaceView]);

  if (!showSurfaceView) return null;

  const handleClose = () => {
    gsap.to(overlayRef.current, {
      autoAlpha: 0,
      scale: 0.8,
      duration: 0.5,
      ease: "power3.in",
    });
    onClose(); // Close the overlay
  };

  return (
    <div
      className={`surface-overlay ${customClass}`}
      ref={overlayRef}
      style={{ backgroundImage: `url(${imagePath})` }} // Set background image here
    >
      {content}
      <button className="close-button" onClick={handleClose}>
        Close
      </button>
    </div>
  );
}

function EarthSurface() {
  const videoRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(true);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 100) {
      setIsFullScreen(false);
    } else {
      setIsFullScreen(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // The skills data (split each category into an array of skills)
  const skills = [
    {
      title: 'Programming Languages',
      content: ['Java', 'Java 8+', 'JavaScript', 'TypeScript', 'SQL', 'Python', 'Ruby', 'PHP', 'HTML5', 'CSS3']
    },
    {
      title: 'Frameworks & Libraries',
      content: ['Spring Boot', 'Spring Framework', 'Hibernate', 'JPA', 'Angular', 'ReactJS', 'Node.js', 'Express.js', 'Bootstrap', 'Sass']
    },
    {
      title: 'Database Management',
      content: ['MySQL', 'PostgreSQL', 'MongoDB', 'NoSQL', 'SQL Server', 'Database Design', 'Database Management', 'SQL Queries']
    },
    {
      title: 'Web Development',
      content: ['Full Stack Development', 'Frontend Development', 'Backend Development', 'RESTful APIs', 'API Development', 'Microservices', 'JSON', 'XML']
    },
    {
      title: 'Cloud & DevOps',
      content: ['AWS', 'AWS Lambda', 'AWS S3', 'Docker', 'Kubernetes', 'GCP', 'Azure', 'Jenkins', 'CI/CD', 'Cloud Computing']
    },
    {
      title: 'Version Control & Build Tools',
      content: ['Git', 'Maven', 'Gradle', 'Version Control', 'GitHub']
    },
    {
      title: 'Software Development & Architecture',
      content: ['OOP', 'Design Patterns', 'Microservices Architecture', 'Software Engineering', 'System Architecture', 'SDLC']
    },
    {
      title: 'Testing & Security',
      content: ['TDD', 'BDD', 'Unit Testing', 'JUnit', 'Selenium', 'API Security', 'JWT', 'OAuth2', 'Role-Based Access Control', 'IT Security']
    },
    {
      title: 'Project Management & Methodologies',
      content: ['Agile', 'Scrum', 'Project Management', 'Task Management', 'DevOps', 'Team Collaboration', 'Agile Methodologies']
    },
    {
      title: 'Other Technical Skills',
      content: ['Performance Tuning', 'Automation Testing', 'Cross-browser Compatibility', 'Responsive Design', 'Swagger', 'AWS Certified Solutions Architect']
    },
    {
      title: 'Soft Skills',
      content: ['Problem Solving', 'Communication Skills', 'Teamwork', 'Time Management', 'Adaptability', 'Leadership']
    }
  ];

  return (
    <div className={`earth-surface ${isFullScreen ? 'full-screen-video' : 'small-video'}`}>
      <video
        ref={videoRef}
        src="models/213026.mp4"
        autoPlay
        muted
        loop
        className="earth-video"
      />
      <div className="accordion-container">
        {skills.map((skill, index) => (
          <AccordionCard key={index} title={skill.title} content={skill.content} />
        ))}
      </div>
    </div>
  );
}
function AccordionCard({ title, content }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  return (
    <div className="accordion-card">
      <div className="accordion-header" onClick={toggleAccordion}>
        {title}
      </div>
      {isOpen && (
        <div className="accordion-content">
          {content.map((skill, index) => (
            <div key={index} className="accordion-skill">{skill}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// VenusTimeline Component (can be put in a separate file if needed)





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
  const [customClass, setCustomClass] = useState('');  // New state to handle custom styles
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
      <h1>
        <FontAwesomeIcon icon={faBolt} size="2x" color="#00d2ff" /> Speed and Agility
      </h1>
      <p>
        <FontAwesomeIcon icon={faRocket} size="2x" color="#ffab00" /> {/* Larger and more colorful rocket */}
        Just like the swift planet Mercury, I excel in fast-paced environments where agility and efficiency are critical. 
        My experience optimizing API performance—reducing response times by 20%—and delivering solutions under tight deadlines 
        reflects my ability to move quickly without compromising quality. Whether it's architecting APIs or leading agile sprints, 
        I'm always ready to solve complex problems with speed and precision.
      </p>
    </div>
  );
  setCustomClass('mercury-overlay');  // Apply Mercury-specific class
  break;






case 'Venus':
  setSurfaceImage('models/venus_surface.jpg'); // Venus-specific background
  setSurfaceContent(
    <div>
      <h1>Work Experience</h1> {/* Title added at the top */}

      <div className="work-experience-card">
        <h2>Associate Software Engineer</h2>
        <h3>DXC Technology</h3>
        <p>
          <FontAwesomeIcon icon={faCalendarAlt} /> 2020 - 2021
        </p>
        <p>
          At DXC Technology, I navigated the complexities of handling healthcare data by developing real-time solutions that directly impacted the company's operational efficiency.  
          Beyond writing code, I immersed myself in understanding the end-to-end flow of healthcare data systems, anticipating potential bottlenecks before they became issues. 
          Collaborating with stakeholders, I not only improved API security but also built trust in our data exchange solutions, ensuring that healthcare professionals could rely on our platforms for faster and more secure operations.
        </p>
        <ul className="bullet-points">
          <li><FontAwesomeIcon icon={faCheckCircle} /> Enabled healthcare providers to reduce administrative overhead by implementing solutions that processed patient data 30% faster.</li>
          <li><FontAwesomeIcon icon={faCheckCircle} /> Fostered cross-team collaborations to integrate secure APIs, positioning the company to meet stringent healthcare compliance standards.</li>
          <li><FontAwesomeIcon icon={faCheckCircle} /> Took ownership of UI enhancements, transforming end-user feedback into actionable design changes that led to better system adoption.</li>
        </ul>
      </div>

      <div className="work-experience-card">
        <h2>Java Full Stack Developer</h2>
        <h3>PwC US</h3>
        <p>
          <FontAwesomeIcon icon={faCalendarAlt} /> 2021 - 2022
        </p>
        <p>
          At PwC, I was more than just a developer; I was a trusted advisor on how to optimize critical systems for both performance and scalability.  
          My role required not only technical acumen but also the ability to foresee business challenges and propose solutions before they arose.  
          Leading initiatives that processed over 5 million transactions daily, I often found myself consulting with senior management, shaping strategic decisions on system architecture, and guiding teams toward scalable solutions.
        </p>
        <ul className="bullet-points">
          <li><FontAwesomeIcon icon={faCheckCircle} /> Spearheaded the redesign of a platform serving 50,000+ users, resulting in a 25% increase in engagement—proving that technical solutions can drive business growth.</li>
          <li><FontAwesomeIcon icon={faCheckCircle} /> Mentored junior developers, sharing insights on code optimization, which accelerated project delivery timelines by 15%.</li>
          <li><FontAwesomeIcon icon={faCheckCircle} /> Trusted by senior leadership to advise on system scaling, I implemented strategies that ensured our APIs could handle a 20% boost in traffic without compromising performance.</li>
        </ul>
      </div>
    </div>
  );
  setCustomClass('venus-overlay');  // Apply Venus-specific class
  break;

    case 'Earth':
      setSurfaceContent(<EarthSurface />); // Render EarthSurface with scroll-responsive video
      setCustomClass('earth-overlay');  // Apply Earth-specific class
      break;
        break;
        // Import FontAwesome Icons


        case 'Mars':
          setSurfaceImage('models/mars_surface.jpg'); // Mars-specific surface background
          setSurfaceContent(
            <div className="mars-overlay">
              <h1 className="mars-title">Mission to Mars: Full Stack Projects</h1>
        
              <div className="mars-module">
                <FontAwesomeIcon icon={faShoppingCart} className="project-icon" />
                <h2>E-commerce Web Application</h2>
                <p>
                  A fully functional e-commerce platform with product catalog, shopping cart, and payment gateway integration.
                </p>
                <div className="project-tech-stack">
                  <span><b>React</b></span>
                  <span><b>Node.js</b></span>
                  <span><b>MongoDB</b></span>
                  <span><b>Stripe API</b></span>
                </div>
                <div className="connection-line"></div>
              </div>
        
              <div className="mars-module">
                <FontAwesomeIcon icon={faCommentDots} className="project-icon" />
                <h2>Real-time Chat Application</h2>
                <p>
                  Developed a real-time chat application using WebSocket technology, with features like private rooms and message encryption.
                </p>
                <div className="project-tech-stack">
                  <span><b>React</b></span>
                  <span><b>Node.js</b></span>
                  <span><b>Socket.io</b></span>
                </div>
                <div className="connection-line"></div>
              </div>
        
              <div className="mars-module">
                <FontAwesomeIcon icon={faTachometerAlt} className="project-icon" />
                <h2>Social Media Dashboard</h2>
                <p>
                  A comprehensive dashboard for social media analytics, featuring real-time data visualization, post scheduling, and user engagement metrics.
                </p>
                <div className="project-tech-stack">
                  <span><b>Angular</b></span>
                  <span><b>Node.js</b></span>
                  <span><b>PostgreSQL</b></span>
                  <span><b>Chart.js</b></span>
                </div>
                <div className="connection-line"></div>
              </div>
        
              <div className="mars-module">
                <FontAwesomeIcon icon={faTasks} className="project-icon" />
                <h2>Task Management System</h2>
                <p>
                  Built a Kanban-style task manager with real-time updates, team collaboration features, and role-based access control.
                </p>
                <div className="project-tech-stack">
                  <span><b>Vue.js</b></span>
                  <span><b>Express.js</b></span>
                  <span><b>MongoDB</b></span>
                </div>
                <div className="connection-line"></div>
              </div>
        
              <div className="mars-module">
                <FontAwesomeIcon icon={faBlog} className="project-icon" />
                <h2>Blog Platform with Admin Panel</h2>
                <p>
                  A content management system (CMS) that allows users to create and manage blog posts, with admin controls for user management and content moderation.
                </p>
                <div className="project-tech-stack">
                  <span><b>React</b></span>
                  <span><b>Node.js</b></span>
                  <span><b>MySQL</b></span>
                </div>
                <div className="connection-line"></div>
              </div>
        
            </div>
          );
          setCustomClass('mars-overlay');  // Apply Mars-specific class
          break;
        
        case 'Jupiter':
        setSurfaceImage('models/jupiter_surface.jpg');
        setSurfaceContent(
          <div>
            <h1>Certifications</h1>
            <p>Jupiter-specific content here.</p>
          </div>
        );
        setCustomClass('jupiter-overlay');  // Apply Jupiter-specific class
        break;
      case 'Saturn':
        setSurfaceImage('models/saturn_surface.jpg');
        setSurfaceContent(
          <div>
            <h1>Education</h1>
            <p>Saturn-specific content here.</p>
          </div>
        );
        setCustomClass('saturn-overlay');  // Apply Saturn-specific class
        break;
      default:
        break;
    }
  };

  const handleCloseSurfaceView = () => {
    setShowSurfaceView(false);
    setCustomClass('');  // Reset custom class when the overlay is closed
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

      <SurfaceOverlay 
        showSurfaceView={showSurfaceView} 
        onClose={handleCloseSurfaceView} 
        imagePath={surfaceImage} 
        content={surfaceContent} 
        customClass={customClass}  // Pass planet-specific class here
      />
        </div>
  );
}

export default App;
