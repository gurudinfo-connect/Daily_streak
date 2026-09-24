import React from 'react';
import styles from './DailyStreak.module.css';

// Purely visual placeholder for the ad/verification step. It never grants the
// reward itself — that only happens when the backend's /claim call succeeds.
export default function CpaDemo({ phase, icon }) {
  const success = phase === 'success';
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.modalArtWrap}>
          {!success && <div className={styles.modalSpinner} />}
          <img className={`${styles.modalArt} ${success ? styles.modalArtPop : ''}`} src={icon} alt="" />
        </div>
        {success ? (
          <div className={styles.modalSuccess}>Reward Claimed!</div>
        ) : (
          <>
            <div className={styles.modalTitle}>Preparing your reward…</div>
            <div className={styles.modalSub}>Advertisement / Reward Verification — Please wait…</div>
          </>
        )}
      </div>
    </div>
  );
}
