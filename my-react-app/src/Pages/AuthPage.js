import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/AuthPage.css'; // Make sure this path is correct

function AuthPage() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!username) return; // Check if username is empty

    localStorage.setItem('Username', username); // Save username in local storage
    navigate('/chat'); // Navigate to the chat page
  };

  return (
    <div className="auth-container">
      <div className="login-box">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          <button type="submit">Enter Chat</button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
