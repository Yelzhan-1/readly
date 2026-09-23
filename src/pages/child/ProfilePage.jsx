import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useI18n } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { PROFILE_COLORS, INTERESTS } from '../../data/interests.js';
import { Mascot } from '../../components/ui/Mascots.jsx';
import Button from '../../components/ui/Button.jsx';

const MASCOTS = ['dino', 'luna', 'nova', 'milo'];

export default function ProfilePage() {
  const t = useT();
  const { lang, setLang, languages } = useI18n();
  const navigate = useNavigate();
  const { profile, mutateProfile } = useApp();

  const [name, setName] = useState(profile?.name || '');
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const patch = (p) => mutateProfile(profile.id, (old) => ({ ...old, ...p }));

  const save = () => {
    patch({ name: name.trim() || profile.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const toggleInterest = (id) => {
    const cur = profile.interests || [];
    patch({
      interests: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    });
  };

  return (
    <div className="page-enter">
      <div className="section-title">
        <div>
          <h1 style={{ marginBottom: 4 }}>{t('profile.title')}</h1>
          <p className="sub" style={{ margin: 0 }}>
            {t('profile.subtitle')}
          </p>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 110,
            height: 110,
            margin: '0 auto 12px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, #fff, ${profile.color}44)`,
            border: '4px solid #fff',
            boxShadow: 'var(--sh-md)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Mascot id={profile.mascot} size={94} />
        </div>

        <div className="field" style={{ textAlign: 'left', maxWidth: 360, margin: '0 auto' }}>
          <label htmlFor="pf-name">{t('onboarding.yourName')}</label>
          <input
            id="pf-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={18}
          />
        </div>

        <div className="row" style={{ justifyContent: 'center', gap: 10, marginTop: 6 }}>
          <Button variant="primary" onClick={save}>
            💾 {t('common.save')}
          </Button>
          {saved && (
            <span style={{ color: 'var(--teal)', fontWeight: 800 }} role="status">
              ✓ {t('profile.saved')}
            </span>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t('onboarding.mascotTitle')}</h3>
        <div className="mascot-grid">
          {MASCOTS.map((m) => (
            <button
              key={m}
              type="button"
              className="mascot-card"
              aria-pressed={profile.mascot === m}
              onClick={() => patch({ mascot: m })}
            >
              <Mascot id={m} size={78} />
              {t(`mascots.${m}`)}
            </button>
          ))}
        </div>

        <h3>{t('onboarding.colorTitle')}</h3>
        <div className="swatches">
          {PROFILE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="swatch"
              style={{ background: c }}
              aria-pressed={profile.color === c}
              aria-label={c}
              onClick={() => patch({ color: c })}
            />
          ))}
        </div>

        <h3>{t('onboarding.interestsTitle')}</h3>
        <div className="interest-grid">
          {INTERESTS.map((it) => (
            <button
              key={it.id}
              type="button"
              className="interest-card"
              aria-pressed={(profile.interests || []).includes(it.id)}
              onClick={() => toggleInterest(it.id)}
            >
              <span className="interest-card__emoji" style={{ background: it.tint }}>
                {it.emoji}
              </span>
              {t(`interests.${it.id}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t('settings.language')}</h3>
        <div className="lang-cards">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              className="lang-card"
              aria-pressed={lang === l.code}
              onClick={() => setLang(l.code)}
            >
              {l.native}
              <small>{l.label}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'center', marginTop: 20, gap: 10, flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={() => navigate('/settings')}>
          ⚙️ {t('nav.settings')}
        </Button>
        <Button variant="ghost" onClick={() => navigate('/profiles')}>
          👥 {t('settings.switchProfile')}
        </Button>
        <Button variant="soft" onClick={() => navigate('/parent')}>
          🔒 {t('common.forParent')}
        </Button>
      </div>
    </div>
  );
}
