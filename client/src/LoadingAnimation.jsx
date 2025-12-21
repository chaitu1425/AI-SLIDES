import React from 'react';
import './assets/css/LoadingAnimation.css';

const LoadingAnimation = ({ message = 'Generating slides...', progress = null }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      
      <p className="loading-message">{message}</p>
      
      {progress !== null && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            <span className="progress-text">{progress}%</span>
          </div>
        </div>
      )}
      
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default LoadingAnimation;