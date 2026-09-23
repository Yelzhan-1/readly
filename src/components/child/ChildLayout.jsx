import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext.jsx';
import { useT, useI18n } from '../../i18n/index.jsx';
import Toasts from '../ui/Toasts.jsx';
import LanguageSelector from '../ui/LanguageSelector.jsx';

const NAV = [
  { to: '/home', icon: '🏠', key: 'nav.home' },
  { to: '/learn', icon: '🎯', key: 'nav.learn' },
  { to: '/stories', icon: '📚', key: 'nav.stories' },
  { to: '/progress', icon: '🌟', key: 'nav.progress' },
  { to: '/profile', icon: '🙂', key: 'nav.profile' },
];

export default function ChildLayout() {
  const t = useT();
  const { lang } = useI18n();
  const { profile, state } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!profile) navigate('/profiles', { replace: true });
  }, [profile, navigate]);

  if (!profile) return null;

  return (
    <div className="child-shell">
      <header className="child-top">
        <button
          type="button"
          className="row"
          onClick={() => navigate('/home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          aria-label={t('nav.home')}
        >
          <span className="logo" style={{ fontSize: '1.2rem' }}>
            <span className="logo__mark" style={{ width: 34, height: 34 }} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 5c3.5-1.6 6-1.6 9 0v14c-3-1.6-5.5-1.6-9 0V5z" fill="#fff" />
                <path d="M21 5c-3.5-1.6-6-1.6-9 0v14c3-1.6 5.5-1.6 9 0V5z" fill="#FFE7D6" />
              </svg>
            </span>
            Readly
          </span>
        </button>

        <div className="child-top__stats">
          <span className="pill-stat" title={t('home.stars')}>
            ⭐ {profile.stars}
          </span>
          <span className="pill-stat" title={t('home.streak')}>
            🔥 {profile.streak}
          </span>
          {state.profiles.length > 1 && (
            <button
              type="button"
              className="pill-stat"
              onClick={() => navigate('/profiles')}
              style={{ cursor: 'pointer' }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: profile.color,
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                }}
              >
                {profile.name.slice(0, 1)}
              </span>
            </button>
          )}
          <LanguageSelector compact />
          <button
            type="button"
            className="pill-stat"
            onClick={() => navigate('/parent')}
            title={t('nav.parent')}
          >
            🔒
          </button>
        </div>
      </header>

      <main className="child-main page-enter" key={lang}>
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label={t('nav.home')}>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ico" aria-hidden="true">
              {item.icon}
            </span>
            <span>{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>

      <Toasts />
    </div>
  );
}
