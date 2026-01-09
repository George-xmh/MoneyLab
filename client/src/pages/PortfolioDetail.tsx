import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { portfolioAPI, assetsAPI, Portfolio, Asset, AssetAllocation, RebalancingRecommendation } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './PortfolioDetail.css';

const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [recommendations, setRecommendations] = useState<RebalancingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assets' | 'allocations' | 'rebalance'>('assets');
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ symbol: '', name: '', quantity: '', price: '', asset_type: 'stock' });
  const [newAllocation, setNewAllocation] = useState({ symbol: '', target_percentage: '', asset_type: 'stock' });

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
      setAllocations(portfolioData.allocations || []);
      
      // Load rebalancing recommendations
      try {
        const rebalanceData = await portfolioAPI.getRebalancing(parseInt(id));
        setRecommendations(rebalanceData.recommendations);
      } catch (error) {
        console.error('Error loading rebalancing:', error);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await assetsAPI.createAsset(parseInt(id), {
        symbol: newAsset.symbol,
        name: newAsset.name || newAsset.symbol,
        quantity: parseFloat(newAsset.quantity),
        price: parseFloat(newAsset.price),
        asset_type: newAsset.asset_type,
      });
      setNewAsset({ symbol: '', name: '', quantity: '', price: '', asset_type: 'stock' });
      setShowAssetModal(false);
      loadPortfolio();
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('Failed to add asset');
    }
  };

  const handleAddAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await assetsAPI.createAllocation(parseInt(id), {
        symbol: newAllocation.symbol,
        target_percentage: parseFloat(newAllocation.target_percentage),
        asset_type: newAllocation.asset_type,
      });
      setNewAllocation({ symbol: '', target_percentage: '', asset_type: 'stock' });
      setShowAllocationModal(false);
      loadPortfolio();
    } catch (error) {
      console.error('Error adding allocation:', error);
      alert('Failed to add allocation');
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

  const handleDeleteAllocation = async (allocationId: number) => {
    if (!window.confirm('Are you sure you want to delete this allocation target?')) return;
    try {
      await assetsAPI.deleteAllocation(allocationId);
      loadPortfolio();
    } catch (error) {
      console.error('Error deleting allocation:', error);
      alert('Failed to delete allocation');
    }
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

  const assetChartData = assets.map(asset => ({
    name: asset.symbol,
    value: asset.value,
  }));

  const allocationChartData = allocations.map(alloc => ({
    name: alloc.symbol,
    value: alloc.target_percentage,
  }));

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!portfolio) {
    return <div>Portfolio not found</div>;
  }

  return (
    <div className="portfolio-detail">
      <header className="detail-header">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
        <h1>{portfolio.name}</h1>
        {portfolio.description && <p>{portfolio.description}</p>}
        <div className="portfolio-total">
          Total Value: ${portfolio.total_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </header>

      <div className="detail-tabs">
        <button
          className={activeTab === 'assets' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </button>
        <button
          className={activeTab === 'allocations' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('allocations')}
        >
          Target Allocations
        </button>
        <button
          className={activeTab === 'rebalance' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('rebalance')}
        >
          Rebalancing
        </button>
      </div>

      <main className="detail-content">
        {activeTab === 'assets' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Current Holdings</h2>
              <button onClick={() => setShowAssetModal(true)} className="btn btn-primary">
                + Add Asset
              </button>
            </div>

            {assets.length > 0 && (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <table className="table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                      No assets yet. Add your first asset to get started!
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset.id}>
                      <td><strong>{asset.symbol}</strong></td>
                      <td>{asset.name}</td>
                      <td>{asset.asset_type}</td>
                      <td>{asset.quantity.toLocaleString()}</td>
                      <td>${asset.price.toFixed(2)}</td>
                      <td>${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'allocations' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Target Allocations</h2>
              <button onClick={() => setShowAllocationModal(true)} className="btn btn-primary">
                + Add Target
              </button>
            </div>

            {allocations.length > 0 && (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={allocationChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <table className="table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Target Percentage</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                      No target allocations set. Set your target allocations to enable rebalancing!
                    </td>
                  </tr>
                ) : (
                  allocations.map((alloc) => (
                    <tr key={alloc.id}>
                      <td><strong>{alloc.symbol}</strong></td>
                      <td>{alloc.target_percentage}%</td>
                      <td>{alloc.asset_type}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteAllocation(alloc.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'rebalance' && (
          <div className="tab-content">
            <h2>Rebalancing Recommendations</h2>
            {recommendations.length === 0 ? (
              <div className="empty-state">
                <p>Set target allocations first to see rebalancing recommendations.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Current %</th>
                    <th>Target %</th>
                    <th>Current Value</th>
                    <th>Target Value</th>
                    <th>Difference</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec, idx) => (
                    <tr key={idx}>
                      <td><strong>{rec.symbol}</strong></td>
                      <td>{rec.current_percentage.toFixed(2)}%</td>
                      <td>{rec.target_percentage.toFixed(2)}%</td>
                      <td>${rec.current_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>${rec.target_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>${Math.abs(rec.difference).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>
                        <span className={`badge badge-${rec.action === 'BUY' ? 'success' : rec.action === 'SELL' ? 'danger' : 'info'}`}>
                          {rec.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {showAssetModal && (
        <div className="modal-overlay" onClick={() => setShowAssetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Asset</h2>
            <form onSubmit={handleAddAsset}>
              <div className="form-group">
                <label>Symbol *</label>
                <input
                  type="text"
                  value={newAsset.symbol}
                  onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value.toUpperCase() })}
                  required
                  placeholder="AAPL"
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="Apple Inc."
                />
              </div>
              <div className="form-group">
                <label>Asset Type</label>
                <select
                  value={newAsset.asset_type}
                  onChange={(e) => setNewAsset({ ...newAsset, asset_type: e.target.value })}
                  className="form-input"
                >
                  <option value="stock">Stock</option>
                  <option value="bond">Bond</option>
                  <option value="etf">ETF</option>
                  <option value="crypto">Crypto</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newAsset.quantity}
                  onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                  required
                  placeholder="10"
                />
              </div>
              <div className="form-group">
                <label>Price per Share *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAsset.price}
                  onChange={(e) => setNewAsset({ ...newAsset, price: e.target.value })}
                  required
                  placeholder="150.00"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAllocationModal && (
        <div className="modal-overlay" onClick={() => setShowAllocationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Target Allocation</h2>
            <form onSubmit={handleAddAllocation}>
              <div className="form-group">
                <label>Symbol *</label>
                <input
                  type="text"
                  value={newAllocation.symbol}
                  onChange={(e) => setNewAllocation({ ...newAllocation, symbol: e.target.value.toUpperCase() })}
                  required
                  placeholder="AAPL"
                />
              </div>
              <div className="form-group">
                <label>Target Percentage *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={newAllocation.target_percentage}
                  onChange={(e) => setNewAllocation({ ...newAllocation, target_percentage: e.target.value })}
                  required
                  placeholder="25.0"
                />
              </div>
              <div className="form-group">
                <label>Asset Type</label>
                <select
                  value={newAllocation.asset_type}
                  onChange={(e) => setNewAllocation({ ...newAllocation, asset_type: e.target.value })}
                  className="form-input"
                >
                  <option value="stock">Stock</option>
                  <option value="bond">Bond</option>
                  <option value="etf">ETF</option>
                  <option value="crypto">Crypto</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAllocationModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDetail;
