import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { useLearning } from '../../hooks/useLearning.js';
import { INTERESTS } from '../../data/interests.js';
import Button from '../../components/ui/Button.jsx';
import { LoadingScreen } from '../../components/ui/Empty.jsx';
import { Mascot } from '../../components/ui/Mascots.jsx';
import CoachPanel from '../../components/ui/CoachPanel.jsx';

export default function Stories() {
  const t = useT();
  const navigate = useNavigate();
  const { profile, state } = useApp();
  const { makeStory } = useLearning();

  const [topic, setTopic] = useState(profile?.interests?.[0] || 'dinosaur');
  const [name, setName] = useState(profile?.name || '');
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState(null);

  if (!profile) return null;

  const create = async () => {
    setBusy(true);
    setMade(null);
    try {
      await new Promise((r) => setTimeout(r, 700));
      const story = makeStory({
        seedMix: Math.floor(Math.random() * 9999),
        interest: topic,
        name: name.trim() || profile.name,
      });
      setMade(story);
    } finally {
      setBusy(false);
    }
  };

  const mine = state.stories.filter((s) => s.owner === profile.id);

  return (
    <div className="page-enter stories-page">
      <div className="section-title">
        <div>
          <h1 style={{ marginBottom: 4 }}>{t('stories.title')}</h1>
          <p className="sub" style={{ margin: 0 }}>
            {t('stories.sub')}
          </p>
        </div>
        <Mascot id={profile.mascot} size={64} />
      </div>

      <CoachPanel
        kind="story"
        profile={profile}
        topic={t(`interests.${topic}`)}
      />

      <div className="card">
        <div className="field">
          <label htmlFor="st-topic">{t('stories.topicLabel')}</label>
          <select
            id="st-topic"
            className="select"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            {INTERESTS.map((it) => (
              <option key={it.id} value={it.id}>
                {it.emoji} {t(`interests.${it.id}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="st-name">{t('stories.nameLabel')}</label>
          <input
            id="st-name"
            className="input"
            value={name}
            placeholder={profile.name}
            onChange={(e) => setName(e.target.value)}
            maxLength={18}
          />
        </div>

        <Button variant="primary" size="lg" onClick={create} disabled={busy}>
          ✨ {t('stories.create')}
        </Button>

        {busy && (
          <div style={{ marginTop: 16 }}>
            <LoadingScreen title={t('stories.generating')} />
          </div>
        )}

        {made && !busy && (
          <div className="feedback feedback--great" style={{ marginTop: 16 }} role="status">
            <span className="feedback__emoji">🎉</span>
            <div>
              <div className="feedback__title">{t('stories.readyTitle')}</div>
              <p className="feedback__text">
                {t('stories.readySub')}{' '}
                <button
                  type="button"
                  className="linklike"
                  onClick={() => navigate(`/read/${made.id}`)}
                >
                  {t('stories.openStory')}
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      {mine.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: '1.15rem', margin: 0 }}>{t('stories.mine')}</h2>
          </div>
          <div className="story-grid">
            {mine.map((s) => (
              <button
                key={s.id}
                type="button"
                className="story-card"
                onClick={() => navigate(`/read/${s.id}`)}
              >
                <span
                  className="story-card__art"
                  style={{ background: s.tint || 'var(--sun-soft)' }}
                  aria-hidden="true"
                >
                  {s.emoji || '✨'}
                </span>
                <h3>{s.title}</h3>
                <p>
                  {t('reading.custom')} · {Math.max(1, Math.ceil((s.sentences || []).join(' ').split(/\s+/).length / 40))}{' '}
                  {t('reading.min')}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
