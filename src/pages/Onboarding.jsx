import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useI18n } from '../i18n/index.jsx';
import { useApp } from '../store/AppContext.jsx';
import { INTERESTS, PROFILE_COLORS } from '../data/interests.js';
import { emptyProfile } from '../data/demoSeed.js';
import Button from '../components/ui/Button.jsx';
import { Mascot, Logo } from '../components/ui/Mascots.jsx';

const MASCOTS = ['dino', 'luna', 'nova', 'milo'];
const TOTAL_STEPS = 4;

export default function Onboarding() {
  const t = useT();
  const { lang, setLang, languages } = useI18n();
  const { addProfile } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('6');
  const [interests, setInterests] = useState(['dinosaur']);
  const [mascot, setMascot] = useState('dino');
  const [color, setColor] = useState(PROFILE_COLORS[0]);
  const [err, setErr] = useState('');

  const toggleInterest = (id) => {
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const next = () => {
    setErr('');
    if (step === 1 && !name.trim()) {
      setErr(t('onboarding.namePh'));
      return;
    }
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    const profile = emptyProfile({
      name: name.trim(),
      age: Number(age) || 6,
      interests: interests.length ? interests : ['animals'],
      mascot,
      color,
    });
    addProfile(profile);
    navigate('/diagnostic', { replace: true });
  };

  return (
    <div className="onboard page-enter">
      <div className="onboard__top">
        <Logo size={36} />
        <div className="onboard__steps" aria-label={t('onboarding.step', { current: step + 1, total: TOTAL_STEPS })}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span key={i} className={`onboard__dot ${i <= step ? 'on' : ''}`} />
          ))}
        </div>
        <span className="small muted" style={{ fontWeight: 800 }}>
          {t('onboarding.step', { current: step + 1, total: TOTAL_STEPS })}
        </span>
      </div>

      {step === 0 && (
        <div className="onboard__body">
          <h1 className="onboard__title">{t('onboarding.hello')}</h1>
          <p className="onboard__hint">{t('onboarding.helloSub')}</p>
          <div className="lang-cards" style={{ marginTop: 24 }}>
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
      )}

      {step === 1 && (
        <div className="onboard__body">
          <h1 className="onboard__title">{t('onboarding.yourName')}</h1>
          <p className="onboard__hint">{t('onboarding.helloSub')}</p>
          <div className="stack" style={{ marginTop: 20, maxWidth: 420 }}>
            <div className="field">
              <label htmlFor="ob-name">{t('onboarding.yourName')}</label>
              <input
                id="ob-name"
                className="input"
                value={name}
                placeholder={t('onboarding.namePh')}
                onChange={(e) => {
                  setName(e.target.value);
                  setErr('');
                }}
                maxLength={18}
                autoFocus
              />
            </div>
            <div className="field" style={{ maxWidth: 180 }}>
              <label htmlFor="ob-age">{t('onboarding.ageLabel')}</label>
              <select
                id="ob-age"
                className="select"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              >
                {['4', '5', '6', '7', '8', '9', '10'].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            {err && (
              <span style={{ color: 'var(--danger)', fontWeight: 700 }} role="alert">
                {err}
              </span>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="onboard__body">
          <h1 className="onboard__title">{t('onboarding.interestsTitle')}</h1>
          <p className="onboard__hint">{t('onboarding.interestsHint')}</p>
          <div className="interest-grid" style={{ marginTop: 20 }}>
            {INTERESTS.map((it) => (
              <button
                key={it.id}
                type="button"
                className="interest-card"
                aria-pressed={interests.includes(it.id)}
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
      )}

      {step === 3 && (
        <div className="onboard__body">
          <h1 className="onboard__title">{t('onboarding.mascotTitle')}</h1>
          <p className="onboard__hint">{t('onboarding.mascotSub')}</p>
          <div className="mascot-grid" style={{ marginTop: 18 }}>
            {MASCOTS.map((m) => (
              <button
                key={m}
                type="button"
                className="mascot-card"
                aria-pressed={mascot === m}
                onClick={() => setMascot(m)}
              >
                <Mascot id={m} size={92} />
                {t(`mascots.${m}`)}
                <span className="small muted">{t(`mascots.${m}Sub`)}</span>
              </button>
            ))}
          </div>

          <h3 style={{ marginTop: 28 }}>{t('onboarding.colorTitle')}</h3>
          <p className="onboard__hint">{t('onboarding.colorSub')}</p>
          <div className="swatches" style={{ marginTop: 10 }}>
            {PROFILE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="swatch"
                style={{ background: c }}
                aria-pressed={color === c}
                aria-label={c}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="onboard__actions">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            ← {t('onboarding.back')}
          </Button>
        )}
        <Button variant="primary" size="lg" onClick={next}>
          {step === TOTAL_STEPS - 1 ? `🚀 ${t('onboarding.startAdventure')}` : `${t('onboarding.next')} →`}
        </Button>
      </div>
    </div>
  );
}
