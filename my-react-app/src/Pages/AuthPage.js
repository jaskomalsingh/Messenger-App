import React, { useState } from 'react';
import '../Styles/AuthPage.css'; // Import the CSS file for styling

function AuthPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login with: ', loginEmail, loginPassword);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    console.log('Signup with: ', signupEmail, signupPassword);
  };

  return (
    <div className="auth-container">
      <div className="login-box">
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
      <div className="signup-box">
        <form onSubmit={handleSignup}>
          <h2>Signup</h2>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
          </div>
          <button type="submit">Signup</button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
