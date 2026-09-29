import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Flame, Trophy, Bell, ChevronDown, LogOut } from 'lucide-react';
import styles from './AppShell.module.css';
import AnimatedBackground from './AnimatedBackground.jsx';
import LogoutConfirm from './LogoutConfirm.jsx';
import useLogout from './useLogout.js';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/daily-streak', label: 'My Streak', Icon: Flame },
  { to: '/leaderboard', label: 'Leaderboard', Icon: Trophy },
];

export default function AppShell() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { confirming, askLogout, cancelLogout, confirmLogout } = useLogout();
  const [open, setOpen] = useState(null); // null | 'bell' | 'user'
  const menuRef = useRef(null);
  const name = user?.name || user?.email?.split('@')[0] || 'Player';

  useEffect(() => setOpen(null), [pathname]);
  useEffect(() => {
    const out = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(null);
    const esc = (e) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('mousedown', out);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc); };
  }, []);

  return (
    <>
      <AnimatedBackground />
      <div className={styles.shell}>
        <header className={styles.nav}>
          <div className={styles.navInner}>
            <NavLink to="/dashboard" className={styles.brand}><Flame size={22} className={styles.brandIcon} /> VELOop</NavLink>
            <nav className={styles.links} aria-label="Primary">
              {LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>{label}</NavLink>
              ))}
            </nav>
            <div className={styles.right} ref={menuRef}>
              <div className={styles.menuWrap}>
                <button className={styles.iconBtn} aria-label="Notifications" aria-expanded={open === 'bell'} onClick={() => setOpen(open === 'bell' ? null : 'bell')}>
                  <Bell size={18} />
                </button>
                {open === 'bell' && (
                  <div className={styles.dropdown} role="dialog" aria-label="Notifications">
                    <div className={styles.ddTitle}>Notifications</div>
                    <div className={styles.ddEmpty}>You're all caught up.<br /><span>Notifications aren't connected to the backend yet.</span></div>
                  </div>
                )}
              </div>
              <div className={styles.menuWrap}>
                <button className={styles.userBtn} aria-expanded={open === 'user'} aria-haspopup="menu" onClick={() => setOpen(open === 'user' ? null : 'user')}>
                  <span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span>
                  <span className={styles.userName}>{name}</span>
                  <ChevronDown size={16} />
                </button>
                {open === 'user' && (
                  <div className={styles.dropdown} role="menu">
                    <div className={styles.ddTitle}>{user?.email}</div>
                    <button role="menuitem" className={styles.ddItem} onClick={askLogout}><LogOut size={16} /> Log out</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main key={pathname} className={styles.main}><Outlet /></main>

        <footer className={styles.footer}>
          <div className={styles.fBrand}>VELOop</div>
          <div className={styles.fTag}>Build consistency. Earn rewards. Keep going.</div>
          <nav className={styles.fLinks} aria-label="Footer">
            {LINKS.map(({ to, label }) => <NavLink key={to} to={to}>{label}</NavLink>)}
          </nav>
          <div className={styles.copy}>© 2026 VELOop. All rights reserved.</div>
        </footer>

        <nav className={styles.bottom} aria-label="Primary mobile">
          {LINKS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `${styles.bItem} ${isActive ? styles.active : ''}`}>
              <Icon size={20} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      {confirming && <LogoutConfirm onConfirm={confirmLogout} onCancel={cancelLogout} />}
    </>
  );
}
