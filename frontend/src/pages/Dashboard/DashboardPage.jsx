import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, CalendarCheck, HeartCrack, Check, Lock, Sparkles, Zap, Gift } from 'lucide-react';
import styles from './Dashboard.module.css';
import { ICONS } from '../../assets/icons.js';
import * as dashboardApi from '../../services/dashboardApi.js';
import friendlyError from '../../utils/friendlyError.js';
import useCountUp from '../../hooks/useCountUp.js';

const QUOTES = ['Consistency beats intensity.', 'One day at a time.', "Don't break the chain.", 'Your future self will thank you.'];

const streakMessage = (n) =>
  n <= 0 ? 'Check in today to start your streak.' : n <= 2 ? 'Great start! Keep going.' : n <= 6 ? "You're building momentum!" : n <= 13 ? 'One week strong! 🔥' : n <= 29 ? "You're becoming unstoppable!" : 'Legendary consistency! 🏆';

const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`;
};

const formatAmount = (currency, amount) => (currency === 'INR' ? `₹${amount}` : `${amount} VES`);

const formatWhen = (iso) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

function buildWeek(last7Days) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: dayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'short' }), ves: 0, inr: 0, today: i === 0 });
  }
  last7Days.forEach((t) => {
    const slot = days.find((d) => d.key === dayKey(t.at));
    if (!slot) return;
    if (t.currency === 'INR') slot.inr += t.amount;
    else slot.ves += t.amount;
  });
  return days;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await dashboardApi.getDashboard());
    } catch (err) {
      setError(friendlyError(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 9000);
    return () => clearInterval(id);
  }, []);

  const streakCount = useCountUp(data?.streak.currentStreak || 0);

  const week = useMemo(() => buildWeek(data?.last7Days || []), [data]);

  if (!data) {
    return (
      <div className={styles.page}>
        {error ? (
          <div className={styles.errorBanner}>
            {error} <button className={styles.retry} onClick={load}>Try again</button>
          </div>
        ) : (
          <div className={styles.skeletonStack} aria-busy="true" aria-label="Loading dashboard">
            <div className={styles.skeleton} style={{ height: 96 }} />
            <div className={styles.skeleton} style={{ height: 150 }} />
            <div className={styles.skeleton} style={{ height: 90 }} />
            <div className={styles.skeleton} style={{ height: 220 }} />
          </div>
        )}
      </div>
    );
  }

  const { user, wallet, earnings, streak, recent } = data;
  const displayName = user.name || user.email.split('@')[0];
  const memberSince = new Date(user.memberSince).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const maxVes = Math.max(...week.map((d) => d.ves), 1);
  const weekVes = week.reduce((s, d) => s + d.ves, 0);
  const weekInr = week.reduce((s, d) => s + d.inr, 0);
  const daysLeft = Math.max(streak.cycleLength - streak.currentStreak, 0);
  const progressPct = Math.min(Math.round((streak.currentStreak / streak.cycleLength) * 100), 100);
  const achievements = [
    { label: 'First check-in', done: streak.totalCheckIns >= 1 },
    { label: '7-day warrior', done: streak.longestStreak >= 7 },
    { label: '30-day champion', done: streak.longestStreak >= 30 },
    { label: 'Consistency master (60)', done: streak.longestStreak >= 60 },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}><Sparkles size={14} /> Daily Streak &amp; Rewards</span>
          <h1 className={styles.heroTitle}>Keep Your Streak Alive 🔥</h1>
          <p className={styles.heroSub}>Build consistency. Earn rewards. Level up every day.</p>
          <p className={styles.message}>{streakMessage(streak.currentStreak)}</p>
          <p className={styles.quote} key={quoteIdx} aria-live="off">“{QUOTES[quoteIdx]}”</p>
          <button className={`${styles.cta} ${styles.ctaInline}`} onClick={() => navigate('/daily-streak')}>Check in today</button>
        </div>
        <div className={styles.orb} aria-label={`${streak.currentStreak} day streak`}>
          <img className={styles.orbFlame} src={ICONS.flame} alt="" />
          <div className={styles.orbNum}>{streakCount}</div>
          <div className={styles.orbLabel}>DAY STREAK</div>
        </div>
      </section>

      <section className={styles.profile}>
        <div className={styles.avatar} aria-hidden="true">{displayName.charAt(0).toUpperCase()}</div>
        <div className={styles.profileText}>
          <div className={styles.profileName}>{displayName}</div>
          <div className={styles.profileMeta}>{user.email} · Member since {memberSince}</div>
        </div>
        <div className={styles.streakChip}>
          <img className={styles.flame} src={ICONS.flame} alt="" />
          {streak.currentStreak} day streak
        </div>
      </section>

      <section className={styles.earnGrid} aria-label="Earnings">
        <div className={styles.earnCard}>
          <img className={styles.earnArt} src={ICONS.coin} alt="" />
          <div>
            <div className={styles.label}>VES balance</div>
            <div className={styles.bigValue}>{wallet.VES}</div>
            <div className={styles.sub}>
              {earnings.VES.count} claimed · {weekVes} earned this week
            </div>
          </div>
        </div>
        <div className={`${styles.earnCard} ${styles.earnGold}`}>
          <img className={styles.earnArt} src={ICONS.day5} alt="" />
          <div>
            <div className={styles.label}>Amazon gift card value</div>
            <div className={styles.bigValue}>₹{wallet.INR}</div>
            <div className={styles.sub}>
              {earnings.INR.count} gift cards · ₹{weekInr} earned this week
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsRow} aria-label="Streak stats">
        <Stat icon={<Flame size={16} />} label="Current streak" value={streak.currentStreak} />
        <Stat icon={<Trophy size={16} />} label="Longest streak" value={streak.longestStreak} />
        <Stat icon={<CalendarCheck size={16} />} label="Total check-ins" value={streak.totalCheckIns} />
        <Stat icon={<Check size={16} />} label="Cycles completed" value={streak.cyclesCompleted} />
        <Stat icon={<HeartCrack size={16} />} label="Streaks lost" value={streak.streaksLost} />
      </section>

      <div className={styles.threeCol}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Next reward</h2>
            <span className={styles.panelNote}>{Math.min(streak.currentStreak, streak.cycleLength)} / {streak.cycleLength} days</span>
          </div>
          <div className={styles.nextName}><Gift size={18} /> Ultimate Reward</div>
          <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
          <div className={styles.sub}>{daysLeft > 0 ? `${daysLeft} more day${daysLeft === 1 ? '' : 's'} to unlock!` : 'Unlocked — claim it on Daily Streak!'}</div>
        </section>
        <section className={`${styles.panel} ${styles.dashed}`}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}><Zap size={15} /> Level &amp; XP</h2>
            <span className={styles.badge}>Coming soon</span>
          </div>
          <div className={styles.sub}>XP and levels aren't tracked by the backend yet. This card is ready to connect once they are.</div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHead}><h2 className={styles.panelTitle}>Achievements</h2></div>
          <ul className={styles.achList}>
            {achievements.map((a) => (
              <li key={a.label} className={`${styles.ach} ${a.done ? styles.achDone : ''}`}>
                {a.done ? <Check size={14} /> : <Lock size={14} />} {a.label}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className={styles.twoCol}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>VES earned, last 7 days</h2>
          </div>
          <div className={styles.bars} role="img" aria-label={`VES earned per day: ${week.map((d) => `${d.label} ${d.ves}`).join(', ')}`}>
            {week.map((d) => (
              <div key={d.key} className={styles.barCol}>
                <div className={styles.barValue}>{d.ves || ''}</div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.bar} ${d.today ? styles.barToday : ''}`}
                    style={{ height: d.ves ? `${Math.max((d.ves / maxVes) * 100, 6)}%` : '3px', opacity: d.ves ? 1 : 0.35 }}
                  />
                </div>
                <div className={styles.barLabel}>{d.label}</div>
                <div className={styles.barInr}>{d.inr ? `₹${d.inr}` : ''}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>This cycle</h2>
            <span className={styles.panelNote}>
              {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} to Ultimate Reward` : 'Cycle complete'}
            </span>
          </div>
          <div className={styles.dots}>
            {Array.from({ length: streak.cycleLength }, (_, i) => {
              const day = i + 1;
              const done = day <= streak.currentStreak;
              const next = day === streak.currentStreak + 1;
              return (
                <div key={day} className={styles.dotCol}>
                  <div className={`${styles.dot} ${done ? styles.dotDone : ''} ${next ? styles.dotNext : ''}`}>
                    {done ? <Check size={14} /> : day}
                  </div>
                  <div className={styles.dotLabel}>Day {day}</div>
                </div>
              );
            })}
          </div>
          <button className={styles.cta} onClick={() => navigate('/daily-streak')}>Go to Daily Streak</button>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Recent earnings</h2>
        </div>
        {recent.length === 0 ? (
          <div className={styles.empty}>
            <div>No rewards yet. Claim your Day 1 reward to start earning.</div>
            <button className={styles.cta} onClick={() => navigate('/daily-streak')}>Claim Day 1 reward</button>
          </div>
        ) : (
          <ul className={styles.txList}>
            {recent.map((t) => (
              <li key={t.id} className={styles.tx}>
                <img className={styles.txIcon} src={t.currency === 'INR' ? ICONS.day5 : ICONS.coin} alt="" />
                <div className={styles.txMain}>
                  <div className={styles.txTitle}>Day {t.day} reward</div>
                  <div className={styles.txWhen}>{formatWhen(t.at)}</div>
                </div>
                <div className={styles.txRight}>
                  <div className={styles.txAmount}>+{formatAmount(t.currency, t.amount)}</div>
                  <div className={styles.txBal}>Balance {formatAmount(t.currency, t.balanceAfter)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className={styles.stat}>
      <div className={styles.label}>{icon} {label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}
