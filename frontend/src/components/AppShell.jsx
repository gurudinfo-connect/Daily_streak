import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Flame, Trophy, Bell, ChevronDown, LogOut, Gift, Menu, X,
  Award, Target, Activity, User, Settings, Check,
} from 'lucide-react';
import styles from './AppShell.module.css';
import AnimatedBackground from './AnimatedBackground.jsx';
import BrandLogo from './BrandLogo.jsx';
import LogoutConfirm from './LogoutConfirm.jsx';
import useLogout from './useLogout.js';
import { useAuth } from '../context/AuthContext.jsx';
import { OverviewProvider, useOverview } from '../context/OverviewContext.jsx';
import { buildMilestones, displayNameOf, getCheckInState } from '../utils/streakInsights';
import Celebration from './widgets/Celebration.jsx';

const NAV = [
  { title: 'Main', items: [
    { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/daily-streak', label: 'My Streak', Icon: Flame },
    { to: '/rewards', label: 'Rewards', Icon: Gift },
    { to: '/achievements', label: 'Achievements', Icon: Award },
  ] },
  { title: 'Progress', items: [
    { to: '/milestones', label: 'Milestones', Icon: Target },
    { to: '/activity', label: 'Activity', Icon: Activity },
    { to: '/leaderboard', label: 'Leaderboard', Icon: Trophy },
  ] },
  { title: 'Account', items: [
    { to: '/profile', label: 'Profile', Icon: User },
    { to: '/settings', label: 'Settings', Icon: Settings },
  ] },
];

const TOP_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/rewards', label: 'Rewards' },
  { to: '/profile', label: 'Profile' },
];

const BOTTOM = [
  { to: '/dashboard', label: 'Home', Icon: LayoutDashboard },
  { to: '/daily-streak', label: 'Streak', Icon: Flame },
  { to: '/rewards', label: 'Rewards', Icon: Gift },
  { to: '/leaderboard', label: 'Ranks', Icon: Trophy },
];

function Shell() {
  const { user } = useAuth();
  const { dash, streakData } = useOverview();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { confirming, askLogout, cancelLogout, confirmLogout } = useLogout();
  const [open, setOpen] = useState(null); // null | 'bell' | 'user'
  const [drawer, setDrawer] = useState(false);
  const menuRef = useRef(null);
  const name = displayNameOf(dash?.user, user);
  const email = dash?.user?.email || user?.email || '';

  useEffect(() => { setOpen(null); setDrawer(false); }, [pathname]);
  useEffect(() => {
    const out = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(null);
    const esc = (e) => { if (e.key === 'Escape') { setOpen(null); setDrawer(false); } };
    document.addEventListener('mousedown', out);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc); };
  }, []);

  // Status items are derived from the user's real data. The backend has no
  // notification store, so nothing here is persisted or invented.
  const notes = useMemo(() => {
    if (!dash || !streakData) return [];
    const list = [];
    const s = dash.streak;
    const checkIn = getCheckInState(streakData);
    if (checkIn.state === 'ready') list.push({ Icon: Flame, tone: 'gold', text: 'Your check-in is ready', sub: 'Claim it to protect your streak.' });
    else if (s.currentStreak > 0) list.push({ Icon: Flame, tone: 'gold', text: 'Your streak is active', sub: `${s.currentStreak} day${s.currentStreak === 1 ? '' : 's'} and counting.` });
    if (dash.recent[0]) list.push({ Icon: Gift, tone: 'violet', text: 'Latest reward unlocked', sub: `Day ${dash.recent[0].day} reward claimed.` });
    const reached = buildMilestones(s).filter((m) => m.state === 'done').pop();
    if (reached) list.push({ Icon: Trophy, tone: 'violet', text: `${reached.days}-day milestone achieved`, sub: 'Nicely done.' });
    return list;
  }, [dash, streakData]);
  const ready = streakData && getCheckInState(streakData).state === 'ready';

  const go = (to) => { setOpen(null); navigate(to); };

  return (
    <>
      <AnimatedBackground />
      <div className={styles.shell}>
        <header className={styles.nav}>
          <div className={styles.navInner}>
            <button className={styles.menuBtn} aria-label="Open menu" aria-expanded={drawer} onClick={() => setDrawer(true)}><Menu size={20} /></button>
            <NavLink to="/dashboard" className={styles.brand} aria-label="VELOop Fire Streak home"><BrandLogo size="sm" /></NavLink>
            <nav className={styles.links} aria-label="Primary">
              {TOP_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>{label}</NavLink>
              ))}
            </nav>
            <div className={styles.right} ref={menuRef}>
              <div className={styles.menuWrap}>
                <button className={styles.iconBtn} aria-label="Notifications" aria-haspopup="dialog" aria-expanded={open === 'bell'} onClick={() => setOpen(open === 'bell' ? null : 'bell')}>
                  <Bell size={18} />
                  {ready && <span className={styles.dot} aria-hidden="true" />}
                </button>
                {open === 'bell' && (
                  <div className={styles.dropdown} role="dialog" aria-label="Notifications">
                    <div className={styles.ddTitle}>Notifications</div>
                    {notes.length === 0 ? (
                      <div className={styles.ddEmpty}>You're all caught up.</div>
                    ) : (
                      <ul className={styles.noteList}>
                        {notes.map((n) => (
                          <li key={n.text} className={styles.note}>
                            <span className={`${styles.noteIcon} ${styles[n.tone]}`}><n.Icon size={16} /></span>
                            <span><strong>{n.text}</strong><em>{n.sub}</em></span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className={styles.ddFoot}>Live from your account. Alerts aren't stored yet.</div>
                  </div>
                )}
              </div>
              <div className={styles.menuWrap}>
                <button className={styles.userBtn} aria-expanded={open === 'user'} aria-haspopup="menu" onClick={() => setOpen(open === 'user' ? null : 'user')}>
                  <span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span>
                  <span className={styles.userName}>{name}</span>
                  <ChevronDown size={16} className={open === 'user' ? styles.flip : ''} />
                </button>
                {open === 'user' && (
                  <div className={styles.dropdown} role="menu">
                    <div className={styles.ddTitle}>{email}</div>
                    <button role="menuitem" className={styles.ddItem} onClick={() => go('/profile')}><User size={16} /> Profile</button>
                    <button role="menuitem" className={styles.ddItem} onClick={() => go('/daily-streak')}><Flame size={16} /> My Streak</button>
                    <button role="menuitem" className={styles.ddItem} onClick={() => go('/rewards')}><Gift size={16} /> My Rewards</button>
                    <button role="menuitem" className={styles.ddItem} onClick={() => go('/settings')}><Settings size={16} /> Settings</button>
                    <div className={styles.ddSep} />
                    <button role="menuitem" className={`${styles.ddItem} ${styles.danger}`} onClick={() => { setOpen(null); askLogout(); }}><LogOut size={16} /> Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className={styles.body}>
          {drawer && <div className={styles.scrim} onClick={() => setDrawer(false)} aria-hidden="true" />}
          <aside className={`${styles.side} ${drawer ? styles.sideOpen : ''}`} aria-label="Sidebar">
            <div className={styles.sideHead}>
              <BrandLogo size="sm" tagline />
              <button className={styles.closeBtn} aria-label="Close menu" onClick={() => setDrawer(false)}><X size={18} /></button>
            </div>
            {NAV.map((group) => (
              <div key={group.title} className={styles.group}>
                <div className={styles.groupTitle}>{group.title}</div>
                {group.items.map(({ to, label, Icon }) => (
                  <NavLink key={to} to={to} className={({ isActive }) => `${styles.sideLink} ${isActive ? styles.sideActive : ''}`}>
                    <Icon size={18} /> {label}
                  </NavLink>
                ))}
              </div>
            ))}
            <button className={`${styles.sideLink} ${styles.logout}`} onClick={askLogout}><LogOut size={18} /> Logout</button>
          </aside>

          <div className={styles.content}>
            <main key={pathname} className={styles.main}><Outlet /></main>
            <footer className={styles.footer}>
              <div className={styles.fBrand}><Flame size={16} /> VELOop — Fire Streak</div>
              <div className={styles.fTag}>Build your streak. Earn your rewards.</div>
              <div className={styles.copy}>© 2026 VELOop</div>
            </footer>
          </div>
        </div>

        <nav className={styles.bottom} aria-label="Primary mobile">
          {BOTTOM.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `${styles.bItem} ${isActive ? styles.bActive : ''}`}>
              <Icon size={20} /><span>{label}</span>
            </NavLink>
          ))}
          <button className={styles.bItem} onClick={() => setDrawer(true)} aria-label="More"><Menu size={20} /><span>More</span></button>
        </nav>
      </div>
      <Celebration />
      {confirming && <LogoutConfirm onConfirm={confirmLogout} onCancel={cancelLogout} />}
    </>
  );
}

export default function AppShell() {
  return (
    <OverviewProvider>
      <Shell />
    </OverviewProvider>
  );
}
