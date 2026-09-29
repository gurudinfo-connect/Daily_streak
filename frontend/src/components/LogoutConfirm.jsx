import React, { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import styles from './LogoutConfirm.module.css';

// Small confirmation dialog so a stray tap on the corner button doesn't sign the user out.
export default function LogoutConfirm({ onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className={styles.overlay} onClick={onCancel} role="presentation">
      <div
        className={styles.card}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.icon}><LogOut size={22} /></div>
        <div id="logout-title" className={styles.title}>Log out of VELoop?</div>
        <div className={styles.sub}>Your streak and rewards are saved. Log in again any time to keep going.</div>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel} autoFocus>Stay logged in</button>
          <button type="button" className={styles.confirm} onClick={onConfirm}>Log out</button>
        </div>
      </div>
    </div>
  );
}
