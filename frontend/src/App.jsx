import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DailyStreakPage from './pages/DailyStreak/DailyStreakPage.jsx';

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
        <Route
          path="/daily-streak"
          element={
            <ProtectedRoute>
              <DailyStreakPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/daily-streak" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
