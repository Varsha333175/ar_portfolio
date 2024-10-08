// LandingPage.js
import React, { useState, useRef, useEffect } from 'react';
import { FaLightbulb, FaPencilRuler, FaCogs, FaRocket } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './LandingPage.css';

const sectionInfo = {
  Idea: "The conception phase where ideas are born.",
  Design: "Blueprints and plans for bringing the concept to life.",
  Development: "The actual coding and building of the portfolio.",
  Launch: "Deploying and showcasing the final product."
};

function HolographicIcon({ Icon, label, onClick }) {
  const iconRef = useRef();

  useEffect(() => {
    gsap.to(iconRef.current, {
      y: '+=10',
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: 'sine.inOut'
    });
  }, []);

  return (
    <div 
      ref={iconRef} 
      className="holographic-icon"
      onClick={() => onClick(label)}
    >
      <Icon size={50} />
      <p>{label}</p>
    </div>
  );
}

function LandingPage() {
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  const handleEnterClick = () => {
    gsap.to('.landing-page', {
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        navigate('/portfolio');
      },
    });
  };

  const handleIconClick = (section) => {
    setActiveSection(section);
    setTimeout(() => {
      setActiveSection(null);
    }, 3000); // Info panel disappears after 3 seconds
  };

  return (
    <div className="landing-page">
      <h1>Welcome to My AR Portfolio</h1>
      <p>An interactive journey through my skills and projects.</p>

      <div className="holographic-icons">
        <HolographicIcon Icon={FaLightbulb} label="Idea" onClick={handleIconClick} />
        <HolographicIcon Icon={FaPencilRuler} label="Design" onClick={handleIconClick} />
        <HolographicIcon Icon={FaCogs} label="Development" onClick={handleIconClick} />
        <HolographicIcon Icon={FaRocket} label="Launch" onClick={handleIconClick} />
      </div>

      {activeSection && (
        <div className="info-panel">
          <h3>{activeSection}</h3>
          <p>{sectionInfo[activeSection]}</p>
        </div>
      )}

      <button className="enter-button" onClick={handleEnterClick}>Enter AR Experience</button>
    </div>
  );
}

export default LandingPage;
