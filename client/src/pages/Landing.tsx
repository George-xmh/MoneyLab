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
          <div className="features-inner">
            <p className="features-kicker">Simple as it gets</p>
            <h2 className="features-headline">
              One place to track, target, and rebalance.
            </h2>
            <ol className="features-steps">
              <li className="features-step-item">
                <span className="features-step-num" aria-hidden>01</span>
                <span className="features-step-text">Add your holdings</span>
              </li>
              <li className="features-step-item">
                <span className="features-step-num" aria-hidden>02</span>
                <span className="features-step-text">Pick a target mix</span>
              </li>
              <li className="features-step-item">
                <span className="features-step-num" aria-hidden>03</span>
                <span className="features-step-text">Follow the steps</span>
              </li>
            </ol>
            <p className="features-voice">
              No fluff. No upsells. Just your portfolio and clear rebalancing steps so your allocation stays where you want it.
            </p>
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
        <p>&copy; 2025 MoneyLab. Built by George Xie.</p>
      </footer>
    </div>
  );
};

export default Landing;
