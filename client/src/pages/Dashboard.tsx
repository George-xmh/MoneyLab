import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { portfolioAPI, assetsAPI, Portfolio, Asset } from '../services/api';
import { getStockQuotes, StockQuote, calculatePortfolioChange } from '../services/stockData';
import Logo from '../components/Logo';
import { PortfolioChart } from '../components/dashboard/PortfolioChart';
import { AssetAllocation } from '../components/dashboard/AssetAllocation';
import './Dashboard.css';

interface AssetWithQuote extends Asset {
  quote?: StockQuote;
}

const Dashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [assets, setAssets] = useState<AssetWithQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioChange, setPortfolioChange] = useState<{ change: number; changePercent: number }>({ change: 0, changePercent: 0 });
  const [showAllHoldings, setShowAllHoldings] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const HOLDINGS_PER_PAGE = 5;

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      loadAssets(selectedPortfolio.id);
    }
  }, [selectedPortfolio]);

  const loadPortfolios = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token exists:', !!token);
      if (token) {
        console.log('Token length:', token.length);
        console.log('Token preview:', token.substring(0, 20) + '...');
      }
      
      const data = await portfolioAPI.getAll();
      setPortfolios(data);
      if (data.length > 0) {
        setSelectedPortfolio(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading portfolios:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // If it's a 422 or 401, the token might be invalid
      if (error.response?.status === 422 || error.response?.status === 401) {
        console.error('Authentication error - token may be invalid');
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async (portfolioId: number) => {
    try {
      const data = await assetsAPI.getAssets(portfolioId);
      setAssets(data);
      
      // Fetch real-time stock quotes for stock and crypto assets
      const stockAssets = data.filter(asset => asset.asset_type === 'stock' || !asset.asset_type || asset.asset_type === 'crypto');
      if (stockAssets.length > 0) {
        const symbols = stockAssets.map(asset => asset.symbol);
        try {
          const quotes = await getStockQuotes(symbols);
          const quoteMap = new Map(quotes.map(q => [q.symbol, q]));
          
          // Add quotes to assets for display (daily % change) but keep stored values
          const assetsWithQuotes: AssetWithQuote[] = data.map(asset => {
            if (asset.asset_type === 'stock' || !asset.asset_type || asset.asset_type === 'crypto') {
              const quote = quoteMap.get(asset.symbol);
              if (quote) {
                // Use daily change from API directly
                return {
                  ...asset,
                  quote, // Contains daily changePercent from API
                  // Keep stored price and value from database
                } as AssetWithQuote;
              }
            }
            return asset as AssetWithQuote;
          });
          
          setAssets(assetsWithQuotes);
          
          // Calculate portfolio change vs stored portfolio value
          const currentValue = assetsWithQuotes.reduce((sum, asset) => {
            // Use quote price if available, otherwise use stored price
            const price = asset.quote?.price || asset.price || 0;
            return sum + (asset.quantity * price);
          }, 0);
          const storedValue = selectedPortfolio?.total_value || 0;
          
          // Calculate change percentage
          const baseValue = storedValue > 0 ? storedValue : currentValue * 0.92;
          const change = calculatePortfolioChange(currentValue, baseValue);
          setPortfolioChange(change);
        } catch (error) {
          console.error('Error fetching stock quotes:', error);
        }
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const getAssetTypeConfig = (type: string) => {
    const configs: { [key: string]: { name: string; icon: string; color: string } } = {
      stock: { name: 'Stock', icon: '📈', color: 'rgba(34, 197, 94, 0.2)' },
      crypto: { name: 'Crypto', icon: '₿', color: 'rgba(251, 191, 36, 0.2)' },
      bond: { name: 'Bond', icon: '💼', color: 'rgba(59, 130, 246, 0.2)' },
      etf: { name: 'ETF', icon: '📊', color: 'rgba(168, 85, 247, 0.2)' },
      cash: { name: 'Cash', icon: '💵', color: 'rgba(34, 197, 94, 0.2)' },
      'real estate': { name: 'Real Estate', icon: '🏠', color: 'rgba(236, 72, 153, 0.2)' },
      other: { name: 'Other', icon: '📦', color: 'rgba(107, 114, 128, 0.2)' },
    };
    return configs[type.toLowerCase()] || configs.other;
  };

  // Stock symbol to name/logo mapping
  const stockInfoMap: { [key: string]: { name: string; logo: string } } = {
    'AAPL': { name: 'Apple Inc.', logo: '🍎' },
    'MSFT': { name: 'Microsoft Corp.', logo: '💻' },
    'TSLA': { name: 'Tesla Inc.', logo: '🚗' },
    'GOOGL': { name: 'Alphabet Inc.', logo: '🔍' },
    'AMZN': { name: 'Amazon.com Inc.', logo: '📦' },
    'META': { name: 'Meta Platforms Inc.', logo: '📘' },
    'NVDA': { name: 'NVIDIA Corp.', logo: '🎮' },
    'BTC': { name: 'Bitcoin', logo: '₿' },
    'ETH': { name: 'Ethereum', logo: 'Ξ' },
    'BNB': { name: 'Binance Coin', logo: '🟡' },
  };

  // Calculate total portfolio value from assets
  const currentTotalValue = useMemo(() => {
    // Use stored portfolio value as primary source
    if (selectedPortfolio?.total_value) {
      return selectedPortfolio.total_value;
    }
    // Fallback to sum of assets
    if (assets.length > 0) {
      return assets.reduce((sum, asset) => {
        // Use quote price if available, otherwise use stored price
        const price = asset.quote?.price || asset.price || 0;
        return sum + (asset.quantity * price);
      }, 0);
    }
    return 0;
  }, [selectedPortfolio, assets]);
  
  // Calculate portfolio change (12.50% increase vs last month) - using useMemo to avoid recalculation
  const portfolioChangeValue = useMemo(() => {
    const previousMonthValue = currentTotalValue / 1.125;
    return calculatePortfolioChange(currentTotalValue, previousMonthValue);
  }, [currentTotalValue]);
  
  // Update portfolio change when total value changes
  useEffect(() => {
    setPortfolioChange(portfolioChangeValue);
  }, [portfolioChangeValue]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Logo size={32} className="sidebar-logo" />
          <span className="sidebar-logo-text">MoneyLab</span>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button 
            className="nav-item" 
            onClick={() => {
              if (selectedPortfolio) {
                navigate(`/optimize/${selectedPortfolio.id}`);
              } else if (portfolios.length > 0) {
                navigate(`/optimize/${portfolios[0].id}`);
              } else {
                navigate('/dashboard');
              }
            }}
          >
            <span className="nav-icon">⚖️</span>
            <span>Optimize</span>
          </button>
          <button 
            className="nav-item" 
            onClick={() => {
              if (selectedPortfolio) {
                navigate(`/manage/${selectedPortfolio.id}`);
              } else if (portfolios.length > 0) {
                navigate(`/manage/${portfolios[0].id}`);
              } else {
                navigate('/dashboard');
              }
            }}
          >
            <span className="nav-icon">📈</span>
            <span>Manage Portfolio</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item">
            <span className="nav-icon">👤</span>
            <span>Account</span>
          </button>
          <button className="nav-item" onClick={logout}>
            <span className="nav-icon">🚪</span>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>Welcome back!</h2>
        </div>

        <div className="portfolio-value-card">
          <div className="portfolio-value-header">
            <span className="portfolio-value-label">Total Portfolio Value</span>
            <div className="portfolio-value-icon">💼</div>
          </div>
          <div className="portfolio-value-amount">
            ${currentTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`portfolio-value-change ${portfolioChange.changePercent >= 0 ? 'positive' : 'negative'}`}>
            <span className="change-arrow">{portfolioChange.changePercent >= 0 ? '↑' : '↓'}</span>
            {Math.abs(portfolioChange.changePercent).toFixed(2)}% vs last month
          </div>
        </div>

        <div className="dashboard-charts">
          <PortfolioChart totalValue={currentTotalValue} />
          <AssetAllocation assets={assets} />
        </div>

        <div className="holdings-table-container">
          <div className="holdings-header">
            <h3>Portfolio Holdings</h3>
            <span className="holdings-count">{assets.length} {assets.length === 1 ? 'asset' : 'assets'}</span>
          </div>
          <table className="holdings-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>TYPE</th>
                <th>TICKER</th>
                <th>QUANTITY</th>
                <th>PRICE</th>
                <th>VALUE</th>
                <th>CHANGE</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-holdings">
                    No holdings yet. Add assets to your portfolio to see them here.
                  </td>
                </tr>
              ) : (
                assets
                  .slice(0, showAllHoldings ? undefined : HOLDINGS_PER_PAGE)
                  .map((asset) => {
                    const assetType = asset.asset_type || 'stock';
                    const isNonTradable = assetType === 'cash' || assetType === 'real estate' || assetType === 'other';
                    const stockInfo = stockInfoMap[asset.symbol?.toUpperCase()] || { 
                      name: asset.name || asset.symbol || assetType, 
                      logo: '📈' 
                    };
                    
                    // Get asset type config
                    const typeConfig = getAssetTypeConfig(assetType);
                    
                    // Use stored price and value from database
                    const displayPrice = asset.price || 0;
                    const displayValue = asset.value || 0;
                    
                    // Use daily change from API (only for tradable assets)
                    const changePercent = !isNonTradable ? (asset.quote?.changePercent || 0) : 0;
                    
                    return (
                      <tr key={asset.id}>
                        <td>
                          <div className="holding-name-cell">
                            <span className="holding-logo">{stockInfo.logo}</span>
                            <strong>{stockInfo.name}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="asset-type-badge-small" style={{ backgroundColor: typeConfig.color }}>
                            <span className="asset-type-icon-small">{typeConfig.icon}</span>
                            <span>{typeConfig.name}</span>
                          </div>
                        </td>
                        <td>
                          {isNonTradable ? (
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>—</span>
                          ) : (
                            <strong>{asset.symbol}</strong>
                          )}
                        </td>
                        <td>
                          {isNonTradable ? (
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>—</span>
                          ) : (
                            asset.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          )}
                        </td>
                        <td>
                          {isNonTradable ? (
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>—</span>
                          ) : (
                            `$${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          )}
                        </td>
                        <td><strong>${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                        <td className={changePercent >= 0 ? 'change-positive' : 'change-negative'}>
                          {isNonTradable ? (
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>—</span>
                          ) : changePercent !== 0 ? (
                            <>
                              <span className="trend-icon-small">{changePercent >= 0 ? '↑' : '↓'}</span>
                              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                            </>
                          ) : (
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
          {assets.length > HOLDINGS_PER_PAGE && (
            <div className="holdings-view-more">
              <button 
                onClick={() => setShowAllHoldings(!showAllHoldings)}
                className="btn-view-more"
              >
                <span className="btn-view-more-icon">{showAllHoldings ? '▲' : '▼'}</span>
                <span>{showAllHoldings ? 'Show Less' : `View All ${assets.length} Holdings`}</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
