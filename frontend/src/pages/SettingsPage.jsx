import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import styles from '../components/widgets/Widgets.module.css';
import { Card, CardHead, PageTitle } from '../components/widgets/Widgets.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import LogoutConfirm from '../components/LogoutConfirm.jsx';
import useLogout from '../components/useLogout.js';
import { displayNameOf } from '../utils/streakInsights';

// The backend has no profile-update endpoints, so account details are read-only.
export default function SettingsPage() {
  const { user } = useAuth();
  const { confirming, askLogout, cancelLogout, confirmLogout } = useLogout();
  return (
    <div className="vl-page">
      <PageTitle icon={<Settings size={26} />} title="Settings" />
      <div className={styles.stackGap}>
        <Card>
          <CardHead title="Account" />
          <dl className={styles.formList}>
            <div><dt>Name</dt><dd>{displayNameOf(null, user)}</dd></div>
            <div><dt>Email</dt><dd>{user?.email || '—'}</dd></div>
          </dl>
          <p style={{ color: 'var(--vl-text-dim)', fontSize: '0.8rem', marginBottom: 0 }}>Editing account details isn't available yet.</p>
        </Card>
        <Card>
          <CardHead title="Session" />
          <button className="vl-btn vl-ghost" onClick={askLogout}><LogOut size={18} /> LOGOUT</button>
        </Card>
      </div>
      {confirming && <LogoutConfirm onConfirm={confirmLogout} onCancel={cancelLogout} />}
    </div>
  );
}
