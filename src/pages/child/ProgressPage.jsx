import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import {
  derivedProfile,
  commonErrors,
  focusErrorType,
  weeklyAccuracy,
  errorLabelKey,
  SKILLS,
} from '../../services/profileService.js';
import { ProgressBar } from '../../components/ui/Progress.jsx';
import { StatTile, AchievementBadge } from '../../components/ui/Badges.jsx';
import { BADGES } from '../../data/badges.js';
import Button from '../../components/ui/Button.jsx';
import { Mascot } from '../../components/ui/Mascots.jsx';

const SKILL_LABEL = {
  letterRecognition: 'parent.skillLetter',
  spelling: 'parent.skillSpelling',
  reading: 'parent.skillReading',
  comprehension: 'parent.skillComprehension',
  writing: 'parent.skillWriting',
};

export default function ProgressPage() {
  const t = useT();
  const navigate = useNavigate();
  const { profile } = useApp();

  if (!profile) return null;

  const d = derivedProfile(profile);
  const errors = commonErrors(profile).slice(0, 4);
  const focus = focusErrorType(profile);
  const acc = weeklyAccuracy(profile, 6, 0);
  const earned = (profile.badges || []).filter((b) => !b.startsWith('__'));

  return (
    <div className="page-enter">
      <div className="section-title">
        <div>
          <h1 style={{ marginBottom: 4 }}>{t('progress.title')}</h1>
          <p className="sub" style={{ margin: 0 }}>
            {t('progress.sub')}
          </p>
        </div>
        <Mascot id={profile.mascot} size={64} />
      </div>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <StatTile icon="⭐" value={profile.stars} label={t('home.stars')} />
        <StatTile icon="🔥" value={profile.streak} label={t('home.streak')} />
        <StatTile icon="🎯" value={acc != null ? `${Math.round(acc * 100)}%` : '—'} label={t('progress.weeklyAcc')} />
        <StatTile icon="📖" value={profile.readStories || 0} label={t('progress.statsStories')} />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ marginBottom: 8 }}>
          <strong style={{ fontFamily: 'var(--font-display)' }}>{t(d.level.nameKey)}</strong>
          <span className="small muted">
            {profile.stars} / {d.next ? d.next.minStars : d.level.minStars} ⭐
          </span>
        </div>
        <ProgressBar value={d.levelPercent} />
        <p className="small muted" style={{ marginBottom: 0, marginTop: 8 }}>
          {d.next
            ? t('progress.toNext', { n: d.next.minStars - profile.stars, level: t(d.next.nameKey) })
            : t('progress.maxLevel')}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t('progress.skillRadar')}</h3>
        {SKILLS.map((k) => {
          const s = profile.learning?.skills?.[k];
          const attempts = s?.attempts || 0;
          const okRate = attempts ? Math.round((s.correct / attempts) * 100) : 0;
          return (
            <div key={k} className="skill-row">
              <span className="skill-row__name">{t(SKILL_LABEL[k])}</span>
              <div className="progress">
                <div className="progress__fill" style={{ width: `${attempts ? okRate : 0}%` }} />
              </div>
              <span className="skill-row__val">{attempts ? `${okRate}%` : '—'}</span>
            </div>
          );
        })}
        {focus && (
          <p className="small" style={{ marginBottom: 0, marginTop: 10 }}>
            🎯 {t('progress.focus')}: <strong>{t(errorLabelKey(focus))}</strong>
          </p>
        )}
      </div>

      {errors.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>{t('progress.commonErrors')}</h3>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {errors.map((e) => (
              <span key={e.type} className="chip chip--rose">
                {t(errorLabelKey(e.type))} · {e.count || e.total}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t('progress.badges')}</h3>
        <div className="badges-wrap">
          {BADGES.map((b) => (
            <AchievementBadge
              key={b.id}
              icon={b.icon}
              name={t(b.nameKey)}
              desc={t(b.descKey)}
              locked={!earned.includes(b.id)}
            />
          ))}
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'center', marginTop: 20 }}>
        <Button variant="primary" onClick={() => navigate('/learn')}>
          ▶ {t('nav.learn')}
        </Button>
      </div>
    </div>
  );
}
