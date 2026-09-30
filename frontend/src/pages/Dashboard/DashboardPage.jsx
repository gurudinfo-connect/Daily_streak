import React from 'react';
import styles from '../../components/widgets/Widgets.module.css';
import { useAuth } from '../../context/AuthContext.jsx';
import { displayNameOf } from '../../utils/streakInsights';
import {
  PageGate, Welcome, HeroStreak, StatsRow, CheckInCard, WeekTracker, NextReward, StreakHealthCard,
  MotivationCard, MilestonesCard, ActivityCard, ProfileSummary, WalletCards, EarningsChart,
} from '../../components/widgets/Widgets.jsx';

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  return (
    <PageGate>
      {({ dash, streakData }) => {
        // Name comes from the signed-in account (dashboard API / session), never hardcoded.
        const name = displayNameOf(dash.user, authUser);
        return (
          <div className="vl-page">
            <Welcome name={name} streakData={streakData} />
            <HeroStreak dash={dash} streakData={streakData} />
            <StatsRow dash={dash} />
            <div className={styles.row2}>
              <CheckInCard streakData={streakData} />
              <WeekTracker dash={dash} />
            </div>
            <div className={styles.row3}>
              <NextReward dash={dash} streakData={streakData} />
              <StreakHealthCard dash={dash} streakData={streakData} />
              <MotivationCard />
            </div>
            <div className={styles.stackGap} style={{ marginBottom: 18 }}>
              <MilestonesCard dash={dash} />
            </div>
            <WalletCards dash={dash} />
            <div className={styles.row2b}>
              <EarningsChart dash={dash} />
              <ProfileSummary dash={dash} name={name} />
            </div>
            <ActivityCard dash={dash} limit={4} showAll />
          </div>
        );
      }}
    </PageGate>
  );
}
