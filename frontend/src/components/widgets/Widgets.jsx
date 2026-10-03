import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Trophy, CalendarCheck, Gift, Check, Lock, Sparkles, Loader2, Zap, Target, User, Mail,
} from 'lucide-react';
import styles from './Widgets.module.css';
import { ICONS, getRewardIcon } from '../../assets/icons.js';
import useCountUp from '../../hooks/useCountUp.js';
import useCountdown from '../../hooks/useCountdown.js';
import { useOverview } from '../../context/OverviewContext.jsx';
import {
  MOTIVATION, buildActivity, buildAchievements, buildMilestones, buildWeek, dayKey, formatAmount, formatWhen,
  getCheckInState, streakHealth, streakMessage,
} from '../../utils/streakInsights';

/* ---------- small primitives ---------- */
export function Bar({ pct, gold = false, label }) {
  const [w, setW] = useState(0);
  useEffect(() => { const id = requestAnimationFrame(() => setW(pct)); return () => cancelAnimationFrame(id); }, [pct]);
  return (
    <div className={styles.bar} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      <div className={`${styles.barFill} ${gold ? styles.barGold : ''}`} style={{ width: `${w}%` }} />
    </div>
  );
}

export function Card({ children, className = '', lift = true, glow = false, ...rest }) {
  return <section className={`vl-card ${lift ? 'vl-lift' : ''} ${glow ? 'vl-animborder' : ''} ${styles.card} ${className}`} {...rest}>{children}</section>;
}

export function CardHead({ title, note, icon }) {
  return (
    <div className={styles.cardHead}>
      <h2 className={styles.cardTitle}>{icon}{title}</h2>
      {note && <span className={styles.note}>{note}</span>}
    </div>
  );
}

// Loading / error gate used by every page that reads the shared overview.
export function PageGate({ children }) {
  const { dash, streakData, loading, error, reload } = useOverview();
  if (dash && streakData) return children({ dash, streakData });
  if (error && !loading) {
    return (
      <div className="vl-page">
        <div className={styles.errorBanner} role="alert">{error} <button className={styles.retry} onClick={() => reload()}>Try again</button></div>
      </div>
    );
  }
  return (
    <div className="vl-page" aria-busy="true" aria-label="Loading">
      <div className={styles.skelStack}>
        <div className={styles.skel} style={{ height: 70, width: '60%' }} />
        <div className={styles.skel} style={{ height: 260 }} />
        <div className={styles.skelRow}>{[1, 2, 3, 4].map((i) => <div key={i} className={styles.skel} style={{ height: 120 }} />)}</div>
      </div>
    </div>
  );
}

export function PageTitle({ title, sub, icon }) {
  return (
    <header className={styles.pageTitle}>
      <h1>{icon}{title}</h1>
      {sub && <p>{sub}</p>}
    </header>
  );
}

/* ---------- check-in button (loading / success / complete) ---------- */
function NextTimer({ target }) {
  const { now, reload } = useOverview();
  const { label } = useCountdown(target, now, () => reload({ silent: true }));
  return <span className={styles.timer}>{label}</span>;
}

export function CheckInButton({ label = 'CHECK IN TODAY', full = false }) {
  const { streakData, checkIn, claiming, celebration } = useOverview();
  const ci = getCheckInState(streakData);
  if (ci.state === 'ready') {
    return (
      <button className={`vl-btn ${full ? styles.full : ''}`} onClick={checkIn} disabled={claiming} aria-busy={claiming}>
        {claiming ? <><Loader2 size={18} className={styles.spin} /> CHECKING IN…</> : <><Flame size={18} /> {label}</>}
      </button>
    );
  }
  const saved = !!celebration;
  return (
    <button className={`vl-btn vl-ghost ${saved ? styles.saved : ''} ${full ? styles.full : ''}`} disabled aria-live="polite">
      <Check size={18} /> {saved ? 'STREAK SAVED!' : 'CHECK-IN COMPLETE'}
    </button>
  );
}

/* ---------- welcome ---------- */
export function Welcome({ name, streakData }) {
  const ci = getCheckInState(streakData);
  const chip = ci.state === 'ready'
    ? { cls: styles.chipWait, text: "Today's check-in is waiting" }
    : { cls: styles.chipDone, text: "Today's check-in complete" };
  return (
    <div className={styles.welcome}>
      <div>
        <h1 className={styles.welcomeTitle}>Welcome back, {name}! <span aria-hidden="true">👋</span></h1>
        <p className={styles.welcomeSub}>Ready to keep your streak alive?</p>
      </div>
      <span className={`${styles.chip} ${chip.cls}`}><span className={styles.chipDot} /> {chip.text}</span>
    </div>
  );
}

/* ---------- hero ---------- */
export function HeroStreak({ dash, streakData }) {
  const { streak } = dash;
  const ci = getCheckInState(streakData);
  const count = useCountUp(streak.currentStreak);
  const left = Math.max(streak.cycleLength - streak.currentStreak, 0);
  const pct = Math.min((streak.currentStreak / streak.cycleLength) * 100, 100);
  return (
    <section className={`${styles.hero} vl-animborder vl-card`} aria-label="Current streak">
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroBody}>
        <div className={styles.heroLabel}><Flame size={16} /> CURRENT STREAK</div>
        <div className={styles.heroNumRow}>
          <img className={styles.heroFlame} src={ICONS.flame} alt="" />
          <span className={styles.heroNum} aria-label={`${streak.currentStreak} days`}>{count}</span>
          <span className={styles.heroUnit}>{streak.currentStreak === 1 ? 'DAY' : 'DAYS'}</span>
        </div>
        <p className={styles.heroMsg}>{streakMessage(streak.currentStreak)}</p>
        <Bar pct={pct} gold label="Progress to ultimate reward" />
        <p className={styles.heroSub}>
          {left > 0 ? `${left} day${left === 1 ? '' : 's'} until your next reward` : 'Ultimate reward unlocked'}
          <span> · {Math.min(streak.currentStreak, streak.cycleLength)} / {streak.cycleLength}</span>
        </p>
        <div className={styles.heroAction}>
          <CheckInButton label="CHECK IN" />
          {ci.state === 'done' && ci.nextClaimAt && <span className={styles.nextIn}>Next check-in in <NextTimer target={ci.nextClaimAt} /></span>}
        </div>
      </div>
    </section>
  );
}

/* ---------- stats ---------- */
function Stat({ icon, label, value, sub, tone }) {
  return (
    <Card className={`${styles.stat} ${tone || ''}`}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statSub}>{sub}</div>
    </Card>
  );
}

export function StatsRow({ dash }) {
  const { streak, earnings } = dash;
  const rewards = (earnings.VES?.count || 0) + (earnings.INR?.count || 0);
  return (
    <div className={styles.statsRow}>
      <Stat icon={<Flame size={20} />} label="Current Streak" value={streak.currentStreak} sub="days active" tone={styles.toneFire} />
      <Stat icon={<Trophy size={20} />} label="Longest Streak" value={streak.longestStreak} sub="personal best" />
      <Stat icon={<CalendarCheck size={20} />} label="Total Check-ins" value={streak.totalCheckIns} sub="all time" />
      <Stat icon={<Gift size={20} />} label="Rewards Earned" value={rewards} sub="claimed so far" />
    </div>
  );
}

/* ---------- daily check-in ---------- */
export function CheckInCard({ streakData }) {
  const { celebration, claimError } = useOverview();
  const ci = getCheckInState(streakData);
  const saved = !!celebration;
  return (
    <Card className={`${styles.checkin} ${ci.state !== 'ready' ? styles.checkinDone : ''}`} glow={ci.state === 'ready'}>
      <div className={styles.checkinFire} aria-hidden="true"><img src={ICONS.flame} alt="" /></div>
      {ci.state === 'ready' ? (
        <>
          <h2 className={styles.checkinTitle}>Keep the Fire Burning 🔥</h2>
          <p className={styles.checkinText}>Complete today's check-in to protect your streak.</p>
        </>
      ) : (
        <div key={saved ? 'saved' : 'done'} className={saved ? styles.pop : ''}>
          <h2 className={styles.checkinTitle}>{saved ? '🔥 STREAK SAVED!' : '🔥 CHECK-IN COMPLETE'}</h2>
          <p className={styles.checkinText}>{saved ? '+1 Day Added' : 'Your streak is safe for today.'}</p>
          {saved && <p className={styles.checkinNote}>Your streak is safe for today.</p>}
        </div>
      )}
      {claimError && <div className={styles.inlineError} role="alert">{claimError}</div>}
      <CheckInButton full />
      {ci.state === 'done' && ci.nextClaimAt && <div className={styles.nextIn}>Next check-in in <NextTimer target={ci.nextClaimAt} /></div>}
    </Card>
  );
}

/* ---------- weekly tracker ---------- */
export function WeekTracker({ dash }) {
  const week = useMemo(() => buildWeek(dash.last7Days, dash.user?.memberSince), [dash]);
  const done = week.filter((d) => d.state === 'done').length;
  return (
    <Card className={styles.week}>
      <CardHead title="This week" note={`${done} of 7 days`} icon={<Flame size={16} />} />
      <ol className={styles.weekRow}>
        {week.map((d) => (
          <li key={d.key} className={`${styles.day} ${styles[`day_${d.state}`]}`} aria-label={`${d.label}: ${d.state === 'done' ? 'checked in' : d.state}`}>
            <span className={styles.dayLabel}>{d.label}</span>
            <span className={styles.dayOrb}>
              {d.state === 'done' ? <img src={ICONS.flame} alt="" /> : d.state === 'today' ? <Flame size={16} /> : null}
            </span>
          </li>
        ))}
      </ol>
      <p className={styles.weekNote}>Days light up when a check-in is recorded on the server.</p>
    </Card>
  );
}

/* ---------- next reward ---------- */
export function NextReward({ dash, streakData }) {
  const { streak } = dash;
  const ultimate = streakData.rewards.find((r) => r.isUltimate);
  const left = Math.max(streak.cycleLength - streak.currentStreak, 0);
  const pct = Math.min((streak.currentStreak / streak.cycleLength) * 100, 100);
  const name = ultimate ? (ultimate.reward.subtitle || ultimate.reward.title) : 'Ultimate Reward';
  return (
    <Card className={styles.next}>
      <CardHead title="Next reward 🔥" icon={null} />
      <div className={styles.nextRow}>
        <img className={styles.nextArt} src={ultimate ? getRewardIcon(ultimate) : ICONS.day7} alt="" />
        <div>
          <div className={styles.nextName}>{name}</div>
          {ultimate && <div className={styles.nextAmt}>{ultimate.reward.currency === 'INR' ? `₹${ultimate.reward.amount}` : `+${ultimate.reward.amount} ${ultimate.reward.currency}`} · Day {ultimate.day}</div>}
        </div>
      </div>
      <Bar pct={pct} gold label="Progress to next reward" />
      <div className={styles.nextFoot}>
        <strong>{Math.min(streak.currentStreak, streak.cycleLength)} / {streak.cycleLength} Days</strong>
        <span>{left > 0 ? `${left} more day${left === 1 ? '' : 's'} to unlock` : 'Unlocked'}</span>
      </div>
    </Card>
  );
}

/* ---------- streak health ---------- */
export function StreakHealthCard({ dash, streakData }) {
  const h = streakHealth({ currentStreak: dash.streak.currentStreak, checkIn: getCheckInState(streakData) });
  return (
    <Card className={`${styles.health} ${styles[`h_${h.level}`]}`}>
      <CardHead title="Streak health" />
      <div className={styles.healthRow}>
        <span className={styles.healthIcon}><Flame size={22} /></span>
        <div>
          <div className={styles.healthLabel}>{h.label}</div>
          <div className={styles.healthText}>{h.text}</div>
        </div>
      </div>
      <Bar pct={h.score} label="Streak health" />
    </Card>
  );
}

/* ---------- motivation ---------- */
export function MotivationCard() {
  const [i, setI] = useState(() => new Date().getDate() % MOTIVATION.length);
  useEffect(() => { const id = setInterval(() => setI((n) => (n + 1) % MOTIVATION.length), 10000); return () => clearInterval(id); }, []);
  return (
    <Card className={styles.motivation}>
      <CardHead title="Today's motivation" />
      <div className={styles.motiFlame}><Flame size={22} /></div>
      <p key={i} className={styles.quote} aria-live="off">“{MOTIVATION[i]}”</p>
    </Card>
  );
}

/* ---------- milestones ---------- */
export function MilestonesCard({ dash, full = false }) {
  const { streak } = dash;
  const items = buildMilestones(streak);
  const best = Math.max(streak.longestStreak, streak.currentStreak);
  return (
    <Card className={styles.miles}>
      <CardHead title="Streak milestones" note={`Best run: ${best} day${best === 1 ? '' : 's'}`} icon={<Target size={16} />} />
      <ul className={`${styles.milesGrid} ${full ? styles.milesFull : ''}`}>
        {items.map((m) => (
          <li key={m.days} className={`${styles.mile} ${styles[`m_${m.state}`]}`}>
            <span className={styles.mileIcon}>{m.state === 'done' ? <img src={ICONS.flame} alt="" /> : m.state === 'current' ? <Flame size={18} /> : <Lock size={15} />}</span>
            <span className={styles.mileDays}>{m.days} Days</span>
            <span className={styles.mileState}>{m.state === 'done' ? 'Completed' : m.state === 'current' ? `${m.pct}% there` : 'Upcoming'}</span>
            {m.state === 'current' && <Bar pct={m.pct} gold label={`${m.days}-day milestone`} />}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- activity ---------- */
export function ActivityCard({ dash, limit = 5, showAll = false, title = "Recent activity" }) {
  const navigate = useNavigate();
  const items = buildActivity(dash.recent, dash.streak.cycleLength);
  const shown = items.slice(0, limit);
  const iconFor = (k) => (k === 'gift' ? <Gift size={16} /> : k === 'cycle' ? <Trophy size={16} /> : <Flame size={16} />);
  return (
    <Card className={styles.activity}>
      <CardHead title={title} icon={null} />
      {shown.length === 0 ? (
        <div className={styles.empty}>No activity yet. Your first check-in will show up here.</div>
      ) : (
        <ol className={styles.timeline}>
          {shown.map((a) => (
            <li key={a.id} className={styles.tItem}>
              <span className={`${styles.tDot} ${styles[`t_${a.kind}`]}`}>{iconFor(a.kind)}</span>
              <div className={styles.tMain}><strong>{a.title}</strong><span title={formatWhen(a.at)}>{a.when} · {a.detail}</span></div>
            </li>
          ))}
        </ol>
      )}
      {showAll && items.length > 0 && <button className={styles.linkBtn} onClick={() => navigate('/activity')}>View all activity</button>}
    </Card>
  );
}

/* ---------- profile ---------- */
export function ProfileSummary({ dash, name }) {
  const { streak, earnings } = dash;
  const rewards = (earnings.VES?.count || 0) + (earnings.INR?.count || 0);
  const since = new Date(dash.user.memberSince).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  return (
    <Card className={styles.profile}>
      <div className={styles.pTop}>
        <span className={styles.pAvatar} aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
        <div className={styles.pWho}>
          <div className={styles.pName}><User size={14} /> {name}</div>
          <div className={styles.pMail}><Mail size={13} /> {dash.user.email}</div>
          <div className={styles.pSince}>Member since {since}</div>
        </div>
      </div>
      <dl className={styles.pStats}>
        <div><dt>Current Streak</dt><dd>{streak.currentStreak}</dd></div>
        <div><dt>Longest Streak</dt><dd>{streak.longestStreak}</dd></div>
        <div><dt>Total Check-ins</dt><dd>{streak.totalCheckIns}</dd></div>
        <div><dt>Rewards</dt><dd>{rewards}</dd></div>
      </dl>
    </Card>
  );
}

/* ---------- wallet + earnings (existing dashboard data, kept) ---------- */
export function WalletCards({ dash }) {
  const { wallet, earnings } = dash;
  const week = buildEarnings(dash.last7Days);
  const weekVes = week.reduce((s, d) => s + d.ves, 0);
  const weekInr = week.reduce((s, d) => s + d.inr, 0);
  return (
    <div className={styles.wallets}>
      <Card className={styles.wallet}>
        <img className={styles.walletArt} src={ICONS.coin} alt="" />
        <div><div className={styles.walletLabel}>VES balance</div><div className={styles.walletValue}>{wallet.VES}</div>
          <div className={styles.walletSub}>{earnings.VES.count} claimed · {weekVes} earned this week</div></div>
      </Card>
      <Card className={`${styles.wallet} ${styles.walletGold}`}>
        <img className={styles.walletArt} src={ICONS.day5} alt="" />
        <div><div className={styles.walletLabel}>Amazon gift card value</div><div className={styles.walletValue}>₹{wallet.INR}</div>
          <div className={styles.walletSub}>{earnings.INR.count} gift cards · ₹{weekInr} earned this week</div></div>
      </Card>
    </div>
  );
}

function buildEarnings(last7Days = []) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: dayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'short' }), ves: 0, inr: 0, today: i === 0 });
  }
  last7Days.forEach((t) => {
    const slot = days.find((d) => d.key === dayKey(t.at));
    if (!slot) return;
    if (t.currency === 'INR') slot.inr += t.amount; else slot.ves += t.amount;
  });
  return days;
}

export function EarningsChart({ dash }) {
  const week = useMemo(() => buildEarnings(dash.last7Days), [dash]);
  const max = Math.max(...week.map((d) => d.ves), 1);
  return (
    <Card className={styles.earn}>
      <CardHead title="VES earned, last 7 days" icon={<Zap size={16} />} />
      <div className={styles.bars} role="img" aria-label={`VES earned per day: ${week.map((d) => `${d.label} ${d.ves}`).join(', ')}`}>
        {week.map((d) => (
          <div key={d.key} className={styles.barCol}>
            <div className={styles.barValue}>{d.ves || ''}</div>
            <div className={styles.barTrack}><div className={`${styles.colBar} ${d.today ? styles.colToday : ''}`} style={{ height: d.ves ? `${Math.max((d.ves / max) * 100, 6)}%` : '3px', opacity: d.ves ? 1 : 0.35 }} /></div>
            <div className={styles.barLabel}>{d.label}</div>
            <div className={styles.barInr}>{d.inr ? `₹${d.inr}` : ''}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- rewards ---------- */
export function RewardTile({ card, cycleLength, currentStreak }) {
  const { checkIn, claiming } = useOverview();
  const { status, reward, day, isUltimate } = card;
  const unlocked = status === 'CLAIMED';
  const ready = status === 'AVAILABLE';
  const remaining = Math.max(day - currentStreak, 0);
  const amount = reward.currency === 'INR' ? `₹${reward.amount}` : `+${reward.amount} ${reward.currency}`;
  return (
    <article className={`vl-card vl-lift ${styles.reward} ${unlocked ? styles.rUnlocked : ready ? styles.rReady : styles.rLocked}`}>
      <span className={styles.rBadge}>{isUltimate ? 'Ultimate' : `Day ${day}`}</span>
      <div className={styles.rArt}><img src={getRewardIcon(card)} alt="" loading="lazy" />{unlocked && <span className={styles.rTick}><Check size={12} strokeWidth={3} /></span>}</div>
      <div className={styles.rTitle}>{reward.title}</div>
      <div className={styles.rAmt}>{amount}</div>
      {unlocked && <div className={styles.rState}><Gift size={14} /> Unlocked</div>}
      {ready && <button className="vl-btn" style={{ minHeight: 40, padding: '8px 16px', fontSize: '0.82rem' }} onClick={checkIn} disabled={claiming}>{claiming ? 'CLAIMING…' : 'CLAIM NOW'}</button>}
      {!unlocked && !ready && (
        <div className={styles.rLock}>
          <Lock size={14} /> {status === 'TODAY' ? 'Available after countdown' : `${remaining} day${remaining === 1 ? '' : 's'} remaining`}
          {status !== 'MISSED' && <Bar pct={Math.min((currentStreak / day) * 100, 100)} label={`Day ${day} reward progress`} />}
        </div>
      )}
      {status === 'MISSED' && <div className={styles.rLock}>Missed</div>}
    </article>
  );
}

/* ---------- achievements ---------- */
export function AchievementsCard({ dash }) {
  const list = buildAchievements(dash);
  const done = list.filter((a) => a.done).length;
  return (
    <Card className={styles.ach}>
      <CardHead title="Achievements" note={`${done} / ${list.length} unlocked`} icon={<Sparkles size={16} />} />
      <ul className={styles.achGrid}>
        {list.map((a) => (
          <li key={a.label} className={`${styles.achItem} ${a.done ? styles.achDone : ''}`}>
            <span className={styles.achIcon}>{a.done ? <Check size={16} /> : <Lock size={15} />}</span>
            <span><strong>{a.label}</strong><em>{a.done ? 'Unlocked' : a.hint}</em></span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
