import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ARLandingPage.css';

function ControlRoomButton({ label, description, icon }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className={`control-button ${hovered ? 'hovered' : ''}`} 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
    >
      <div className="icon">{icon}</div>
      <p className="label">{label}</p>
      {hovered && <div className="hologram">{description}</div>}
    </div>
  );
}

function ControlRoomLandingPage() {
  const navigate = useNavigate();

  const handleEnterClick = () => {
    navigate('/portfolio');
  };

  return (
    <div className="control-room">
      <div className="animated-background"></div>
      <h1 className="title">Welcome to My Galaxy Control Room</h1>
      <p className="subtitle">Explore the phases of creating an immersive experience.</p>
      
      <div className="control-buttons">
        <ControlRoomButton label="Idea" description="Where the journey begins." icon="💡" />
        <ControlRoomButton label="Design" description="Crafting the blueprint." icon="✏️" />
        <ControlRoomButton label="Development" description="Building the experience." icon="⚙️" />
        <ControlRoomButton label="Launch" description="Bringing it to life." icon="🚀" />
      </div>

      <button className="enter-button" onClick={handleEnterClick}>Enter Experience</button>
    </div>
  );
}

export default ControlRoomLandingPage;
