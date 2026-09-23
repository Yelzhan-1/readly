import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/index.jsx';
import { useApp } from '../store/AppContext.jsx';
import { levelForStars } from '../data/worlds.js';
import { Mascot, Logo } from '../components/ui/Mascots.jsx';
import LanguageSelector from '../components/ui/LanguageSelector.jsx';
import Button from '../components/ui/Button.jsx';

export default function ProfilePicker() {
  const t = useT();
  const navigate = useNavigate();
  const { state, selectProfile, profile } = useApp();

  const choose = (id) => {
    selectProfile(id);
    const p = state.profiles.find((x) => x.id === id);
    if (p && !p.diagnosticDone) navigate('/diagnostic', { replace: true });
    else navigate('/home', { replace: true });
  };

  return (
    <div className="picker page-enter">
      <Logo size={46} />
      <div className="center">
        <h1 style={{ marginBottom: 6 }}>{t('profiles.title')}</h1>
        <p className="muted" style={{ margin: 0, fontWeight: 600 }}>
          {t('profiles.subtitle')}
        </p>
      </div>

      <div className="picker__grid">
        {state.profiles.map((p) => {
          const lv = levelForStars(p.stars);
          return (
            <button
              key={p.id}
              type="button"
              className="profile-card"
              onClick={() => choose(p.id)}
            >
              <span
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 30%, #fff, ${p.color}44)`,
                  display: 'grid',
                  placeItems: 'center',
                  border: '4px solid #fff',
                  boxShadow: 'var(--sh-md)',
                }}
              >
                <Mascot id={p.mascot} size={78} />
              </span>
              <span className="profile-card__name">
                {p.name} {p.demo && <span className="chip chip--demo">{t('profiles.demo')}</span>}
              </span>
              <span className="profile-card__meta">{t(lv.nameKey)}</span>
              <span className="profile-card__meta">⭐ {p.stars} · 🔥 {p.streak}</span>
            </button>
          );
        })}

        <button
          type="button"
          className="profile-card profile-card--new"
          onClick={() => navigate('/onboarding')}
        >
          <span className="plus">+</span>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
            {t('profiles.newProfile')}
          </strong>
          <span className="profile-card__meta">{t('profiles.newHint')}</span>
        </button>
      </div>

      <div className="row" style={{ gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <LanguageSelector />
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          ← {t('profiles.back')}
        </Button>
        <Button variant="soft" size="sm" onClick={() => navigate('/parent')}>
          🔒 {t('common.forParent')}
        </Button>
      </div>
      {profile && <span className="sr-only">{profile.name}</span>}
    </div>
  );
}
