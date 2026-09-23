import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useI18n } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import Button from '../../components/ui/Button.jsx';
import LanguageSelector from '../../components/ui/LanguageSelector.jsx';

function Toggle({ id, checked, onChange, label, hint }) {
  return (
    <label className="row-between" htmlFor={id} style={{ padding: '10px 0', cursor: 'pointer' }}>
      <span>
        <strong style={{ display: 'block' }}>{label}</strong>
        {hint && <span className="small muted">{hint}</span>}
      </span>
      <span className="switch" role="switch" aria-checked={checked}>
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      </span>
    </label>
  );
}

export default function SettingsPage() {
  const t = useT();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { state, updateSettings, resetDemo } = useApp();
  const s = state.settings;
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="page-enter">
      <div className="section-title">
        <div>
          <h1 style={{ marginBottom: 4 }}>{t('settings.title')}</h1>
          <p className="sub" style={{ margin: 0 }}>
            {t('settings.subtitle')}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>{t('settings.language')}</h3>
        <LanguageSelector />
        <p className="small muted" style={{ marginTop: 10 }}>
          {t('settings.languageSub')}
        </p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t('settings.ttsTitle')}</h3>
        <Toggle
          id="set-sound"
          checked={s.sound !== false}
          onChange={(v) => updateSettings({ sound: v })}
          label={t('settings.sound')}
          hint={t('settings.soundSub')}
        />
        <Toggle
          id="set-speak"
          checked={s.speakFeedback !== false}
          onChange={(v) => updateSettings({ speakFeedback: v })}
          label={t('settings.speakFeedback')}
          hint={t('settings.speakFeedbackHint')}
        />
        <Toggle
          id="set-slow"
          checked={s.slowSpeech === true}
          onChange={(v) => updateSettings({ slowSpeech: v })}
          label={t('settings.slowSpeech')}
          hint={t('settings.slowSpeechHint')}
        />
        <Toggle
          id="set-hints"
          checked={s.hints !== false}
          onChange={(v) => updateSettings({ hints: v })}
          label={t('settings.hints')}
          hint={t('settings.hintsHint')}
        />
        <Toggle
          id="set-reduce"
          checked={s.reducedMotion === true}
          onChange={(v) => updateSettings({ reducedMotion: v })}
          label={t('settings.reduceMotion')}
          hint={t('settings.reduceMotionHint')}
        />
        <Toggle
          id="set-tap"
          checked={s.tapMode === true}
          onChange={(v) => updateSettings({ tapMode: v })}
          label={t('settings.tapMode')}
          hint={t('settings.tapModeHint')}
        />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t('settings.textSize')}</h3>
        <div className="lang-select" role="group" aria-label={t('settings.textSize')}>
          {[
            ['sm', t('settings.sizeSm')],
            ['md', t('settings.sizeMd')],
            ['lg', t('settings.sizeLg')],
          ].map(([val, lab]) => (
            <button
              key={val}
              type="button"
              aria-pressed={(s.textSize || 'md') === val}
              onClick={() => updateSettings({ textSize: val })}
            >
              {lab}
            </button>
          ))}
        </div>
        <p className="small muted">{t('settings.textSizeSub')}</p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t('settings.dataTitle')}</h3>
        <p className="small muted">{t('settings.dataHint')}</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={() => navigate('/profiles')}>
            👥 {t('settings.switchProfile')}
          </Button>
          <Button variant="soft" onClick={() => navigate('/parent')}>
            🔒 {t('common.forParent')}
          </Button>
        </div>

        {!confirm ? (
          <div style={{ marginTop: 14 }}>
            <Button variant="danger" onClick={() => setConfirm(true)}>
              🗑 {t('settings.reset')}
            </Button>
            <p className="small muted" style={{ marginBottom: 0, marginTop: 6 }}>
              {t('settings.resetSub')}
            </p>
          </div>
        ) : (
          <div className="feedback feedback--tricky" style={{ marginTop: 14 }} role="alert">
            <span className="feedback__emoji">⚠️</span>
            <div>
              <div className="feedback__title">{t('settings.resetTitle')}</div>
              <p className="feedback__text">{t('settings.resetText')}</p>
              <div className="row" style={{ gap: 10, marginTop: 8 }}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    resetDemo();
                    setConfirm(false);
                    navigate('/profiles', { replace: true });
                  }}
                >
                  {t('settings.resetYes')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card card--soft" style={{ marginTop: 16 }}>
        <p className="small muted" style={{ margin: 0 }}>
          Readly · {t('common.demoMode')} · v1.0 · {lang.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
