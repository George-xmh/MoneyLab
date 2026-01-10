import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { portfolioAPI, assetsAPI, Portfolio, Asset } from '../services/api';
import Logo from '../components/Logo';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Brush } from 'recharts';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const totalValue = selectedPortfolio?.total_value || 0;
  const firstName = user?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  // Generate chart data based on portfolio value over time
  // In production, this would come from historical portfolio snapshots
  const generateChartData = () => {
    const days = 30; // Last 30 days
    const data = [];
    const baseValue = totalValue || 10000;
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate portfolio value changes (in production, use real historical data)
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const value = baseValue * (1 + variation * (days - i) / days);
      
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data.push({ 
        date: dateStr, 
        fullDate: date.toISOString(),
        value: Math.max(0, value) 
      });
    }
    
    return data;
  };

  const chartData = generateChartData();

  // Pie chart shows only stock holdings
  const pieData = assets
    .filter(asset => asset.asset_type === 'stock' || !asset.asset_type)
    .map(asset => ({
      name: asset.symbol,
      value: asset.value,
    }));

  const COLORS = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#10b981'];

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
          <button className="nav-item" onClick={() => selectedPortfolio && navigate(`/optimize/${selectedPortfolio.id}`)}>
            <span className="nav-icon">⚖️</span>
            <span>Optimize</span>
          </button>
          <button className="nav-item" onClick={() => selectedPortfolio && navigate(`/manage/${selectedPortfolio.id}`)}>
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
          <h2>{getGreeting()} {firstName}. You have</h2>
          <h1 className="total-balance">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
        </div>

        <div className="dashboard-charts">
          <div className="chart-container line-chart">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255, 255, 255, 0.5)"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.5)"
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Portfolio Value']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Brush 
                  dataKey="date" 
                  height={30}
                  stroke="#22c55e"
                  fill="rgba(34, 197, 94, 0.1)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container pie-chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: 'No assets', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="holdings-table-container">
          <h3>Holdings</h3>
          <table className="holdings-table">
            <thead>
              <tr>
                <th>TICKER</th>
                <th>TOTAL SHARES</th>
                <th>CURRENT PRICE</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-holdings">
                    No holdings yet. Add assets to your portfolio to see them here.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id}>
                    <td><strong>{asset.symbol}</strong></td>
                    <td>{asset.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
