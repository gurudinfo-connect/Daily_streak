// Pure helpers that derive UI state from the data the backend already returns.
// Nothing here invents data: every value comes from /dashboard or /daily-streak.

export const MILESTONE_DAYS = [3, 7, 14, 30, 60, 100];

export const MOTIVATION = [
  'Consistency creates results.',
  'Small steps, every single day.',
  "Don't break the chain.",
  'Your future self will thank you.',
  'Show up today. Tomorrow will follow.',
  'Momentum is built one check-in at a time.',
  'Fire needs fuel. Feed it daily.',
];

export const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`;
};

export const displayNameOf = (dashUser, authUser) => {
  const raw = dashUser?.name || authUser?.name || dashUser?.email || authUser?.email || '';
  const trimmed = String(raw).trim();
  if (!trimmed) return 'Player';
  return trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
};

export const formatAmount = (currency, amount) => (currency === 'INR' ? `₹${amount}` : `${amount} VES`);

// "ready"  -> a reward can be claimed right now
// "done"   -> today's check-in is complete, next one unlocks at nextClaimAt
// "none"   -> nothing pending (defensive)
export function getCheckInState(streakData) {
  if (!streakData?.rewards) return { state: 'loading' };
  const ready = streakData.rewards.find((c) => c.status === 'AVAILABLE');
  if (ready) return { state: 'ready', card: ready };
  const waiting = streakData.rewards.find((c) => c.status === 'TODAY');
  if (waiting) return { state: 'done', card: waiting, nextClaimAt: waiting.nextClaimAt ? new Date(waiting.nextClaimAt) : null };
  return { state: 'none' };
}

export function streakMessage(n) {
  if (n <= 0) return 'Check in today to start your streak.';
  if (n <= 2) return 'Great start! Keep going.';
  if (n <= 6) return "You're on fire! Keep going.";
  return 'Legendary consistency!';
}

// Monday → Sunday of the current week, marked from real claim transactions.
export function buildWeek(last7Days = [], memberSince) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const offsetToMonday = (today.getDay() + 6) % 7; // Mon=0 … Sun=6
  const joined = memberSince ? new Date(memberSince) : null;
  if (joined) joined.setHours(0, 0, 0, 0);
  const claimed = new Set(last7Days.filter((t) => t.at).map((t) => dayKey(t.at)));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - offsetToMonday + i);
    const isToday = d.getTime() === today.getTime();
    const isFuture = d.getTime() > today.getTime();
    const done = claimed.has(dayKey(d));
    let state;
    if (done) state = 'done';
    else if (isToday) state = 'today';
    else if (isFuture) state = 'future';
    else if (joined && d.getTime() < joined.getTime()) state = 'before';
    else state = 'missed';
    return { key: dayKey(d), label: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(), state, isToday };
  });
}

export function streakHealth({ currentStreak, checkIn }) {
  const ready = checkIn?.state === 'ready';
  if (ready && currentStreak > 0) {
    return { level: 'risk', label: 'At Risk', text: 'Your check-in is waiting. Claim it to keep your streak safe.', score: 30 };
  }
  if (ready) {
    return { level: 'good', label: 'Good', text: 'Your first check-in is ready. Start building your streak.', score: 45 };
  }
  if (currentStreak >= 3) {
    return { level: 'excellent', label: 'Excellent', text: "You're maintaining great consistency.", score: 100 };
  }
  return { level: 'good', label: 'Good', text: 'Nice start. A few more days will make it a habit.', score: 65 };
}

// Milestones are measured against the best streak run the backend reports.
export function buildMilestones({ longestStreak = 0, currentStreak = 0 }) {
  const best = Math.max(longestStreak, currentStreak);
  let currentMarked = false;
  return MILESTONE_DAYS.map((days) => {
    if (best >= days) return { days, state: 'done', pct: 100 };
    if (!currentMarked) {
      currentMarked = true;
      return { days, state: 'current', pct: Math.round((best / days) * 100) };
    }
    return { days, state: 'upcoming', pct: 0 };
  });
}

export function buildAchievements({ streak, earnings }) {
  const s = streak || {};
  const gift = earnings?.INR?.count || 0;
  return [
    { label: 'First check-in', hint: 'Complete your first check-in', done: (s.totalCheckIns || 0) >= 1 },
    { label: '3-day spark', hint: 'Reach a 3-day streak', done: (s.longestStreak || 0) >= 3 },
    { label: '7-day warrior', hint: 'Reach a 7-day streak', done: (s.longestStreak || 0) >= 7 },
    { label: 'Cycle complete', hint: 'Finish a full reward cycle', done: (s.cyclesCompleted || 0) >= 1 },
    { label: 'Gift card earned', hint: 'Claim a gift card reward', done: gift >= 1 },
    { label: '10 check-ins', hint: 'Check in 10 times in total', done: (s.totalCheckIns || 0) >= 10 },
    { label: '30-day champion', hint: 'Reach a 30-day streak', done: (s.longestStreak || 0) >= 30 },
    { label: 'Consistency master', hint: 'Reach a 60-day streak', done: (s.longestStreak || 0) >= 60 },
  ];
}

export function relativeDay(iso) {
  const a = new Date(iso);
  const b = new Date();
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diff = Math.round((b - a) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
}

export const formatWhen = (iso) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

// Timeline entries come only from real wallet transactions.
export function buildActivity(recent = [], cycleLength = 7) {
  return recent.map((t) => {
    const isGift = t.currency === 'INR';
    const finishedCycle = t.day >= cycleLength;
    return {
      id: t.id,
      kind: finishedCycle ? 'cycle' : isGift ? 'gift' : 'checkin',
      title: finishedCycle ? `Day ${t.day} · cycle completed` : isGift ? `Reward unlocked · Day ${t.day}` : `Daily check-in completed · Day ${t.day}`,
      detail: `+${formatAmount(t.currency, t.amount)}`,
      when: relativeDay(t.at),
      at: t.at,
    };
  });
}
