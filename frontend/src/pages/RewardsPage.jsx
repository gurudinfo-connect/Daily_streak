import React from 'react';
import { Gift } from 'lucide-react';
import styles from '../components/widgets/Widgets.module.css';
import { PageGate, PageTitle, RewardTile } from '../components/widgets/Widgets.jsx';

export default function RewardsPage() {
  return (
    <PageGate>
      {({ dash, streakData }) => {
        const unlocked = streakData.rewards.filter((r) => r.status === 'CLAIMED').length;
        return (
          <div className="vl-page">
            <PageTitle icon={<Gift size={26} />} title="Rewards" sub={`${unlocked} of ${streakData.rewards.length} rewards unlocked in this cycle.`} />
            <div className={styles.rewardGrid}>
              {streakData.rewards.map((card) => (
                <RewardTile key={card.day} card={card} cycleLength={dash.streak.cycleLength} currentStreak={dash.streak.currentStreak} />
              ))}
            </div>
          </div>
        );
      }}
    </PageGate>
  );
}
