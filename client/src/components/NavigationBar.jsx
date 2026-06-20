import { Flag, LogIn, LogOut, Map, Medal, ScrollText } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

function NavigationBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="topbar">
      <NavLink to="/" className="brand" aria-label="Last Race home">
        <Flag size={24} aria-hidden="true" />
        <span>Last Race</span>
      </NavLink>
      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/" end>
          <ScrollText size={18} aria-hidden="true" />
          Instructions
        </NavLink>
        {user && (
          <>
            <NavLink to="/setup">
              <Map size={18} aria-hidden="true" />
              Setup
            </NavLink>
            <NavLink to="/ranking">
              <Medal size={18} aria-hidden="true" />
              Ranking
            </NavLink>
          </>
        )}
      </nav>
      <div className="session-box">
        {user ? (
          <>
            <span className="username">{user.username}</span>
            <button type="button" className="button ghost" onClick={handleLogout}>
              <LogOut size={18} aria-hidden="true" />
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" className="button primary">
            <LogIn size={18} aria-hidden="true" />
            Login
          </NavLink>
        )}
      </div>
    </header>
  );
}

export default NavigationBar;
