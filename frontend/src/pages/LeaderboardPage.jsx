import React from 'react';
import { Trophy } from 'lucide-react';
import styles from './Dashboard/Dashboard.module.css';

// The backend has no leaderboard endpoint yet, so no rankings are shown (nothing is fabricated).
export default function LeaderboardPage() {
  return (
    <div className={styles.page}>
      <section className={styles.placeholder}>
        <Trophy size={40} className={styles.phIcon} />
        <h1 className={styles.title}>Leaderboard</h1>
        <p className={styles.phText}>Rankings will appear here once leaderboard data is available from the server.</p>
        <span className={styles.badge}>Coming soon</span>
      </section>
    </div>
  );
}
