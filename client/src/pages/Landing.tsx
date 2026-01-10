import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import './Landing.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <Logo size={32} className="logo-icon" />
            <span className="logo-text">MoneyLab</span>
          </div>
          <nav className="header-nav">
            <button onClick={() => navigate('/login')} className="btn-nav">
              Log In
            </button>
            <button onClick={() => navigate('/login')} className="btn-nav btn-primary-nav">
              Sign Up
            </button>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <p className="hero-prefix">Rebalance your portfolio with</p>
              <h1 className="hero-title">
                <strong>MoneyLab.</strong>
              </h1>
              <p className="hero-subtitle">
                Optimize your investments. Take control of your wealth. Sign up today.
              </p>
              <div className="hero-buttons">
                <button 
                  onClick={() => navigate('/login')} 
                  className="btn btn-primary btn-large"
                >
                  Get started
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="btn btn-secondary btn-large"
                >
                  Learn more
                </button>
              </div>
            </div>
            <div className="hero-media">
              <div className="media-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">📹</div>
                  <p>Video/Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="features" className="features-section">
          <h2 className="section-title">Why Choose MoneyLab?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Portfolio Tracking</h3>
              <p>Monitor all your investments in one place with real-time portfolio value tracking.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Asset Allocation</h3>
              <p>Set and maintain your ideal asset allocation targets based on your risk tolerance.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚖️</div>
              <h3>Smart Rebalancing</h3>
              <p>Get automated recommendations on when and how to rebalance your portfolio.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Performance Analytics</h3>
              <p>Track your portfolio performance over time with detailed analytics and insights.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your financial data is encrypted and stored securely. Your privacy is our priority.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Easy to Use</h3>
              <p>Intuitive interface designed for both beginners and experienced investors.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to Optimize Your Portfolio?</h2>
          <p>Join MoneyLab today and take control of your financial future.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-primary btn-large"
          >
            Get Started Free
          </button>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2025 MoneyLab. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
