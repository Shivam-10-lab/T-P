import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/jnf/admin/login', { email, password });
      localStorage.setItem('jnf_token', res.data.token);
      navigate('/admin/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>T&P Admin Portal</h2>
        <p>NIT Srinagar — Training & Placement</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@nitsri.ac" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button className="login-btn" type="submit">Login</button>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
}