import React from 'react';
import { Gift, Wallet, Target } from 'lucide-react';
import styles from './Dashboard.module.css';
import { useAuth } from '../../context/AuthContext.jsx';
import { useOverview } from '../../context/OverviewContext.jsx';
import { PageGate, CheckInButton, ActivityCard } from '../../components/widgets/Widgets.jsx';
import Welcome from '../../components/journey/Welcome.jsx';
import wel from '../../components/journey/Welcome.module.css';
import FinalVault from '../../components/journey/FinalVault.jsx';
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
    <section className={styles.today} aria-label="Today's pickup">
      {card ? (
        <>
          <img className={styles.todayArt} src={getRewardIcon(card)} alt="" width="120" height="120" decoding="async" />
          <div className={styles.todayBody}>
            <p className={styles.kicker}>{ready ? `Stop ${card.day} is waiting` : `Stop ${card.day} opens in`}</p>
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
        <div><span className={styles.wLabel}>Backpack · VES</span><strong className={styles.wValue}>{ves}</strong></div>
      </div>
      <div className={styles.wItem}>
        <img src={ICONS.day5} alt="" width="40" height="40" decoding="async" />
        <div><span className={styles.wLabel}>Backpack · gift cards</span><strong className={styles.wValue}>₹{dash.wallet.INR}</strong></div>
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
        <div><dt>Stops reached</dt><dd>{s.currentStreak} of {streakData.streak.totalRewards}</dd></div>
        <div><dt>Longest walk</dt><dd>{s.longestStreak} days</dd></div>
        <div><dt>Next stop</dt><dd>{next ? `Stop ${next.day} · ${formatAmount(next.reward.currency, next.reward.amount)}` : 'Cycle complete'}</dd></div>
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
            <header className={wel.row}>
              <Welcome name={name} day={dash.streak.currentDay} total={streakData.streak.totalRewards} chain={n} banked={dash.wallet.VES} message={streakMessage(n)}
                next={streakData.nextReward ? formatAmount(streakData.nextReward.currency, streakData.nextReward.amount) : null} />
              <TodayReward streakData={streakData} />
            </header>

            <section aria-labelledby="road-h">
              <h2 id="road-h" className={styles.trailTitle}>Road to the Vault</h2>
              <div className={styles.journey}>
                <StreakJourney streakData={streakData} celebration={celebration} claiming={claiming} />
              </div>
            </section>
            <div className={styles.pair}>
              <WalletStrip dash={dash} />
              <Progress dash={dash} streakData={streakData} />
            </div>

            <FinalVault streakData={streakData} />
            <ActivityCard dash={dash} limit={4} showAll />
          </div>
        );
      }}
    </PageGate>
  );
}
