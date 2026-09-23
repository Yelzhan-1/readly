import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext.jsx';
import { useT } from '../../i18n/index.jsx';
import { Logo } from '../ui/Mascots.jsx';
import Toasts from '../ui/Toasts.jsx';
import Button from '../ui/Button.jsx';

const NAV = [
  { to: '/parent/overview', icon: '📊', key: 'parent.navOverview' },
  { to: '/parent/progress', icon: '📈', key: 'parent.navProgress' },
  { to: '/parent/skills', icon: '🎯', key: 'parent.navSkills' },
  { to: '/parent/history', icon: '🕘', key: 'parent.navHistory' },
  { to: '/parent/settings', icon: '⚙️', key: 'parent.navSettings' },
];

export default function ParentLayout() {
  const t = useT();
  const navigate = useNavigate();
  const { parentUnlocked, setParentUnlocked, profile } = useApp();

  React.useEffect(() => {
    if (!parentUnlocked) navigate('/parent', { replace: true });
  }, [parentUnlocked, navigate]);

  if (!parentUnlocked) return null;

  return (
    <div className="parent-shell">
      <aside className="parent-side">
        <Logo size={38} />
        <nav className="parent-nav" aria-label={t('parent.gateTitle')}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span className="ico" aria-hidden="true">
                {item.icon}
              </span>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
        <div className="parent-side__foot">
          <Button
            variant="soft"
            size="sm"
            onClick={() => {
              setParentUnlocked(false);
              navigate('/home');
            }}
          >
            👋 {t('parent.exitToChild')}
          </Button>
          <span className="small" style={{ color: '#9aa1cd', fontWeight: 700 }}>
            {profile ? `${profile.name} · ${t('common.demoMode')}` : t('common.demoMode')}
          </span>
        </div>
      </aside>

      <main className="parent-main page-enter">
        <Outlet />
      </main>

      <Toasts />
    </div>
  );
}
