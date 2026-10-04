import { lazy } from 'react';

// One loader per page so each route becomes its own chunk, and so the shell can
// warm every chunk in the background (instant navigation after first load).
const loaders = {
  dashboard: () => import('./pages/Dashboard/DashboardPage.jsx'),
  streak: () => import('./pages/DailyStreak/DailyStreakPage.jsx'),
  leaderboard: () => import('./pages/LeaderboardPage.jsx'),
  rewards: () => import('./pages/RewardsPage.jsx'),
  achievements: () => import('./pages/AchievementsPage.jsx'),
  milestones: () => import('./pages/MilestonesPage.jsx'),
  activity: () => import('./pages/ActivityPage.jsx'),
  profile: () => import('./pages/ProfilePage.jsx'),
  settings: () => import('./pages/SettingsPage.jsx'),
};
export const pages = Object.fromEntries(Object.entries(loaders).map(([k, load]) => [k, lazy(load)]));
export const prefetchPages = () => Object.values(loaders).forEach((load) => load().catch(() => {}));
