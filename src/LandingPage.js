import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { FaLightbulb, FaCogs, FaDraftingCompass, FaRocket } from 'react-icons/fa';

function TimelineItem({ icon, title, description }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="timeline-item" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="timeline-icon">
        {icon}
      </div>
      {isHovered && (
        <div className="timeline-content">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page-container">
      <div className="landing-page">
        <h1 className="landing-header">Journey Through the Vision</h1>
        <p className="landing-subheader">Explore the steps we took to bring this portfolio to life.</p>

        <div className="timeline">
          <TimelineItem
            icon={<FaLightbulb size={30} color="#00FFFF" />}
            title="The Idea"
            description="Where the vision began. Inspired by creating an interactive, AR-inspired experience."
          />
          <TimelineItem
            icon={<FaDraftingCompass size={30} color="#00FFFF" />}
            title="Design"
            description="Sketching concepts and prototyping the portfolio layout to create a memorable experience."
          />
          <TimelineItem
            icon={<FaCogs size={30} color="#00FFFF" />}
            title="Development"
            description="Building with the latest technologies, like React and Three.js, to bring the vision to life."
          />
          <TimelineItem
            icon={<FaRocket size={30} color="#00FFFF" />}
            title="Launch"
            description="Polishing and optimizing for a smooth, immersive experience."
          />
        </div>

        <button className="enter-portfolio" onClick={() => navigate('/portfolio')}>
          Let’s Dive In
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
