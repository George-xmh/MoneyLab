import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      setSuccess(true);
      // Show success message briefly before navigating
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button 
          onClick={() => navigate('/')} 
          className="back-to-home"
        >
          Back to Home
        </button>
        <div className="login-header">
          <div className="login-logo">
            <Logo size={48} className="login-logo-icon" />
            <h1>MoneyLab</h1>
          </div>
          <p>Investment Portfolio Management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              {isSignUp ? 'Account created successfully! Redirecting...' : 'Login successful! Redirecting...'}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || success}>
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Loading...
              </>
            ) : success ? (
              <>
                <span className="success-icon">✓</span>
                Success!
              </>
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="link-button"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
