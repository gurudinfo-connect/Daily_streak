import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Shared logout flow: open confirm dialog -> clear session -> go to /login.
export default function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const confirm = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return {
    confirming,
    askLogout: () => setConfirming(true),
    cancelLogout: () => setConfirming(false),
    confirmLogout: confirm,
  };
}
