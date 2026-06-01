import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
//const API = 'http://localhost:5000/api/jnf';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log(email, password);
      const res = await axios.post(`${API}/admin/login`, { email, password }, { withCredentials: true }); // send/recieve cookies
     // localStorage.setItem('jnf_token', res.data.token);
      console.log("LOGIN SUCCESS", res.data);
      navigate('/admin/dashboard');
    } catch (err) {
        setError(err.response?.data?.message ||'Invalid email or password')
    }finally{
      setLoading(false);
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
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
}