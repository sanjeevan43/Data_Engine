import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MainApp from './pages/MainApp';

/**
 * Top‑level router for the application.
 *   /          → landing page (HomePage)
 *   /app       → main CSV‑import workflow (MainApp)
 *   any other  → redirects back to the landing page
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/app" element={<MainApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;