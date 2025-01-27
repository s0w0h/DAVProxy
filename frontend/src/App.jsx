import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StorageSources from './pages/StorageSources';
import ProxyCredentials from './pages/ProxyCredentials';
import Admin from './pages/Admin';
import Navigation from './components/Navigation';

const { Content } = Layout;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (token) {
      // 验证用户是否为管理员
      axios.get('http://localhost:8000/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false));
    }
  }, [token]);

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {isAuthenticated && <Navigation onLogout={handleLogout} />}
          <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/storage-sources" element={isAuthenticated ? <StorageSources /> : <Navigate to="/login" />} />
          <Route path="/proxy-credentials" element={isAuthenticated ? <ProxyCredentials /> : <Navigate to="/login" />} />
          {isAdmin && <Route path="/admin" element={<Admin />} />}
        </Routes>
      </div>
    </Router>
  );
}

export default App;