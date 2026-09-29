import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Flame, Gift, Trophy, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './LoginPage.module.css';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import friendlyError from '../utils/friendlyError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const errors = {
    email: !email ? 'Email is required.' : !EMAIL_RE.test(email) ? 'Enter a valid email address.' : '',
    password: !password ? 'Password is required.' : '',
  };
  const isLogin = mode === 'login';

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) return;
    setError('');
    setBusy(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password, name);
      navigate('/daily-streak');
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 401 && isLogin ? 'Incorrect email or password.'
          : status === 409 ? 'An account with this email already exists. Try logging in.'
          : friendlyError(err, 'Please check your details and try again.')
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <AnimatedBackground />
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <span className={styles.logoBadge}><Flame size={22} /></span>
          <span className={styles.brand}>VELOop</span>
        </div>
        <h1 className={styles.title}>{isLogin ? 'Welcome Back 🔥' : 'Start Your Streak 🔥'}</h1>
        <p className={styles.subtitle}>{isLogin ? 'Your streak is waiting for you.' : 'Create an account and turn consistency into rewards.'}</p>
        <div className={styles.perks} aria-hidden="true">
          <span><Flame size={14} /> Streaks</span><span><Gift size={14} /> Rewards</span><span><Trophy size={14} /> Progress</span>
        </div>

        {error && <div className={styles.error} role="alert">{error}</div>}

        <form onSubmit={submit} noValidate>
          {!isLogin && (
            <label className={styles.field}>
              <span>Name</span>
              <input className={styles.input} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          )}
          <label className={styles.field}>
            <span>Email</span>
            <input className={styles.input} type="email" autoComplete="email" value={email} aria-invalid={touched.email && !!errors.email}
              aria-describedby="err-email" onBlur={() => setTouched((t) => ({ ...t, email: true }))} onChange={(e) => setEmail(e.target.value)} />
            <em id="err-email" className={styles.fieldError} role="alert">{touched.email ? errors.email : ''}</em>
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <div className={styles.pwWrap}>
              <input className={styles.input} type={show ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} value={password}
                aria-invalid={touched.password && !!errors.password} aria-describedby="err-pw"
                onBlur={() => setTouched((t) => ({ ...t, password: true }))} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className={styles.eye} onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <em id="err-pw" className={styles.fieldError} role="alert">{touched.password ? errors.password : ''}</em>
          </label>
          <button className={styles.submit} disabled={busy} type="submit">
            {busy ? <><Loader2 size={18} className={styles.spin} /> Please wait…</> : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        <button className={styles.toggle} onClick={() => { setMode(isLogin ? 'register' : 'login'); setError(''); setTouched({}); }}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
