import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { STORIES } from '../../data/stories.js';
import { EmptyState } from '../../components/ui/Empty.jsx';

function levelKey(n) {
  if (n <= 1) return 'easy';
  if (n === 2) return 'medium';
  return 'hard';
}

function storyWords(s) {
  return (s.sentences || []).join(' ').split(/\s+/).filter(Boolean).length;
}

function storyMinutes(s) {
  if (s.minutes) return s.minutes;
  return Math.max(1, Math.ceil(storyWords(s) / 40));
}

export default function ReadingList() {
  const t = useT();
  const navigate = useNavigate();
  const { profile, state } = useApp();

  useEffect(() => {
    if (!profile) navigate('/profiles', { replace: true });
    else if (!profile.diagnosticDone) navigate('/diagnostic', { replace: true });
  }, [profile, navigate]);

  if (!profile) return null;

  const custom = state.stories.filter((s) => s.owner === profile.id);
  const open = (id) => navigate(`/read/${id}`);

  return (
    <div className="page-enter">
      <div className="section-title">
        <div>
          <h1 style={{ marginBottom: 4 }}>{t('reading.title')}</h1>
          <p className="sub" style={{ margin: 0 }}>
            {t('reading.chooseSub')}
          </p>
        </div>
        <span className="chip chip--teal">📖 {t('reading.chip', { n: profile.readStories || 0 })}</span>
      </div>

      <div className="story-grid">
        {STORIES.map((s) => (
          <button key={s.id} type="button" className="story-card" onClick={() => open(s.id)}>
            <span className="story-card__art" style={{ background: s.tint }} aria-hidden="true">
              {s.emoji}
            </span>
            <h3>{s.title}</h3>
            <p>
              {t(`reading.levels.${levelKey(s.level)}`)} · {t('reading.words', { n: storyWords(s) })} ·{' '}
              {storyMinutes(s)} {t('reading.min')}
            </p>
          </button>
        ))}

        {custom.map((s) => (
          <button key={s.id} type="button" className="story-card" onClick={() => open(s.id)}>
            <span className="story-card__art" style={{ background: s.tint || 'var(--sun-soft)' }} aria-hidden="true">
              {s.emoji || '✨'}
            </span>
            <h3>{s.title}</h3>
            <p>
              {t('reading.custom')} · {storyMinutes(s)} {t('reading.min')}
            </p>
          </button>
        ))}
      </div>

      {!STORIES.length && !custom.length && (
        <EmptyState
          art="📚"
          title={t('stories.empty')}
          sub={t('stories.emptySub')}
          actionLabel={t('stories.newStory')}
          onAction={() => navigate('/stories')}
        />
      )}
    </div>
  );
}
