import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { prefetchPages } from '../routes.js';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Flame, Trophy, Bell, ChevronDown, LogOut, Gift, Menu, X,
  Award, Target, Activity, User, Settings,
} from 'lucide-react';
import styles from './AppShell.module.css';
import LogoutConfirm from './LogoutConfirm.jsx';
import useLogout from './useLogout.js';
import { useAuth } from '../context/AuthContext.jsx';
import { OverviewProvider, useOverview } from '../context/OverviewContext.jsx';
import { buildMilestones, displayNameOf, getCheckInState } from '../utils/streakInsights';
import fireLogo from '../assets/veloop-fire.png';
import { ICONS } from '../assets/icons.js';
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
const TITLES = Object.fromEntries(NAV.flatMap((g) => g.items).map((i) => [i.to, i.label]));
const BOTTOM = [
  { to: '/dashboard', label: 'Home', Icon: LayoutDashboard },
  { to: '/daily-streak', label: 'Streak', Icon: Flame },
  { to: '/rewards', label: 'Rewards', Icon: Gift },
  { to: '/profile', label: 'Profile', Icon: User },
];

function NavList({ onNavigate }) {
  return NAV.map((group) => (
    <div key={group.title} className={styles.group}>
      <div className={styles.groupTitle}>{group.title}</div>
      {group.items.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} aria-label={label} data-tip={label} onClick={onNavigate}
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <span className={styles.ico}><Icon size={20} strokeWidth={1.8} /></span>
          <span className={styles.lbl}>{label}</span>
        </NavLink>
      ))}
    </div>
  ));
}

function Shell() {
  const { user } = useAuth();
  const { dash, streakData } = useOverview();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { confirming, askLogout, cancelLogout, confirmLogout } = useLogout();
  const [open, setOpen] = useState(null); // null | 'bell' | 'user'
  const [drawer, setDrawer] = useState(false);
  const [hover, setHover] = useState(false);   // cursor is over the rail
  const [kbd, setKbd] = useState(false);       // rail was reached with the keyboard
  const [pinned, setPinned] = useState(false); // logo click keeps it open until you pick a page / click away
  const menuRef = useRef(null);
  const railRef = useRef(null);
  const quiet = useRef(false);                 // after picking a page, ignore hover until the cursor really leaves
  const expanded = hover || kbd || pinned;
  const name = displayNameOf(dash?.user, user);
  const email = dash?.user?.email || user?.email || '';
  const streak = dash?.streak?.currentStreak ?? 0;

  useEffect(() => {
    setOpen(null); setDrawer(false);
    // Page chosen: collapse the rail now, drop focus so it cannot hold the menu open.
    quiet.current = !!railRef.current?.matches(':hover'); setHover(false); setKbd(false); setPinned(false);
    if (railRef.current?.contains(document.activeElement)) document.activeElement.blur();
  }, [pathname]);
  useEffect(() => { // warm the other page chunks once the browser is idle
    const id = (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(prefetchPages);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : clearTimeout(id));
  }, []);
  useEffect(() => {
    const out = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(null);
      if (railRef.current && !railRef.current.contains(e.target)) { setPinned(false); setHover(false); setKbd(false); }
    };
    const esc = (e) => { if (e.key === 'Escape') { setOpen(null); setDrawer(false); setPinned(false); setHover(false); setKbd(false); } };
    document.addEventListener('mousedown', out);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc); };
  }, []);

  // Status items come from real account data; the backend has no notification store.
  const notes = useMemo(() => {
    if (!dash || !streakData) return [];
    const list = [];
    const s = dash.streak;
    if (getCheckInState(streakData).state === 'ready') list.push({ Icon: Flame, tone: 'gold', text: 'Your check-in is ready', sub: 'Claim it to protect your streak.' });
    else if (s.currentStreak > 0) list.push({ Icon: Flame, tone: 'gold', text: 'Your streak is active', sub: `${s.currentStreak} day${s.currentStreak === 1 ? '' : 's'} and counting.` });
    if (dash.recent[0]) list.push({ Icon: Gift, tone: 'violet', text: 'Latest reward unlocked', sub: `Day ${dash.recent[0].day} reward claimed.` });
    const reached = buildMilestones(s).filter((m) => m.state === 'done').pop();
    if (reached) list.push({ Icon: Trophy, tone: 'violet', text: `${reached.days}-day milestone achieved`, sub: 'Nicely done.' });
    return list;
  }, [dash, streakData]);
  const ready = streakData && getCheckInState(streakData).state === 'ready';
  const go = (to) => { setOpen(null); navigate(to); };
  const title = TITLES[pathname] || 'Dashboard';

  return (
    <div className={styles.shell}>
      {/* ---- desktop rail: hover or logo click expands it over the content (no reflow); it closes when the cursor
           leaves, when a page is chosen, on outside click or Esc ---- */}
      <aside ref={railRef} className={`${styles.rail} ${expanded ? styles.open : ''}`} aria-label="Sidebar"
        onMouseEnter={() => { if (!quiet.current) setHover(true); }}
        onMouseLeave={() => { quiet.current = false; setHover(false); }}
        onFocus={(e) => { if (e.target.matches(':focus-visible')) setKbd(true); }}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setKbd(false); }}>
        <button className={styles.logoBtn} onClick={() => setPinned((p) => !p)} aria-label={pinned ? 'Collapse menu' : 'Expand menu'} aria-expanded={pinned}>
          <span className={styles.logoTile}><img src={fireLogo} alt="" width="22" height="22" /></span>
          <span className={`${styles.lbl} ${styles.brandName}`}>VELoop</span>
        </button>
        <nav className={styles.navList} aria-label="Primary"><NavList /></nav>
        <div className={styles.foot}>
          <div className={styles.chain}><span className={styles.chainBadge}><Flame size={18} strokeWidth={1.8} /><i>{streak}</i></span><span className={styles.lbl}>{streak} day chain</span></div>
          <button className={styles.link} onClick={askLogout} aria-label="Log out" data-tip="Log out"><span className={styles.ico}><LogOut size={20} strokeWidth={1.8} /></span><span className={styles.lbl}>Log out</span></button>
        </div>
      </aside>

      {/* ---- mobile drawer ---- */}
      <div className={`${styles.scrim} ${drawer ? styles.scrimOn : ''}`} onClick={() => setDrawer(false)} aria-hidden="true" />
      <aside className={`${styles.drawer} ${drawer ? styles.drawerOn : ''}`} aria-label="Menu" aria-hidden={!drawer}>
        <div className={styles.drawerHead}>
          <span className={styles.logoTile}><img src={fireLogo} alt="" width="22" height="22" /></span>
          <strong className={styles.brandName}>VELoop</strong>
          <button className={styles.iconBtn} aria-label="Close menu" onClick={() => setDrawer(false)}><X size={18} /></button>
        </div>
        <nav className={styles.navList} aria-label="Mobile"><NavList onNavigate={() => setDrawer(false)} /></nav>
        <button className={`${styles.link} ${styles.drawerLogout}`} onClick={() => { setDrawer(false); askLogout(); }}><span className={styles.ico}><LogOut size={20} strokeWidth={1.8} /></span><span className={styles.lbl}>Log out</span></button>
      </aside>

      <div className={styles.frame}>
        <header className={styles.top}>
          <button className={`${styles.iconBtn} ${styles.menuBtn}`} aria-label="Open menu" aria-expanded={drawer} onClick={() => setDrawer(true)}><Menu size={20} /></button>
          <div className={styles.crumb}><span>VELoop</span><span aria-hidden="true">/</span><strong>{title}</strong></div>
          <div className={styles.right} ref={menuRef}>
            <span className={styles.pill} title="Current streak"><img src={ICONS.flame} alt="" width="14" height="17" /><b>{streak}</b><span className={styles.pillTxt}> days</span></span>
            <span className={styles.pill} title="VES balance" data-wallet><img src={ICONS.coin} alt="" width="18" height="15" /><b>{dash?.wallet?.VES ?? 0}</b></span>
            <div className={styles.menuWrap}>
              <button className={styles.iconBtn} aria-label="Notifications" aria-haspopup="dialog" aria-expanded={open === 'bell'} onClick={() => setOpen(open === 'bell' ? null : 'bell')}>
                <Bell size={17} />{ready && <span className={styles.dot} aria-hidden="true" />}
              </button>
              {open === 'bell' && (
                <div className={styles.dropdown} role="dialog" aria-label="Notifications">
                  <div className={styles.ddTitle}>Notifications</div>
                  {notes.length === 0 ? <div className={styles.ddEmpty}>You're all caught up.</div> : (
                    <ul className={styles.noteList}>
                      {notes.map((n) => (
                        <li key={n.text} className={styles.note}>
                          <span className={`${styles.noteIcon} ${styles[n.tone]}`}><n.Icon size={16} /></span>
                          <span><strong>{n.text}</strong><em>{n.sub}</em></span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className={styles.menuWrap}>
              <button className={styles.userBtn} aria-expanded={open === 'user'} aria-haspopup="menu" onClick={() => setOpen(open === 'user' ? null : 'user')}>
                <span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span>
                <span className={styles.userName}>{name}</span>
                <ChevronDown size={15} className={open === 'user' ? styles.flip : ''} />
              </button>
              {open === 'user' && (
                <div className={styles.dropdown} role="menu">
                  <div className={styles.ddTitle}>{email}</div>
                  <button role="menuitem" className={styles.ddItem} onClick={() => go('/profile')}><User size={16} /> Profile</button>
                  <button role="menuitem" className={styles.ddItem} onClick={() => go('/settings')}><Settings size={16} /> Settings</button>
                  <div className={styles.ddSep} />
                  <button role="menuitem" className={`${styles.ddItem} ${styles.danger}`} onClick={() => { setOpen(null); askLogout(); }}><LogOut size={16} /> Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main key={pathname} className={styles.main}><Suspense fallback={<div className={styles.fallback} aria-busy="true" />}><Outlet /></Suspense></main>
        <footer className={styles.footer}><img src={fireLogo} alt="" width="16" height="16" /> VELoop — Daily Streak · Build your streak. Earn your rewards. · © 2026 VELoop</footer>
      </div>

      <nav className={styles.bottom} aria-label="Primary mobile">
        {BOTTOM.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `${styles.bItem} ${isActive ? styles.bActive : ''}`}><Icon size={20} strokeWidth={1.8} /><span>{label}</span></NavLink>
        ))}
        <button className={styles.bItem} onClick={() => setDrawer(true)} aria-label="More"><Menu size={20} strokeWidth={1.8} /><span>More</span></button>
      </nav>
      <Celebration />
      {confirming && <LogoutConfirm onConfirm={confirmLogout} onCancel={cancelLogout} />}
    </div>
  );
}

export default function AppShell() {
  return (
    <OverviewProvider>
      <Shell />
    </OverviewProvider>
  );
}
