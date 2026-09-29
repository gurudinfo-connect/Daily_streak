import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DailyStreakPage from './pages/DailyStreak/DailyStreakPage.jsx';
import AppShell from './components/AppShell.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import DashboardPage from './pages/Dashboard/DashboardPage.jsx';

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
          <Route path="/daily-streak" element={<DailyStreakPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/daily-streak" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
