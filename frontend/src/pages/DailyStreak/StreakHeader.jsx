import React from 'react';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './DailyStreak.module.css';
import dashStyles from '../Dashboard/Dashboard.module.css';
import { ICONS } from '../../assets/icons.js';
import LogoutConfirm from '../../components/LogoutConfirm.jsx';
import useLogout from '../../components/useLogout.js';

export default function StreakHeader({ gemBalance }) {
  const navigate = useNavigate();
  const { confirming, askLogout, cancelLogout, confirmLogout } = useLogout();

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        {/* Corner button now logs the user out (was a back arrow). */}
        <button className={styles.backBtn} onClick={askLogout} aria-label="Log out" title="Log out">
          <LogOut size={18} style={{ transform: 'scaleX(-1)' }} />
        </button>
        <div className={styles.headerTitle}>
          Daily Streak <img className={styles.flameSm} src={ICONS.flame} alt="" />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className={dashStyles.headerLink} onClick={() => navigate('/dashboard')}>
          <LayoutDashboard size={16} /> <span className={dashStyles.headerLinkText}>Dashboard</span>
        </button>
        <div className={styles.gemBadge} title="VES balance">
          <img className={styles.coinSm} src={ICONS.coin} alt="VES" />
          {gemBalance}
        </div>
      </div>
      {confirming && <LogoutConfirm onConfirm={confirmLogout} onCancel={cancelLogout} />}
    </div>
  );
}
