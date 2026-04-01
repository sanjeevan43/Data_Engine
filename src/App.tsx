import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MainApp from './pages/MainApp';
import CodeCleanupPage from './pages/CodeCleanupPage';
import AuthPage from './pages/AuthPage';
import SupportedDatabasesPage from './pages/SupportedDatabasesPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

/**
 * Top‑level router for the application.
 *   /          → landing page (HomePage)
 *   /app       → main CSV‑import workflow (MainApp)
 *   /cleanup   → code cleanup agent page
 *   any other  → redirects back to the landing page
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/signup" element={<AuthPage initialMode="signup" />} />
        <Route path="/app" element={<MainApp />} />
        <Route path="/databases" element={<SupportedDatabasesPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/cleanup" element={<CodeCleanupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;