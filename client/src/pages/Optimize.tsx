import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { portfolioAPI, assetsAPI, Portfolio, Asset } from '../services/api';
import Logo from '../components/Logo';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './Optimize.css';

interface PortfolioModel {
  name: string;
  stocks: number;
  bonds: number;
  cash: number;
  description: string;
}

const PORTFOLIO_MODELS: PortfolioModel[] = [
  {
    name: 'Conservative',
    stocks: 30,
    bonds: 50,
    cash: 20,
    description: 'Stable growth with a focus on preserving capital. Ideal for cautious investors.'
  },
  {
    name: 'Moderate',
    stocks: 60,
    bonds: 30,
    cash: 10,
    description: 'Balanced growth with diversified assets. Suitable for medium-risk investors.'
  },
  {
    name: 'Aggressive',
    stocks: 80,
    bonds: 15,
    cash: 5,
    description: 'High growth potential with more market fluctuations. Advisable for risk-tolerant investors.'
  }
];

interface RebalancingAction {
  action: 'Buy' | 'Sell';
  asset: string;
  amount: number;
}

const Optimize: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedModel, setSelectedModel] = useState<PortfolioModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [initialAllocations, setInitialAllocations] = useState({ stocks: 0, bonds: 0, cash: 0 });
  const [rebalancedAllocations, setRebalancedAllocations] = useState({ stocks: 0, bonds: 0, cash: 0 });
  const [actions, setActions] = useState<RebalancingAction[]>([]);

  useEffect(() => {
    if (id) {
      loadPortfolio();
    }
  }, [id]);

  const loadPortfolio = async () => {
    if (!id) return;
    try {
      const portfolioData = await portfolioAPI.getById(parseInt(id));
      setPortfolio(portfolioData);
      const assetsData = await assetsAPI.getAssets(parseInt(id));
      setAssets(assetsData);
      calculateInitialAllocations(assetsData);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInitialAllocations = (assetsData: Asset[]) => {
    const totalValue = assetsData.reduce((sum, asset) => sum + asset.value, 0);
    
    // Categorize assets (simplified - in production, you'd have asset_type)
    let stocksValue = 0;
    let bondsValue = 0;
    let cashValue = 0;

    assetsData.forEach(asset => {
      if (asset.asset_type === 'stock' || !asset.asset_type) {
        stocksValue += asset.value;
      } else if (asset.asset_type === 'bond') {
        bondsValue += asset.value;
      } else if (asset.asset_type === 'cash') {
        cashValue += asset.value;
      } else {
        stocksValue += asset.value; // Default to stocks
      }
    });

    const stocksPct = totalValue > 0 ? (stocksValue / totalValue) * 100 : 0;
    const bondsPct = totalValue > 0 ? (bondsValue / totalValue) * 100 : 0;
    const cashPct = totalValue > 0 ? (cashValue / totalValue) * 100 : 0;

    setInitialAllocations({
      stocks: stocksPct,
      bonds: bondsPct,
      cash: cashPct
    });
  };

  const handleSelectModel = (model: PortfolioModel) => {
    setSelectedModel(model);
    setRebalancedAllocations({
      stocks: model.stocks,
      bonds: model.bonds,
      cash: model.cash
    });
    calculateRebalancingActions(model);
    setShowResults(true);
  };

  const calculateRebalancingActions = (model: PortfolioModel) => {
    if (!portfolio) return;

    const totalValue = portfolio.total_value;
    const currentStocks = (initialAllocations.stocks / 100) * totalValue;
    const currentBonds = (initialAllocations.bonds / 100) * totalValue;
    const currentCash = (initialAllocations.cash / 100) * totalValue;

    const targetStocks = (model.stocks / 100) * totalValue;
    const targetBonds = (model.bonds / 100) * totalValue;
    const targetCash = (model.cash / 100) * totalValue;

    const newActions: RebalancingAction[] = [];

    // Calculate stock adjustments
    const stockDiff = targetStocks - currentStocks;
    if (stockDiff > 0) {
      // Need to buy stocks - distribute across existing stock holdings
      assets.filter(a => a.asset_type === 'stock' || !a.asset_type).forEach(asset => {
        const proportion = asset.value / currentStocks;
        const buyAmount = stockDiff * proportion;
        if (buyAmount > 1) { // Only show if > $1
          newActions.push({
            action: 'Buy',
            asset: asset.symbol,
            amount: buyAmount
          });
        }
      });
    } else if (stockDiff < 0) {
      newActions.push({
        action: 'Sell',
        asset: 'Stocks',
        amount: Math.abs(stockDiff)
      });
    }

    // Calculate bond adjustments
    const bondDiff = targetBonds - currentBonds;
    if (bondDiff > 0) {
      newActions.push({
        action: 'Buy',
        asset: 'Bonds',
        amount: bondDiff
      });
    } else if (bondDiff < 0) {
      newActions.push({
        action: 'Sell',
        asset: 'Bonds',
        amount: Math.abs(bondDiff)
      });
    }

    // Calculate cash adjustments
    const cashDiff = targetCash - currentCash;
    if (cashDiff > 0) {
      newActions.push({
        action: 'Buy',
        asset: 'Cash',
        amount: cashDiff
      });
    } else if (cashDiff < 0) {
      newActions.push({
        action: 'Sell',
        asset: 'Cash',
        amount: Math.abs(cashDiff)
      });
    }

    setActions(newActions);
  };

  const COLORS = ['#22c55e', '#16a34a', '#15803d'];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!portfolio) {
    return <div>Portfolio not found</div>;
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
          <button className="nav-item active">
            <span className="nav-icon">⚖️</span>
            <span>Optimize</span>
          </button>
          <button className="nav-item" onClick={() => navigate(`/manage/${id}`)}>
            <span className="nav-icon">📈</span>
            <span>Manage Portfolio</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => navigate('/account')}>
            <span className="nav-icon">👤</span>
            <span>Account</span>
          </button>
          <button className="nav-item" onClick={logout}>
            <span className="nav-icon">🚪</span>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="optimize-content">
        {!showResults ? (
          <>
            <div className="optimize-header">
              <h1>Pick a Portfolio Model <span className="info-icon">ⓘ</span></h1>
              <p>Select a target portfolio that most closely matches your desired investment style.</p>
            </div>

            <div className="portfolio-models">
              {PORTFOLIO_MODELS.map((model) => (
                <div key={model.name} className="model-card">
                  <h3>{model.name}</h3>
                  <div className="allocation-list">
                    <div>Stocks: {model.stocks}%</div>
                    <div>Bonds: {model.bonds}%</div>
                    <div>Cash: {model.cash}%</div>
                  </div>
                  <p className="model-description">{model.description}</p>
                  <button 
                    onClick={() => handleSelectModel(model)}
                    className="btn-select"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="results-header">
              <h1>Rebalancing Results</h1>
              <p>Here are the results based on your portfolio and chosen {selectedModel?.name.toLowerCase()} model.</p>
            </div>

            <div className="allocations-comparison">
              <div className="allocation-section">
                <h3>Initial Allocations:</h3>
                <div className="allocation-text">
                  <div>Stocks: {initialAllocations.stocks.toFixed(2)}%</div>
                  <div>Bonds: {initialAllocations.bonds.toFixed(2)}%</div>
                  <div>Cash: {initialAllocations.cash.toFixed(2)}%</div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Stocks', value: initialAllocations.stocks },
                        { name: 'Bonds', value: initialAllocations.bonds },
                        { name: 'Cash', value: initialAllocations.cash }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="allocation-section">
                <h3>Rebalanced Allocations:</h3>
                <div className="allocation-text">
                  <div>Stocks: {rebalancedAllocations.stocks.toFixed(2)}%</div>
                  <div>Bonds: {rebalancedAllocations.bonds.toFixed(2)}%</div>
                  <div>Cash: {rebalancedAllocations.cash.toFixed(2)}%</div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Stocks', value: rebalancedAllocations.stocks },
                        { name: 'Bonds', value: rebalancedAllocations.bonds },
                        { name: 'Cash', value: rebalancedAllocations.cash }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="instructions-section">
              <div className="instructions-card">
                <h3 className="instructions-title">How to read your rebalancing plan</h3>
                <p className="instructions-intro">Follow the steps below to align your portfolio with your target allocation.</p>
                <div className="legend-row">
                  <span className="legend-badge legend-badge--sell">
                    <span className="legend-badge-dot"></span>
                    Sell order
                  </span>
                  <span className="legend-badge legend-badge--buy">
                    <span className="legend-badge-dot"></span>
                    Buy order
                  </span>
                </div>
                <button type="button" className="learn-more-btn" onClick={() => window.open('https://www.investopedia.com/terms/r/rebalancing.asp', '_blank')}>
                  Learn more about these results
                  <span className="learn-more-arrow" aria-hidden>→</span>
                </button>
              </div>
            </div>

            <div className="actions-section">
              <h3 className="actions-section-title">Your rebalancing steps</h3>
              {actions.length === 0 ? (
                <div className="actions-empty">
                  <div className="actions-empty-icon">✓</div>
                  <p>No rebalancing needed. Your portfolio is already aligned with the target model.</p>
                </div>
              ) : (
                <ul className="actions-list">
                  {actions.map((action, index) => (
                    <li key={index} className={`action-card action-card--${action.action.toLowerCase()}`}>
                      <span className="action-card-icon" aria-hidden>
                        {action.action === 'Buy' ? '↑' : '↓'}
                      </span>
                      <div className="action-card-body">
                        <span className="action-card-label">{action.action}</span>
                        <span className="action-card-asset">{action.asset}</span>
                      </div>
                      <span className="action-card-amount">
                        {action.action === 'Sell' ? '−' : '+'}${Math.abs(action.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Optimize;
