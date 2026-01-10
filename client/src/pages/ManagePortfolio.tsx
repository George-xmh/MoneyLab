import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { portfolioAPI, assetsAPI, Portfolio, Asset } from '../services/api';
import Logo from '../components/Logo';
import './ManagePortfolio.css';

const ManagePortfolio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ symbol: '', quantity: '' });
  const [newAsset, setNewAsset] = useState({ symbol: '', quantity: '' });

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
      setAssets(portfolioData.assets || []);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setEditValues({ symbol: asset.symbol, quantity: asset.quantity.toString() });
  };

  const handleSaveEdit = async (assetId: number) => {
    try {
      const asset = assets.find(a => a.id === assetId);
      if (!asset) return;

      const quantity = parseFloat(editValues.quantity);
      const newValue = quantity * asset.price;
      
      await assetsAPI.updateAsset(assetId, {
        symbol: editValues.symbol,
        quantity: quantity,
        value: newValue,
      });
      
      setEditingId(null);
      loadPortfolio();
    } catch (error) {
      console.error('Error updating asset:', error);
      alert('Failed to update asset');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ symbol: '', quantity: '' });
  };

  const handleAddAsset = async () => {
    if (!id || !newAsset.symbol || !newAsset.quantity) return;
    
    try {
      // For now, we'll use a default price. In production, you'd fetch real-time prices
      const defaultPrice = 100;
      const quantity = parseFloat(newAsset.quantity);
      const value = quantity * defaultPrice;

      await assetsAPI.createAsset(parseInt(id), {
        symbol: newAsset.symbol.toUpperCase(),
        name: newAsset.symbol.toUpperCase(),
        quantity: quantity,
        price: defaultPrice,
        value: value,
        asset_type: 'stock',
      });

      setNewAsset({ symbol: '', quantity: '' });
      loadPortfolio();
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('Failed to add asset');
    }
  };

  const handleDeleteAsset = async (assetId: number) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      await assetsAPI.deleteAsset(assetId);
      loadPortfolio();
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    }
  };

  const handleSaveChanges = async () => {
    // Recalculate total portfolio value
    if (!id) return;
    
    try {
      const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
      await portfolioAPI.update(parseInt(id), { total_value: totalValue });
      alert('Changes saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes');
    }
  };

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
          <button className="nav-item" onClick={() => navigate(`/optimize/${id}`)}>
            <span className="nav-icon">⚖️</span>
            <span>Optimize</span>
          </button>
          <button className="nav-item active">
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

      <main className="manage-portfolio-content">
        <div className="manage-header">
          <div>
            <h1>Update Your <span className="highlight">Portfolio</span></h1>
            <p className="portfolio-name">{portfolio.name}</p>
          </div>
          <div className="header-actions">
            <button className="btn-upload">
              <span>📤</span> Upload
            </button>
            <button className="btn-add" onClick={handleAddAsset}>
              <span>+</span>
            </button>
          </div>
        </div>

        <div className="portfolio-table-container">
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>TICKER</th>
                <th>TOTAL SHARES</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className={editingId === asset.id ? 'editing' : ''}>
                  <td>
                    {editingId === asset.id ? (
                      <input
                        type="text"
                        value={editValues.symbol}
                        onChange={(e) => setEditValues({ ...editValues, symbol: e.target.value.toUpperCase() })}
                        className="edit-input"
                      />
                    ) : (
                      <strong>{asset.symbol}</strong>
                    )}
                  </td>
                  <td>
                    {editingId === asset.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.quantity}
                        onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      asset.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    )}
                  </td>
                  <td>
                    {editingId === asset.id ? (
                      <div className="edit-actions">
                        <button onClick={() => handleSaveEdit(asset.id)} className="btn-save">Save</button>
                        <button onClick={handleCancelEdit} className="btn-cancel">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => handleEdit(asset)} className="btn-edit">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="new-row">
                <td>
                  <input
                    type="text"
                    placeholder="Ticker"
                    value={newAsset.symbol}
                    onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value.toUpperCase() })}
                    className="new-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Shares"
                    value={newAsset.quantity}
                    onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                    className="new-input"
                  />
                </td>
                <td>
                  <button onClick={handleAddAsset} className="btn-edit">Add</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="save-section">
          <button onClick={handleSaveChanges} className="btn-save-changes">
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
};

export default ManagePortfolio;
