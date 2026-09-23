import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { questProgress } from '../../services/profileService.js';
import Button from '../../components/ui/Button.jsx';

const ITEMS = [
  { id: 'letters', icon: '🔤', bg: 'var(--sun-soft)', key: 'letters', minutes: 2 },
  { id: 'reading', icon: '📖', bg: 'var(--teal-soft)', key: 'reading', minutes: 3 },
  { id: 'writing', icon: '✏️', bg: 'var(--primary-soft)', key: 'writing', minutes: 2 },
  { id: 'game', icon: '🎮', bg: 'var(--violet-soft)', key: 'game', minutes: 2 },
];

export default function Learn() {
  const t = useT();
  const navigate = useNavigate();
  const { profile } = useApp();

  useEffect(() => {
    if (!profile) navigate('/profiles', { replace: true });
    else if (!profile.diagnosticDone) navigate('/diagnostic', { replace: true });
  }, [profile, navigate]);

  if (!profile) return null;

  const quest = questProgress(profile);
  const items = profile.dailyQuest?.items || {};
  const totalMin = ITEMS.reduce((s, i) => s + i.minutes, 0);

  return (
    <div className="page-enter">
      <div className="section-title">
        <div>
          <h1 style={{ marginBottom: 4 }}>{t('quest.title')}</h1>
          <p className="sub" style={{ margin: 0 }}>
            {t('quest.subtitle', { minutes: totalMin })} · {t('home.questOf', { done: quest.done, total: quest.total })}
          </p>
        </div>
        <span className="chip chip--sun">⭐ {profile.stars}</span>
      </div>

      {quest.done >= quest.total && (
        <div className="feedback feedback--great" style={{ marginBottom: 16 }} role="status">
          <span className="feedback__emoji">🎉</span>
          <div>
            <div className="feedback__title">{t('quest.completeTitle')}</div>
            <p className="feedback__text">{t('quest.completeSub')}</p>
          </div>
        </div>
      )}

      <div className="quest-list">
        {ITEMS.map((item) => {
          const done = !!items[item.id];
          return (
            <button
              key={item.id}
              type="button"
              className={`quest-item ${done ? 'quest-item--done' : ''}`}
              onClick={() => navigate(`/session/${item.id}`)}
            >
              <span className="quest-item__ico" style={{ background: item.bg }}>
                {item.icon}
              </span>
              <span>
                <strong>{t(`quest.${item.key}`)}</strong>
                <span className="meta">
                  {t(`quest.${item.key}Sub`)} · {t('quest.minutes', { n: item.minutes })}
                </span>
              </span>
              <span className="quest-item__state">
                {done ? (
                  <span className="check-circle" aria-label={t('quest.done')}>
                    ✓
                  </span>
                ) : (
                  <span className="quest-item__go" aria-hidden="true">
                    →
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="section-title" style={{ marginTop: 26 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{t('quest.freePractice')}</h2>
          <p className="sub" style={{ margin: 0 }}>
            {t('quest.freePracticeSub')}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="quest-item"
        onClick={() => navigate('/session/practice')}
        style={{ width: '100%' }}
      >
        <span className="quest-item__ico" style={{ background: 'var(--rose-soft)' }}>
          🧩
        </span>
        <span>
          <strong>{t('quest.freePractice')}</strong>
          <span className="meta">{t('session.adaptedNote')}</span>
        </span>
        <span className="quest-item__state">
          <span className="quest-item__go" aria-hidden="true">
            →
          </span>
        </span>
      </button>

      <div className="row" style={{ justifyContent: 'center', marginTop: 22 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/read')}>
          📖 {t('nav.read')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/write')}>
          ✏️ {t('nav.write')}
        </Button>
      </div>
    </div>
  );
}
