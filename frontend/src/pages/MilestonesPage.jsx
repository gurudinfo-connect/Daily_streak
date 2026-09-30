import React from 'react';
import { Target } from 'lucide-react';
import { PageGate, PageTitle, MilestonesCard, HeroStreak } from '../components/widgets/Widgets.jsx';

export default function MilestonesPage() {
  return (
    <PageGate>
      {({ dash, streakData }) => (
        <div className="vl-page">
          <PageTitle icon={<Target size={26} />} title="Milestones" sub="Every streak day counts toward the next one." />
          <MilestonesCard dash={dash} full />
          <div style={{ height: 18 }} />
          <HeroStreak dash={dash} streakData={streakData} />
        </div>
      )}
    </PageGate>
  );
}
