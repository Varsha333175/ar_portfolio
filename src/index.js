import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import LandingPage from './LandingPage';
import './index.css';

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/portfolio" element={<App />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);
