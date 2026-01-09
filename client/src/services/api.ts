import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  email: string;
  display_name: string;
  created_at: string;
}

export interface Portfolio {
  id: number;
  user_id: number;
  name: string;
  description: string;
  total_value: number;
  created_at: string;
  updated_at: string;
  assets?: Asset[];
  allocations?: AssetAllocation[];
}

export interface Asset {
  id: number;
  portfolio_id: number;
  symbol: string;
  name: string;
  asset_type: string;
  quantity: number;
  price: number;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface AssetAllocation {
  id: number;
  portfolio_id: number;
  symbol: string;
  target_percentage: number;
  asset_type: string;
  created_at: string;
  updated_at: string;
}

export interface RebalancingRecommendation {
  symbol: string;
  current_value: number;
  target_value: number;
  current_percentage: number;
  target_percentage: number;
  difference: number;
  action: 'BUY' | 'SELL' | 'HOLD';
}

export interface PortfolioMetrics {
  total_value: number;
  num_holdings: number;
  largest_holding: string | null;
  diversification_score: number;
}

// Auth API
export const authAPI = {
  verifyToken: async (firebaseUid: string, email: string, displayName?: string) => {
    const response = await api.post('/auth/verify', {
      firebase_uid: firebaseUid,
      email,
      display_name: displayName,
    });
    return response.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Portfolio API
export const portfolioAPI = {
  getAll: async (): Promise<Portfolio[]> => {
    const response = await api.get('/portfolio');
    return response.data;
  },
  getById: async (id: number): Promise<Portfolio> => {
    const response = await api.get(`/portfolio/${id}`);
    return response.data;
  },
  create: async (name: string, description?: string, totalValue?: number): Promise<Portfolio> => {
    const response = await api.post('/portfolio', {
      name,
      description,
      total_value: totalValue,
    });
    return response.data;
  },
  update: async (id: number, data: Partial<Portfolio>): Promise<Portfolio> => {
    const response = await api.put(`/portfolio/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/portfolio/${id}`);
  },
  getRebalancing: async (id: number): Promise<{
    recommendations: RebalancingRecommendation[];
    metrics: PortfolioMetrics;
  }> => {
    const response = await api.get(`/portfolio/${id}/rebalance`);
    return response.data;
  },
};

// Assets API
export const assetsAPI = {
  getAssets: async (portfolioId: number): Promise<Asset[]> => {
    const response = await api.get(`/assets/portfolio/${portfolioId}/assets`);
    return response.data;
  },
  createAsset: async (portfolioId: number, asset: Partial<Asset>): Promise<Asset> => {
    const response = await api.post(`/assets/portfolio/${portfolioId}/assets`, asset);
    return response.data;
  },
  updateAsset: async (id: number, asset: Partial<Asset>): Promise<Asset> => {
    const response = await api.put(`/assets/assets/${id}`, asset);
    return response.data;
  },
  deleteAsset: async (id: number): Promise<void> => {
    await api.delete(`/assets/assets/${id}`);
  },
  getAllocations: async (portfolioId: number): Promise<AssetAllocation[]> => {
    const response = await api.get(`/assets/portfolio/${portfolioId}/allocations`);
    return response.data;
  },
  createAllocation: async (portfolioId: number, allocation: Partial<AssetAllocation>): Promise<AssetAllocation> => {
    const response = await api.post(`/assets/portfolio/${portfolioId}/allocations`, allocation);
    return response.data;
  },
  deleteAllocation: async (id: number): Promise<void> => {
    await api.delete(`/assets/allocations/${id}`);
  },
};

export default api;
