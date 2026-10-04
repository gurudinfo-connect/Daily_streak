import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AppShell from './components/AppShell.jsx';
import { pages } from './routes.js';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/daily-streak" element={<pages.streak />} />
          <Route path="/dashboard" element={<pages.dashboard />} />
          <Route path="/leaderboard" element={<pages.leaderboard />} />
          <Route path="/rewards" element={<pages.rewards />} />
          <Route path="/achievements" element={<pages.achievements />} />
          <Route path="/milestones" element={<pages.milestones />} />
          <Route path="/activity" element={<pages.activity />} />
          <Route path="/profile" element={<pages.profile />} />
          <Route path="/settings" element={<pages.settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
