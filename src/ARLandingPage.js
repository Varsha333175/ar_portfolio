import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ARLandingPage.css';

function ControlRoomButton({ label, icon, onClick }) {
  return (
    <div className="control-button" onClick={onClick}>
      <div className="icon">{icon}</div>
      <p className="label">{label}</p>
    </div>
  );
}

function Modal({ title, content, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content hologram-effect" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{content}</p>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
}

function ControlRoomLandingPage() {
  const [selectedSection, setSelectedSection] = useState(null);
  const navigate = useNavigate();

  const sections = [
    {
      label: 'Idea',
      icon: '💡',
      description: 'The inspiration for this portfolio began with the goal of creating a dynamic and interactive experience that showcases my skills in a visually engaging way.'
    },
    {
      label: 'Design',
      icon: '✏️',
      description: 'Design is where the real magic happens. I focused on user experience by crafting intuitive layouts and experimenting with 3D visual elements to create an immersive experience.'
    },
    {
      label: 'Development',
      icon: '⚙️',
      description: 'In development, I used React and Three.js to bring the design to life. I leveraged 3D rendering for the solar system effect and GSAP for smooth animations.'
    },
    {
      label: 'Launch',
      icon: '🚀',
      description: 'The final step was launching the project. After refining, optimizing, and testing for responsiveness, I deployed the portfolio, ensuring it’s fast, accessible, and impactful.'
    }
  ];

  const handleEnterClick = () => {
    navigate('/portfolio');
  };

  return (
    <div className="control-room">
      <h1 className="title">Discover the Journey Behind My Portfolio</h1>
      <p className="subtitle">Click on each phase to explore the details behind how I built my portfolio, from initial idea to launch.</p>

      <div className="control-buttons">
        {sections.map(section => (
          <ControlRoomButton 
            key={section.label}
            label={section.label}
            icon={section.icon}
            onClick={() => setSelectedSection(section)}
          />
        ))}
      </div>

      {selectedSection && (
        <Modal 
          title={selectedSection.label}
          content={selectedSection.description}
          onClose={() => setSelectedSection(null)}
        />
      )}

      <button className="enter-button" onClick={handleEnterClick}>
        Enter Full Portfolio Experience
      </button>
    </div>
  );
}

export default ControlRoomLandingPage;
