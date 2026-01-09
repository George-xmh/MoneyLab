import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { portfolioAPI, Portfolio } from '../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDesc, setNewPortfolioDesc] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      const data = await portfolioAPI.getAll();
      setPortfolios(data);
    } catch (error) {
      console.error('Error loading portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await portfolioAPI.create(newPortfolioName, newPortfolioDesc);
      setNewPortfolioName('');
      setNewPortfolioDesc('');
      setShowCreateModal(false);
      loadPortfolios();
    } catch (error) {
      console.error('Error creating portfolio:', error);
      alert('Failed to create portfolio');
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this portfolio?')) {
      return;
    }
    try {
      await portfolioAPI.delete(id);
      loadPortfolios();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      alert('Failed to delete portfolio');
    }
  };

  const totalValue = portfolios.reduce((sum, p) => sum + p.total_value, 0);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>MoneyLab</h1>
          <div className="header-actions">
            <span className="user-email">{user?.email}</span>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Portfolios</h3>
            <p className="stat-value">{portfolios.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Value</h3>
            <p className="stat-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="portfolios-section">
          <div className="section-header">
            <h2>Your Portfolios</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              + New Portfolio
            </button>
          </div>

          {portfolios.length === 0 ? (
            <div className="empty-state">
              <p>No portfolios yet. Create your first portfolio to get started!</p>
            </div>
          ) : (
            <div className="portfolios-grid">
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="portfolio-card">
                  <div className="portfolio-card-header">
                    <h3>{portfolio.name}</h3>
                    <button
                      onClick={() => handleDeletePortfolio(portfolio.id)}
                      className="btn-icon"
                      title="Delete portfolio"
                    >
                      ×
                    </button>
                  </div>
                  {portfolio.description && (
                    <p className="portfolio-description">{portfolio.description}</p>
                  )}
                  <div className="portfolio-value">
                    ${portfolio.total_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <button
                    onClick={() => navigate(`/portfolio/${portfolio.id}`)}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Portfolio</h2>
            <form onSubmit={handleCreatePortfolio}>
              <div className="form-group">
                <label>Portfolio Name</label>
                <input
                  type="text"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  required
                  placeholder="My Investment Portfolio"
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newPortfolioDesc}
                  onChange={(e) => setNewPortfolioDesc(e.target.value)}
                  placeholder="Describe your portfolio goals..."
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
