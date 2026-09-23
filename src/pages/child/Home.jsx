import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { derivedProfile, questProgress } from '../../services/profileService.js';
import { Mascot } from '../../components/ui/Mascots.jsx';
import Button from '../../components/ui/Button.jsx';

export default function Home() {
  const t = useT();
  const navigate = useNavigate();
  const { profile } = useApp();

  useEffect(() => {
    if (!profile) navigate('/profiles', { replace: true });
    else if (!profile.diagnosticDone) navigate('/diagnostic', { replace: true });
  }, [profile, navigate]);

  if (!profile) return null;

  const derived = derivedProfile(profile);
  const quest = questProgress(profile);
  const nextQuestItem = ['letters', 'reading', 'writing', 'game'].find(
    (k) => !profile.dailyQuest?.items?.[k]
  );
  const questDone = quest.done >= quest.total;

  return (
    <div className="page-enter">
      <div className="home-head">
        <div>
          <h1>{t('home.greeting', { name: profile.name })}</h1>
          <p>{questDone ? t('quest.allDoneTitle') : t('home.greetingSub')}</p>
        </div>
        <span className="chip chip--violet" style={{ fontSize: '0.95rem' }}>
          {t(derived.level.nameKey)}
        </span>
      </div>

      <div className="home-grid">
        <div className="adventure-card">
          <span className="label">{t('home.adventureLabel')}</span>
          <h2>{questDone ? t('quest.allDoneTitle') : t('home.adventureTitle')}</h2>
          <div className="quest-mini">
            <div className="quest-dots" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <i key={i} className={i < quest.done ? 'done' : ''} />
              ))}
            </div>
            <span>{t('home.questOf', { done: quest.done, total: quest.total })}</span>
          </div>
          <div style={{ marginTop: 6 }}>
            <Button
              variant="sun"
              size="lg"
              onClick={() => navigate(nextQuestItem ? `/session/${nextQuestItem}` : '/learn')}
            >
              {questDone ? `🎮 ${t('quest.freePractice')}` : `▶ ${t('home.continueQuest')}`}
            </Button>
          </div>
          <div className="adventure-card__mascot" aria-hidden="true">
            <Mascot id={profile.mascot} size={150} />
          </div>
        </div>

        <div className="world-card">
          <span className="label">{t('home.worldLabel')}</span>
          <span className="world-emoji" aria-hidden="true">
            {derived.currentWorld.emoji}
          </span>
          <h3>{t(derived.currentWorld.nameKey)}</h3>
          <p className="sub">
            ⭐ {profile.stars} · {t('home.worldProgress', { stars: profile.stars })}
          </p>
          {derived.next && (
            <p className="sub" style={{ marginTop: 'auto' }}>
              🔓 {t('home.nextWorld', { world: t(derived.next.nameKey), n: derived.next.minStars })}
            </p>
          )}
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: '1.2rem' }}>{t('home.quickActions')}</h2>
      </div>

      <div className="quick-actions">
        <button type="button" className="quick-card" onClick={() => navigate('/read')}>
          <span className="quick-card__icon" style={{ background: 'var(--sun-soft)' }}>
            📖
          </span>
          <span>
            <strong>{t('home.read')}</strong>
            <span>{t('home.readSub')}</span>
          </span>
        </button>
        <button type="button" className="quick-card" onClick={() => navigate('/write')}>
          <span className="quick-card__icon" style={{ background: 'var(--primary-soft)' }}>
            ✏️
          </span>
          <span>
            <strong>{t('home.write')}</strong>
            <span>{t('home.writeSub')}</span>
          </span>
        </button>
        <button type="button" className="quick-card" onClick={() => navigate('/stories')}>
          <span className="quick-card__icon" style={{ background: 'var(--violet-soft)' }}>
            📚
          </span>
          <span>
            <strong>{t('home.stories')}</strong>
            <span>{t('home.storiesSub')}</span>
          </span>
        </button>
      </div>

      <div className="home-strip">
        <div className="mini-tile">
          <span className="mini-tile__ico" aria-hidden="true">
            ⭐
          </span>
          <div>
            <strong>{profile.stars}</strong>
            <span>{t('home.stars')}</span>
          </div>
        </div>
        <div className="mini-tile">
          <span className="mini-tile__ico" aria-hidden="true">
            🔥
          </span>
          <div>
            <strong>{profile.streak}</strong>
            <span>{t('home.streak')}</span>
          </div>
        </div>
        <div className="mini-tile">
          <span className="mini-tile__ico" aria-hidden="true">
            🎯
          </span>
          <div>
            <strong>{quest.done}/{quest.total}</strong>
            <span>{t('quest.title')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
