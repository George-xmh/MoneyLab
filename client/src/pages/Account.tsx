import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { portfolioAPI, Portfolio } from '../services/api';
import Logo from '../components/Logo';
import './Account.css';

const Account: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const list = await portfolioAPI.getAll();
        setPortfolios(list);
      } catch {
        setPortfolios([]);
      }
    };
    fetchPortfolios();
  }, []);

  const displayName = user?.display_name?.trim() || user?.email?.split('@')[0] || 'Investor';
  const initial = (displayName[0] || '?').toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;
  const totalValue = portfolios.reduce((sum, p) => sum + (p.total_value || 0), 0);

  const handleShare = () => {
    const url = `${window.location.origin}/account`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Logo size={32} className="sidebar-logo" />
          <span className="sidebar-logo-text">MoneyLab</span>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <span className="nav-icon">⚖️</span>
            <span>Optimize</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <span className="nav-icon">📈</span>
            <span>Manage Portfolio</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item active">
            <span className="nav-icon">👤</span>
            <span>Account</span>
          </button>
          <button className="nav-item" onClick={logout}>
            <span className="nav-icon">🚪</span>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="account-content">
        {/* Cover / banner */}
        <div className="profile-cover" aria-hidden />

        <div className="profile-body">
          {/* Avatar + name + tagline */}
          <div className="profile-header">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar" aria-hidden>
                {initial}
              </div>
              <div className="profile-avatar-ring" aria-hidden />
            </div>
            <h1 className="profile-name">{displayName}</h1>
            <p className="profile-handle">{user.email}</p>
            <p className="profile-tagline">Building wealth with MoneyLab</p>
          </div>

          {/* Stats row (Blossom-style) */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{portfolios.length}</span>
              <span className="profile-stat-label">Portfolios</span>
            </div>
            <div className="profile-stat-divider" aria-hidden />
            <div className="profile-stat">
              <span className="profile-stat-value profile-stat-value--money">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="profile-stat-label">Total value</span>
            </div>
            <div className="profile-stat-divider" aria-hidden />
            <div className="profile-stat">
              <span className="profile-stat-value">
                {memberSince
                  ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : '—'}
              </span>
              <span className="profile-stat-label">Member since</span>
            </div>
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button
              type="button"
              className="profile-btn profile-btn--share"
              onClick={handleShare}
            >
              {copied ? (
                <>✓ Copied!</>
              ) : (
                <>
                  <span className="profile-btn-icon">🔗</span>
                  Share profile
                </>
              )}
            </button>
            <button
              type="button"
              className="profile-btn profile-btn--primary"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
              <span className="profile-btn-arrow">→</span>
            </button>
          </div>

          {/* "Your stuff" section */}
          <section className="profile-section">
            <h2 className="profile-section-title">Your stuff</h2>
            <div className="profile-tiles">
              <div className="profile-tile profile-tile--highlight">
                <span className="profile-tile-icon">💼</span>
                <div className="profile-tile-content">
                  <span className="profile-tile-label">Portfolio snapshot</span>
                  <span className="profile-tile-value">
                    ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="profile-tile-meta">{portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              {portfolios.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="profile-tile profile-tile--portfolio"
                  onClick={() => navigate('/dashboard')}
                >
                  <span className="profile-tile-icon">📈</span>
                  <div className="profile-tile-content">
                    <span className="profile-tile-name">{p.name}</span>
                    <span className="profile-tile-value profile-tile-value--small">
                      ${(p.total_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="profile-tile-chevron">→</span>
                </button>
              ))}
              {portfolios.length === 0 && (
                <div className="profile-tile profile-tile--empty">
                  <span className="profile-tile-icon">✨</span>
                  <span>Create your first portfolio on the dashboard</span>
                </div>
              )}
            </div>
          </section>

          {/* Badges / vibe row (cosmetic) */}
          <section className="profile-badges">
            <span className="profile-badge">🔒 Verified</span>
            <span className="profile-badge">📊 MoneyLab member</span>
          </section>

          {/* Footer note */}
          <p className="profile-footer-note">
            Your data is encrypted and secured. This profile is for you—social features aren’t part of MoneyLab yet.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Account;
