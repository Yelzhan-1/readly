import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useI18n } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { INTERESTS } from '../../data/interests.js';
import Button from '../../components/ui/Button.jsx';
import ParentCloudAccount from '../../components/parent/ParentCloudAccount.jsx';

const GOALS = [
  ['letters', 'parent.goalLetters'],
  ['reading', 'parent.goalReading'],
  ['writing', 'parent.goalWriting'],
];

const SESSIONS = [
  ['short', 'parent.sessionShort'],
  ['medium', 'parent.sessionMedium'],
  ['long', 'parent.sessionLong'],
];

const DIFFS = [
  ['auto', 'parent.diffAuto'],
  ['easy', 'parent.diffEasy'],
  ['hard', 'parent.diffHard'],
];

export default function ParentSettings() {
  const t = useT();
  const { lang, setLang, languages } = useI18n();
  const navigate = useNavigate();
  const { profile, mutateProfile, updateSettings, setParentUnlocked, state, pushToast } = useApp();
  const s = state.settings;

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(String(profile?.age || 6));
  const [interests, setInterests] = useState(profile?.interests || []);
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const toggle = (list, setList, id) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const save = () => {
    mutateProfile(profile.id, (p) => ({
      ...p,
      name: name.trim() || p.name,
      age: Number(age) || p.age,
      interests,
    }));
    setSaved(true);
    pushToast({ icon: '✅', text: t('parent.saved'), tone: 'success' });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-enter">
      <div className="parent-head">
        <div>
          <h1>{t('parent.settingsTitle')}</h1>
          <p>{t('parent.settingsSub')}</p>
          <ParentCloudAccount />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setParentUnlocked(false);
            navigate('/home');
          }}
        >
          👋 {t('parent.exitToChild')}
        </Button>
      </div>

      <div className="parent-grid">
        <div className="col-6">
          <div className="panel">
            <h2>{t('common.hello')} 👋</h2>
            <p className="panel-sub">{t('parent.settingsSub')}</p>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="ps-name">{t('parent.settingsName')}</label>
                <input
                  id="ps-name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={18}
                />
              </div>
              <div className="field">
                <label htmlFor="ps-age">{t('parent.settingsAge')}</label>
                <select
                  id="ps-age"
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
            </div>

            <div className="field">
              <label htmlFor="ps-lang">{t('parent.settingsLanguage')}</label>
              <select
                id="ps-lang"
                className="select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="ps-goal">{t('parent.settingsGoals')}</label>
              <select
                id="ps-goal"
                className="select"
                value={
                  s.goals?.length === 3
                    ? 'all'
                    : s.goals?.[0] || 'letters'
                }
                onChange={(e) =>
                  updateSettings({
                    goals:
                      e.target.value === 'all'
                        ? ['letters', 'reading', 'writing']
                        : [e.target.value],
                  })
                }
              >
                <option value="all">{t('parent.goalAll')}</option>
                {GOALS.map(([id, key]) => (
                  <option key={id} value={id}>
                    {t(key)}
                  </option>
                ))}
              </select>
              <span className="small muted">{t('parent.settingsGoalsHint')}</span>
            </div>

            <div className="field">
              <label htmlFor="ps-session">{t('parent.settingsSession')}</label>
              <select
                id="ps-session"
                className="select"
                value={s.sessionLength || 'medium'}
                onChange={(e) => updateSettings({ sessionLength: e.target.value })}
              >
                {SESSIONS.map(([id, key]) => (
                  <option key={id} value={id}>
                    {t(key)}
                  </option>
                ))}
              </select>
              <span className="small muted">{t('parent.settingsSessionHint')}</span>
            </div>

            <div className="field">
              <label htmlFor="ps-diff">{t('parent.settingsDifficulty')}</label>
              <select
                id="ps-diff"
                className="select"
                value={s.difficulty || 'auto'}
                onChange={(e) => updateSettings({ difficulty: e.target.value })}
              >
                {DIFFS.map(([id, key]) => (
                  <option key={id} value={id}>
                    {t(key)}
                  </option>
                ))}
              </select>
              <span className="small muted">{t('parent.settingsDifficultyHint')}</span>
            </div>

            <div className="row" style={{ gap: 10, marginTop: 8 }}>
              <Button variant="primary" onClick={save}>
                💾 {t('parent.saveChanges')}
              </Button>
              {saved && (
                <span style={{ color: 'var(--teal)', fontWeight: 800 }} role="status">
                  {t('parent.saved')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="panel">
            <h2>{t('parent.settingsInterests')}</h2>
            <p className="panel-sub">{t('parent.settingsInterestsSub')}</p>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              {INTERESTS.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  className={`chip ${interests.includes(it.id) ? 'chip--teal' : ''}`}
                  aria-pressed={interests.includes(it.id)}
                  onClick={() => toggle(interests, setInterests, it.id)}
                  style={{ cursor: 'pointer', fontSize: '0.95rem', padding: '8px 12px' }}
                >
                  {it.emoji} {t(`interests.${it.id}`)}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="row-between">
                <span>
                  <strong style={{ display: 'block' }}>
                    {t('parent.settingsReminder')}{' '}
                    <span className="chip">{t('common.comingSoon')}</span>
                  </strong>
                  <span className="small muted">{t('parent.settingsReminderSub')}</span>
                </span>
                <span className="switch" role="switch" aria-checked="false" aria-disabled="true">
                  <input id="ps-rem" type="checkbox" checked={false} disabled />
                </span>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="row-between" htmlFor="ps-motion" style={{ cursor: 'pointer' }}>
                <span>
                  <strong style={{ display: 'block' }}>{t('parent.settingsMotion')}</strong>
                  <span className="small muted">{t('settings.reduceMotionHint')}</span>
                </span>
                <span className="switch" role="switch" aria-checked={!!s.reducedMotion}>
                  <input
                    id="ps-motion"
                    type="checkbox"
                    checked={!!s.reducedMotion}
                    onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                  />
                </span>
              </label>
            </div>

            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="ps-size">{t('parent.settingsTextSize')}</label>
              <select
                id="ps-size"
                className="select"
                value={s.textSize || 'md'}
                onChange={(e) => updateSettings({ textSize: e.target.value })}
              >
                <option value="sm">{t('settings.sizeSm')}</option>
                <option value="md">{t('settings.sizeMd')}</option>
                <option value="lg">{t('settings.sizeLg')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="disclaimer">{t('parent.disclaimer')}</div>
        </div>
      </div>
    </div>
  );
}
