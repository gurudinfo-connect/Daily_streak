import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DailyStreakPage from './pages/DailyStreak/DailyStreakPage.jsx';
import AppShell from './components/AppShell.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import DashboardPage from './pages/Dashboard/DashboardPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import AchievementsPage from './pages/AchievementsPage.jsx';
import MilestonesPage from './pages/MilestonesPage.jsx';
import ActivityPage from './pages/ActivityPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

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
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/milestones" element={<MilestonesPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
