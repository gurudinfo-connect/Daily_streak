import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Flame, Trophy, CalendarCheck, HeartCrack, Check } from 'lucide-react';
import styles from './Dashboard.module.css';
import { ICONS } from '../../assets/icons.js';
import * as dashboardApi from '../../services/dashboardApi.js';
import LogoutConfirm from '../../components/LogoutConfirm.jsx';
import useLogout from '../../components/useLogout.js';

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
  const { confirming, askLogout, cancelLogout, confirmLogout } = useLogout();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await dashboardApi.getDashboard());
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load your dashboard. Please try again.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const week = useMemo(() => buildWeek(data?.last7Days || []), [data]);

  const header = (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.iconBtn} onClick={() => navigate('/daily-streak')} aria-label="Back to Daily Streak" title="Back to Daily Streak">
          <ChevronLeft size={20} />
        </button>
        <h1 className={styles.title}>Dashboard</h1>
      </div>
      <button className={styles.logoutBtn} onClick={askLogout}>
        <LogOut size={16} /> Log out
      </button>
    </div>
  );

  if (!data) {
    return (
      <div className={styles.page}>
        {header}
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
        {confirming && <LogoutConfirm onConfirm={confirmLogout} onCancel={cancelLogout} />}
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

  return (
    <div className={styles.page}>
      {header}

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

      {confirming && <LogoutConfirm onConfirm={confirmLogout} onCancel={cancelLogout} />}
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
