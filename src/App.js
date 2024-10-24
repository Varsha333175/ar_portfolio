import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, useGLTF, SpotLight, Text, Html } from '@react-three/drei'; // Add Html here
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faRocket } from '@fortawesome/free-solid-svg-icons';
import { FaCode, FaCalendarAlt, FaChartLine, FaRocket, FaUsers } from 'react-icons/fa';
import { faHeart, faPalette, faBriefcase, faCalendarAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faShoppingCart, faCommentDots, faTachometerAlt, faTasks, faBlog } from '@fortawesome/free-solid-svg-icons';
import { FaHandPointer } from 'react-icons/fa';  // Import FontAwesome hand icon

// Floating Probe Tooltip component
function ProbeTooltip({ planetPosition, hovered }) {
  const probeRef = useRef();

  // Probe Animation (Bobbing and Rotation)
  useFrame(() => {
    if (probeRef.current) {
      probeRef.current.position.y += Math.sin(Date.now() * 0.002) * 0.01; // Bobbing effect
      probeRef.current.rotation.y += 0.01; // Slow rotation for realistic effect
    }
  });

  return (
    <>
      {/* Small probe floating near the planet */}
      <mesh ref={probeRef} position={[planetPosition.x + 3, planetPosition.y + 2, planetPosition.z]} scale={0.4}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#00ffcc" />
      </mesh>

      {/* Tooltip HUD text */}
      {hovered && (
        <Html position={[planetPosition.x + 3, planetPosition.y + 4.5, planetPosition.z]}>
          <div className="probe-tooltip">
            <span className="tooltip-text">Click to Explore</span>
          </div>
        </Html>
      )}
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
        // Zoom the camera into the planet for a "landing" effect
        gsap.to(camera.position, {
          x: x,
          y: y + 1,
          z: z,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => camera.lookAt(x, y, z)
        });
        prevPlanet.current = selectedPlanet;
      }
    } else {
      // Reset camera to default position
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



function Planet({
  modelPath,
  orbitRadiusX,
  orbitRadiusZ,
  speed,
  scale,
  rotationSpeed,
  selected,    // Selection state from dropdown
  onClick,
  name,
}) {
  const ref = useRef();
  const labelRef = useRef();
  const { scene } = useGLTF(modelPath);
  const [hovered, setHovered] = useState(false);

  // Move planet and rotate it on its orbit
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    const x = orbitRadiusX * Math.cos(t);
    const z = orbitRadiusZ * Math.sin(t);

    if (!selected) {
      ref.current.position.set(x, 0, z);
      ref.current.rotation.y += rotationSpeed;

      if (labelRef.current) {
        const labelY = name === "Certifications" ? 4.5 : name === "Education" ? 5 : 2.5;
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
      <primitive
        object={scene}
        ref={ref}
        scale={hovered && !selected ? scale * 1.05 : scale}  // Only scale on hover if not selected
        onPointerOver={() => !selected && setHovered(true)}  // Only set hover state when not selected
        onPointerOut={() => setHovered(false)}
        onClick={onClick}  // Allow clicks regardless of hover state
      />

      {/* Conditionally render the planet label only when not selected */}
      {!selected && (
        <Text
          ref={labelRef}
          fontSize={1.1}
          color={hovered ? "#FFD700" : "#00BFFF"}  // Hover effect for label when not selected
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {name}
        </Text>
      )}

      {/* Add the probe tooltip if hovered and not selected */}
      {hovered && !selected && <ProbeTooltip planetPosition={ref.current.position} hovered={hovered} />}

      {/* Glow effect only when planet is selected */}
      {selected && (
        <mesh position={ref.current.position}>
          <ringGeometry args={[scale * 1.1, scale * 1.15, 32]} />
          <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} />
        </mesh>
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
  const [hasInteracted, setHasInteracted] = useState(false);  // Track user interaction
  const [showMessage, setShowMessage] = useState(true);  // Control message visibility
  const interactionTimeoutRef = useRef(null);  // Reference to clear timeout if needed



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
          <div className="certifications-section">
            <h1 className="certifications-title">Certifications</h1>
            <div className="certifications-grid">
              <div className="certification-card">
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="AWS Logo" />
                <div className="certification-title">AWS Certified Solutions Architect – Associate</div>
                <div className="certification-description">Expertise in designing and deploying scalable systems on AWS.</div>
              </div>
              <div className="certification-card">
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Java_programming_language_logo.svg/1024px-Java_programming_language_logo.svg.png" alt="Java Certification" />
                <div className="certification-title">Java SE 11 Developer Certification</div>
                <div className="certification-description">Advanced understanding of Java SE 11 and modular programming.</div>
              </div>
              <div className="certification-card">
                <img src="https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg" alt="Udemy Certification" />
                <div className="certification-title">Full Stack Web Developer Bootcamp</div>
                <div className="certification-description">Comprehensive course covering frontend and backend development.</div>
              </div>
              <div className="certification-card">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Spring_Framework_Logo_2018.svg" alt="Spring Boot Logo" />
                <div className="certification-title">Mastering Spring Framework 5 with Spring Boot</div>
                <div className="certification-description">In-depth course on Spring 5 and Spring Boot 2 for enterprise applications.</div>
              </div>
              <div className="certification-card">
                <img src="https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png" alt="Docker Logo" />
                <div className="certification-title">Docker and Kubernetes: The Complete Guide</div>
                <div className="certification-description">Covers containerization with Docker and orchestration using Kubernetes.</div>
              </div>
              <div className="certification-card">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" alt="Python Certification" />
                <div className="certification-title">Python for Data Science and Machine Learning Bootcamp</div>
                <div className="certification-description">Covers Python, Pandas, Matplotlib, and key data science concepts.</div>
              </div>
              <div className="certification-card">
                <img src="https://raw.githubusercontent.com/spring-cloud/spring-cloud-contract/3.0.x/docs/src/main/asciidoc/images/spring-cloud-logo.png" alt="Spring Cloud Logo" />
                <div className="certification-title">Microservices with Spring Boot and Spring Cloud</div>
                <div className="certification-description">Focuses on building microservices using Spring Boot and Spring Cloud.</div>
              </div>
              <div className="certification-card">
                <img src="https://www.jenkins.io/images/logos/jenkins/jenkins.svg" alt="Jenkins Certification" />
                <div className="certification-title">The Complete Guide to Jenkins and CI/CD</div>
                <div className="certification-description">Covers CI/CD pipeline best practices with Jenkins.</div>
              </div>
            </div>
          </div>
        );



        setCustomClass('jupiter-overlay');  // Apply Jupiter-specific class
        break;
      case 'Saturn':
        setSurfaceImage('models/saturn_surface.jpg');
        setSurfaceContent(
          <div className="education-section">
            <h1 className="education-title">Education</h1>
            <div className="education-card">
              <img src="https://scontent-dfw5-1.xx.fbcdn.net/v/t39.30808-1/239779234_10160348468334587_4746985255056824219_n.png?stp=dst-png_s200x200&_nc_cat=105&ccb=1-7&_nc_sid=f4b9fd&_nc_ohc=uAgy9hAiAfEQ7kNvgGSsy7R&_nc_zt=24&_nc_ht=scontent-dfw5-1.xx&_nc_gid=AJ_1MNuUSXZk9rgYGHeFURi&oh=00_AYB0tIKwdcd0o4QVenHjgBPjCtgycBgUwwJJN0hMi84nCw&oe=671F5C18" alt="UNC Charlotte Logo" className="university-logo" />
              <div className="university-info">
                <h2>University of North Carolina at Charlotte</h2>
                <h3>Master’s in Computer Science</h3>
                <p><strong>GPA:</strong> 3.9/4</p>
                <p><strong>Duration:</strong> January 2023 - May 2024</p>
                <p><strong>Relevant Coursework:</strong> Data Structures, Algorithms, Cloud Computing, Database Systems, Machine Learning, Web Development, Software Engineering</p>
              </div>
            </div>
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

  const handleUserInteraction = () => {
    setShowMessage(false);  // Hide the message when user interacts
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);  // Clear timeout if user interacts before timeout
    }
  };

  // Automatically hide the message after 5 seconds
  useEffect(() => {
    interactionTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
    }, 5000);  // Show message for 5 seconds

    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);  // Clear timeout on component unmount
      }
    };
  }, []);

  return (
    <div className="app">
       {showMessage && (
        <div className="overlay-message">
          <FaHandPointer className="hand-icon" /> {/* Use React Icon for hand */}
          <p>click & drag to rotate</p>
        </div>
      )}
      <div className="dropdown">
        <label htmlFor="planet-select">Select a planet to explore its 3D view: </label>
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
        <OrbitControls
            enableZoom={true}
            onStart={() => handleUserInteraction()}  // Detect user interaction via OrbitControls (drag or zoom)
          />
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
              speed={0.4 / 10}  // Slowed down by dividing by 10
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
          <mesh onClick={() => handleUserInteraction()}>  {/* Example clickable object */}
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="blue" />
          </mesh>

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
