import React from 'react';
import { Award } from 'lucide-react';
import { PageGate, PageTitle, AchievementsCard } from '../components/widgets/Widgets.jsx';

export default function AchievementsPage() {
  return (
    <PageGate>
      {({ dash }) => (
        <div className="vl-page">
          <PageTitle icon={<Award size={26} />} title="Achievements" sub="Unlocked automatically from your real check-in history." />
          <AchievementsCard dash={dash} />
        </div>
      )}
    </PageGate>
  );
}
