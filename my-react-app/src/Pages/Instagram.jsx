import React from 'react';
import '../Styles/Instagram.css';
import InstagramImage from '../Images/instagram.png';

const Instagram = () => {
  return (
    <div className="login-container">
      <div className="login-inner">
        <div className="logo-container">
          <img src={ InstagramImage } alt="Instagram" className="logo" />
        </div>
        <form className="form-container">
          <input type="text" placeholder="Phone number, username, or email" className="input-field" />
          <input type="password" placeholder="Password" className="input-field" />
          <button type="submit" className="login-button">Log In</button>
          <p className="forgot-password">Forgot password?</p>
        </form>
        <div className="signup-container">
          <p className="signup-text">Don't have an account? <span className="signup-link">Sign Up</span></p>
        </div>
      </div>
    </div>
  );
};

export default Instagram;