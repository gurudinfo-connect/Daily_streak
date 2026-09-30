import React from 'react';
import { Activity } from 'lucide-react';
import { PageGate, PageTitle, ActivityCard } from '../components/widgets/Widgets.jsx';

export default function ActivityPage() {
  return (
    <PageGate>
      {({ dash }) => (
        <div className="vl-page">
          <PageTitle icon={<Activity size={26} />} title="Activity" sub="Your latest check-ins and rewards, straight from your wallet history." />
          <ActivityCard dash={dash} limit={10} />
        </div>
      )}
    </PageGate>
  );
}
