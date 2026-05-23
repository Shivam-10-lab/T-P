import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormPage from './pages/FormPage';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}