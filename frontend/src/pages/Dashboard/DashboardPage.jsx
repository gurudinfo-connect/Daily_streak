import React from 'react';
import { Gift, Wallet, Target } from 'lucide-react';
import styles from './Dashboard.module.css';
import { useAuth } from '../../context/AuthContext.jsx';
import { useOverview } from '../../context/OverviewContext.jsx';
import { PageGate, CheckInButton, ActivityCard } from '../../components/widgets/Widgets.jsx';
import StreakRing from '../../components/journey/StreakRing.jsx';
import StreakJourney from '../../components/journey/StreakJourney.jsx';
import useCountdown from '../../hooks/useCountdown.js';
import useCountUp from '../../hooks/useCountUp.js';
import { ICONS, getRewardIcon } from '../../assets/icons.js';
import { displayNameOf, formatAmount, getCheckInState, streakMessage } from '../../utils/streakInsights';

function Countdown({ target }) {
  const { now, reload } = useOverview();
  // At zero we re-ask the backend; the button only turns into Claim if the server says so.
  const { label } = useCountdown(target, now, () => reload({ silent: true }));
  return <span className={styles.timer}>{label}</span>;
}

function TodayReward({ streakData }) {
  const { claimError } = useOverview();
  const ci = getCheckInState(streakData);
  const card = ci.card;
  const ready = ci.state === 'ready';
  return (
    <section className={styles.today} aria-label="Today's reward">
      {card ? (
        <>
          <img className={styles.todayArt} src={getRewardIcon(card)} alt="" width="120" height="120" decoding="async" />
          <div className={styles.todayBody}>
            <p className={styles.kicker}>{ready ? `Day ${card.day} is ready` : `Day ${card.day} unlocks in`}</p>
            <h2 className={styles.todayTitle}>{card.reward.title}</h2>
            <p className={styles.todayAmt}>{formatAmount(card.reward.currency, card.reward.amount)}</p>
            {!ready && ci.nextClaimAt && <p className={styles.todayTimer}><Countdown target={ci.nextClaimAt} /></p>}
          </div>
          {claimError && <div className={styles.err} role="alert">{claimError}</div>}
          <CheckInButton label="Claim reward" full />
        </>
      ) : (
        <p className={styles.kicker}>Nothing to claim right now.</p>
      )}
    </section>
  );
}

function WalletStrip({ dash }) {
  const ves = useCountUp(dash.wallet.VES);
  return (
    <section className={styles.wallet} aria-label="Wallet">
      <div className={styles.wItem}>
        <img src={ICONS.coin} alt="" width="40" height="40" decoding="async" />
        <div><span className={styles.wLabel}>VES balance</span><strong className={styles.wValue}>{ves}</strong></div>
      </div>
      <div className={styles.wItem}>
        <img src={ICONS.day5} alt="" width="40" height="40" decoding="async" />
        <div><span className={styles.wLabel}>Gift card value</span><strong className={styles.wValue}>₹{dash.wallet.INR}</strong></div>
      </div>
    </section>
  );
}

function Progress({ dash, streakData }) {
  const s = dash.streak;
  const next = streakData.rewards.find((r) => r.status === 'AVAILABLE' || r.status === 'TODAY');
  const ultimate = streakData.rewards.find((r) => r.isUltimate);
  const left = ultimate ? Math.max(0, ultimate.day - s.currentStreak) : null;
  return (
    <section className={styles.progress} aria-label="Progress">
      <dl>
        <div><dt>Collected this cycle</dt><dd>{s.currentStreak} of {streakData.streak.totalRewards}</dd></div>
        <div><dt>Best streak</dt><dd>{s.longestStreak} days</dd></div>
        <div><dt>Next up</dt><dd>{next ? `Day ${next.day} · ${formatAmount(next.reward.currency, next.reward.amount)}` : 'Cycle complete'}</dd></div>
        {left !== null && <div><dt>{ultimate.reward.title}</dt><dd>{left === 0 ? 'Unlocked' : `${left} day${left === 1 ? '' : 's'} away`}</dd></div>}
      </dl>
    </section>
  );
}

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  const { celebration, claiming } = useOverview();
  return (
    <PageGate>
      {({ dash, streakData }) => {
        const name = displayNameOf(dash.user, authUser);
        const n = dash.streak.currentStreak;
        return (
          <div className={styles.page}>
            <header className={styles.hero}>
              <div className={styles.heroLeft}>
                <p className={styles.mono}>Your streak</p>
                <h1 className={styles.streakLine}><span className={styles.num}>{String(dash.streak.currentDay).padStart(2, '0')}</span><span className={styles.of}>/{String(streakData.streak.totalRewards).padStart(2, '0')}</span></h1>
                <p className={styles.msg}>{streakMessage(n)}</p>
                <dl className={styles.facts}>
                  <div><dt>Chain</dt><dd>{n} days</dd></div>
                  <div><dt>Banked</dt><dd>{dash.wallet.VES} VES</dd></div>
                  {streakData.nextReward && <div><dt>Next unlock</dt><dd className={styles.gold}>{formatAmount(streakData.nextReward.currency, streakData.nextReward.amount)}</dd></div>}
                </dl>
              </div>
              <div className={styles.heroRing}>
                <StreakRing total={streakData.streak.totalRewards} done={streakData.streak.checkedIn} value={n} sub={`Day ${String(streakData.streak.currentDay).padStart(2, '0')} / ${String(streakData.streak.totalRewards).padStart(2, '0')}`} />
                <img className={`${styles.floatA}`} src={ICONS.stay} alt="" width="84" height="82" decoding="async" />
                <img className={`${styles.floatB}`} src={ICONS.coin} alt="" width="80" height="64" decoding="async" />
              </div>
              <TodayReward streakData={streakData} />
            </header>

            <div className={styles.grid}>
              <h2 className={styles.trailTitle}>The trail</h2>
              <section className={styles.journey} aria-label="The trail">
                <StreakJourney streakData={streakData} celebration={celebration} claiming={claiming} />
              </section>
              <aside className={styles.side}>
                <WalletStrip dash={dash} />
                <Progress dash={dash} streakData={streakData} />
              </aside>
            </div>

            <ActivityCard dash={dash} limit={4} showAll />
          </div>
        );
      }}
    </PageGate>
  );
}
