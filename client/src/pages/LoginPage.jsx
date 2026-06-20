import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import GameButton from '../components/GameButton.jsx';
import PhaseBadge from '../components/PhaseBadge.jsx';

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('arman');
  const [password, setPassword] = useState('last-race');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/setup" replace />;
  }

  const from = location.state?.from?.pathname ?? '/setup';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="narrow-panel login-panel">
      <PhaseBadge tone="teal">Registered players</PhaseBadge>
      <h1>Login</h1>
      <p className="muted">Use one seeded account. Registration is not part of this project.</p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" />
        </label>
        {error && <p className="error-message">{error}</p>}
        <GameButton type="submit" disabled={submitting || !username.trim() || !password}>
          <LogIn size={18} aria-hidden="true" />
          {submitting ? 'Logging in...' : 'Login'}
        </GameButton>
      </form>
      <div className="credentials-box">
        <h2>Seeded credentials</h2>
        <p><strong>arman</strong> / last-race</p>
        <p><strong>ada</strong> / metro2026</p>
        <p><strong>marco</strong> / rails2026</p>
      </div>
    </section>
  );
}

export default LoginPage;
