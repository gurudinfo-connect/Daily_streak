import React from 'react';
import { Trophy } from 'lucide-react';
import styles from '../components/widgets/Widgets.module.css';
import { Card, PageGate, PageTitle } from '../components/widgets/Widgets.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { displayNameOf } from '../utils/streakInsights';

// The backend has no leaderboard endpoint yet, so no rankings are invented.
// Only the signed-in user's own real streak is shown; the other rows are
// clearly-marked empty slots that will fill once the feature ships.
export default function LeaderboardPage() {
  const { user } = useAuth();
  return (
    <PageGate>
      {({ dash }) => (
        <div className="vl-page">
          <PageTitle icon={<Trophy size={26} />} title="🔥 Fire Streak Leaderboard" sub="Top streaks across VELOop." />
          <Card lift={false}>
            <div className={styles.leadList}>
              <div className={`${styles.leadRow} ${styles.leadYou}`}>
                <span className={styles.leadRank}>—</span>
                <span className={styles.leadName}>{displayNameOf(dash.user, user)} (you)</span>
                <span className={styles.leadVal}>{dash.streak.currentStreak} days</span>
              </div>
              {['🥇', '🥈', '🥉'].map((m) => (
                <div key={m} className={`${styles.leadRow} ${styles.leadGhost}`} aria-hidden="true">
                  <span className={styles.leadRank}>{m}</span>
                  <span className={styles.leadName}>Waiting for players</span>
                  <span className={styles.leadVal}>— days</span>
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--vl-text-dim)', margin: '0 0 12px' }}>Rankings will appear here once leaderboard data is available from the server.</p>
            <span className={styles.soon}>Coming soon</span>
          </Card>
        </div>
      )}
    </PageGate>
  );
}
