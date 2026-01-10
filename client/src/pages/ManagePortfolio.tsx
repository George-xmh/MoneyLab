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
  const [editValues, setEditValues] = useState({ symbol: '', quantity: '', value: '', asset_type: 'stock' });
  const [newAsset, setNewAsset] = useState({ symbol: '', quantity: '', value: '', asset_type: 'stock' });
  
  const isNonTradableAsset = (type: string) => {
    return type === 'cash' || type === 'real estate' || type === 'other';
  };
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; assetId: number | null; assetName: string }>({
    show: false,
    assetId: null,
    assetName: '',
  });

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
    setEditValues({ 
      symbol: asset.symbol || '', 
      quantity: asset.quantity ? asset.quantity.toString() : '',
      value: asset.value ? asset.value.toString() : '',
      asset_type: asset.asset_type || 'stock'
    });
  };

  const handleSaveEdit = async (assetId: number) => {
    try {
      const asset = assets.find(a => a.id === assetId);
      if (!asset) return;

      const isNonTradable = isNonTradableAsset(editValues.asset_type);
      
      let quantity = 0;
      let newValue = 0;
      let symbol = '';
      
      if (isNonTradable) {
        // For cash, real estate, etc. - just use the value
        newValue = parseFloat(editValues.value) || 0;
        quantity = 1; // Default quantity for non-tradable assets
        symbol = editValues.asset_type.toUpperCase(); // Use asset type as symbol
      } else {
        // For stocks, crypto, etc. - use quantity and price
        quantity = parseFloat(editValues.quantity) || 0;
        newValue = quantity * (asset.price || 0);
        symbol = editValues.symbol.toUpperCase();
      }
      
      await assetsAPI.updateAsset(assetId, {
        symbol: symbol,
        quantity: quantity,
        value: newValue,
        asset_type: editValues.asset_type,
      });
      
      setEditingId(null);
      setEditValues({ symbol: '', quantity: '', value: '', asset_type: 'stock' });
      loadPortfolio();
    } catch (error) {
      console.error('Error updating asset:', error);
      alert('Failed to update asset');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ symbol: '', quantity: '', value: '', asset_type: 'stock' });
  };

  const handleAddAsset = async () => {
    if (!id) return;
    
    const isNonTradable = isNonTradableAsset(newAsset.asset_type);
    
    // Validate based on asset type
    if (isNonTradable) {
      if (!newAsset.value || parseFloat(newAsset.value) <= 0) {
        alert('Please enter a valid value');
        return;
      }
    } else {
      if (!newAsset.symbol || !newAsset.quantity) {
        alert('Please enter both ticker and quantity');
        return;
      }
    }
    
    try {
      let quantity = 0;
      let value = 0;
      let price = 0;
      let symbol = '';
      let name = '';
      
      if (isNonTradable) {
        // For cash, real estate, etc. - just use the value
        value = parseFloat(newAsset.value) || 0;
        quantity = 1;
        price = value;
        symbol = newAsset.asset_type.toUpperCase();
        name = newAsset.asset_type.charAt(0).toUpperCase() + newAsset.asset_type.slice(1);
      } else {
        // For stocks, crypto, etc. - fetch price and calculate value
        // For now, use a default price. In production, you'd fetch real-time prices
        const defaultPrice = 100;
        quantity = parseFloat(newAsset.quantity) || 0;
        price = defaultPrice;
        value = quantity * price;
        symbol = newAsset.symbol.toUpperCase();
        name = newAsset.symbol.toUpperCase();
      }

      await assetsAPI.createAsset(parseInt(id), {
        symbol: symbol,
        name: name,
        quantity: quantity,
        price: price,
        value: value,
        asset_type: newAsset.asset_type,
      });

      setNewAsset({ symbol: '', quantity: '', value: '', asset_type: 'stock' });
      loadPortfolio();
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('Failed to add asset');
    }
  };

  const handleDeleteClick = (assetId: number, assetSymbol: string) => {
    setDeleteConfirm({
      show: true,
      assetId,
      assetName: assetSymbol,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.assetId) return;
    
    try {
      await assetsAPI.deleteAsset(deleteConfirm.assetId);
      setDeleteConfirm({ show: false, assetId: null, assetName: '' });
      loadPortfolio();
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
      setDeleteConfirm({ show: false, assetId: null, assetName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, assetId: null, assetName: '' });
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
            {/* Removed Upload and + buttons */}
          </div>
        </div>

        <div className="portfolio-table-container">
          <div className="table-header-modern">
            <h3 className="table-title">Portfolio Assets</h3>
            <p className="table-subtitle">Manage your investments across different asset types</p>
          </div>
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>TYPE</th>
                <th>TICKER</th>
                <th>QUANTITY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const assetType = asset.asset_type || 'stock';
                const typeConfig = getAssetTypeConfig(assetType);
                return (
                  <tr key={asset.id} className={editingId === asset.id ? 'editing' : ''}>
                    <td>
                      {editingId === asset.id ? (
                        <select
                          value={editValues.asset_type}
                          onChange={(e) => setEditValues({ ...editValues, asset_type: e.target.value })}
                          className="edit-select"
                        >
                          <option value="stock">📈 Stock</option>
                          <option value="crypto">₿ Crypto</option>
                          <option value="bond">💼 Bond</option>
                          <option value="etf">📊 ETF</option>
                          <option value="cash">💵 Cash</option>
                          <option value="real estate">🏠 Real Estate</option>
                          <option value="other">📦 Other</option>
                        </select>
                      ) : (
                        <div className="asset-type-badge" style={{ backgroundColor: typeConfig.color }}>
                          <span className="asset-type-icon">{typeConfig.icon}</span>
                          <span className="asset-type-name">{typeConfig.name}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === asset.id ? (
                        isNonTradableAsset(editValues.asset_type) ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValues.value}
                            onChange={(e) => setEditValues({ ...editValues, value: e.target.value })}
                            className="edit-input"
                            placeholder="Value ($)"
                          />
                        ) : (
                          <input
                            type="text"
                            value={editValues.symbol}
                            onChange={(e) => setEditValues({ ...editValues, symbol: e.target.value.toUpperCase() })}
                            className="edit-input"
                            placeholder="Ticker"
                          />
                        )
                      ) : (
                        <div className="ticker-cell">
                          {isNonTradableAsset(assetType) ? (
                            <strong>${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          ) : (
                            <strong>{asset.symbol}</strong>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === asset.id ? (
                        isNonTradableAsset(editValues.asset_type) ? (
                          <span className="non-tradable-label">N/A</span>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            value={editValues.quantity}
                            onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                            className="edit-input"
                            placeholder="Quantity"
                          />
                        )
                      ) : (
                        <div className="quantity-cell">
                          {isNonTradableAsset(assetType) ? (
                            <span className="non-tradable-label">—</span>
                          ) : (
                            asset.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === asset.id ? (
                        <div className="edit-actions">
                          <button onClick={() => handleSaveEdit(asset.id)} className="btn-save">
                            <span>✓</span> Save
                          </button>
                          <button onClick={handleCancelEdit} className="btn-cancel">
                            <span>✕</span> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(asset)} className="btn-edit">
                            <span>✏️</span> Edit
                          </button>
                          <button onClick={() => handleDeleteClick(asset.id, asset.symbol)} className="btn-delete">
                            <span>🗑️</span> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="new-row">
                <td>
                  <select
                    value={newAsset.asset_type}
                    onChange={(e) => setNewAsset({ ...newAsset, asset_type: e.target.value, symbol: '', quantity: '', value: '' })}
                    className="new-select"
                  >
                    <option value="stock">📈 Stock</option>
                    <option value="crypto">₿ Crypto</option>
                    <option value="bond">💼 Bond</option>
                    <option value="etf">📊 ETF</option>
                    <option value="cash">💵 Cash</option>
                    <option value="real estate">🏠 Real Estate</option>
                    <option value="other">📦 Other</option>
                  </select>
                </td>
                <td>
                  {isNonTradableAsset(newAsset.asset_type) ? (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Value ($)"
                      value={newAsset.value}
                      onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                      className="new-input"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Ticker (e.g., AAPL)"
                      value={newAsset.symbol}
                      onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value.toUpperCase() })}
                      className="new-input"
                    />
                  )}
                </td>
                <td>
                  {isNonTradableAsset(newAsset.asset_type) ? (
                    <span className="non-tradable-label">N/A</span>
                  ) : (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Quantity"
                      value={newAsset.quantity}
                      onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                      className="new-input"
                    />
                  )}
                </td>
                <td>
                  <button onClick={handleAddAsset} className="btn-add-asset">
                    <span>+</span> Add Asset
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Removed Save Changes button */}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon-wrapper">
                <svg className="modal-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="modal-title">Delete Asset</h2>
              <p className="modal-message">
                Are you sure you want to delete <strong>{deleteConfirm.assetName}</strong> from your portfolio?
              </p>
              <p className="modal-submessage">
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button onClick={handleDeleteCancel} className="modal-btn-cancel">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="modal-btn-delete">
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePortfolio;
