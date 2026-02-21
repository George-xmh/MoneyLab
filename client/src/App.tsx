import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PortfolioDetail from './pages/PortfolioDetail';
import ManagePortfolio from './pages/ManagePortfolio';
import Optimize from './pages/Optimize';
import Account from './pages/Account';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/portfolio/:id"
              element={
                <PrivateRoute>
                  <PortfolioDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage/:id"
              element={
                <PrivateRoute>
                  <ManagePortfolio />
                </PrivateRoute>
              }
            />
            <Route
              path="/optimize/:id"
              element={
                <PrivateRoute>
                  <Optimize />
                </PrivateRoute>
              }
            />
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
