import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CakePage } from './pages/CakePage';
import { SubmitPage } from './pages/SubmitPage';
import { AdminPage } from './pages/AdminPage';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cake/:slug" element={<CakePage />} />
      <Route path="/submit/:slug" element={<SubmitPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
