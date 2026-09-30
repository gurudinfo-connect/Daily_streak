import React from 'react';
import { User } from 'lucide-react';
import styles from '../components/widgets/Widgets.module.css';
import { useAuth } from '../context/AuthContext.jsx';
import { displayNameOf } from '../utils/streakInsights';
import { PageGate, PageTitle, ProfileSummary, WalletCards } from '../components/widgets/Widgets.jsx';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <PageGate>
      {({ dash }) => (
        <div className="vl-page">
          <PageTitle icon={<User size={26} />} title="Profile" />
          <div className={styles.stackGap}>
            <ProfileSummary dash={dash} name={displayNameOf(dash.user, user)} />
            <WalletCards dash={dash} />
          </div>
        </div>
      )}
    </PageGate>
  );
}
