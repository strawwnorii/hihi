import { Routes, Route, Navigate } from 'react-router-dom';
import { CakePage } from './pages/CakePage';
import { SubmitPage } from './pages/SubmitPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/cake/:slug" element={<CakePage />} />
      <Route path="/submit/:slug" element={<SubmitPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
