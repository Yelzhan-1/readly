import React from 'react';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { weeklyAccuracy, SKILLS } from '../../services/profileService.js';
import { skillSnapshots, dailyAccuracy } from '../../services/insights.js';
import { skillLabelKey } from '../../services/profileService.js';
import { ParentStatCard } from '../../components/ui/ParentStat.jsx';

export default function ParentProgress() {
  const t = useT();
  const { profile } = useApp();

  const history = (profile && profile.history) || [];
  const viewed = profile ? { ...profile, history } : null;
  const thisWeek = viewed ? weeklyAccuracy(viewed, 6, 0) : null;
  const lastWeek = viewed ? weeklyAccuracy(viewed, 13, 7) : null;
  const snaps = viewed ? skillSnapshots(viewed) : [];
  const week = viewed ? dailyAccuracy(viewed, 7) : [];

  return (
    <div className="page-enter">
      <div className="parent-head">
        <div>
          <h1>{t('parent.progressTitle')}</h1>
          <p>{t('parent.progressSub')}</p>
        </div>
      </div>

      <div className="parent-grid">
        <div className="col-4">
          <ParentStatCard
            icon="🎯"
            label={t('parent.thisWeek')}
            value={thisWeek != null ? `${Math.round(thisWeek * 100)}%` : '—'}
            hint={t('parent.statReadingHint')}
          />
        </div>
        <div className="col-4">
          <ParentStatCard
            icon="📅"
            label={t('parent.lastWeek')}
            value={lastWeek != null ? `${Math.round(lastWeek * 100)}%` : '—'}
            hint={t('parent.statReadingHint')}
            trend={
              thisWeek != null && lastWeek != null
                ? t('parent.weekDelta', {
                    from: Math.round(lastWeek * 100),
                    to: Math.round(thisWeek * 100),
                  })
                : null
            }
            trendDir={
              thisWeek != null && lastWeek != null
                ? thisWeek > lastWeek
                  ? 'up'
                  : thisWeek < lastWeek
                    ? 'down'
                    : 'flat'
                : null
            }
          />
        </div>
        <div className="col-4">
          <ParentStatCard
            icon="⭐"
            label={t('parent.statLevel')}
            value={profile ? profile.stars : 0}
            hint={t('home.stars')}
          />
        </div>

        <div className="col-6">
          <div className="panel">
            <h2>{t('parent.weeklyChart')}</h2>
            <p className="panel-sub">{t('parent.weeklyChartSub')}</p>
            {week.some((x) => x.value != null) ? (
              <div className="bars">
                {week.map((day, i) => (
                  <div className="bars__col" key={i}>
                    <div className="bars__val">{day.value != null ? `${day.value}%` : '·'}</div>
                    <div className="bars__bar" style={{ height: `${day.value || 4}%` }}>
                      {day.n > 0 && <span className="bars__label">{day.label}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                {t('parent.chartEmpty')}
              </p>
            )}
          </div>
        </div>

        <div className="col-6">
          <div className="panel">
            <h2>{t('parent.skillsTitle')}</h2>
            <p className="panel-sub">{t('parent.skillsSub')}</p>
            {snaps.map((s) => {
              const nowPct = s.now != null ? Math.round(s.now * 100) : null;
              const prevPct = s.prev != null ? Math.round(s.prev * 100) : null;
              const dir =
                nowPct != null && prevPct != null
                  ? nowPct > prevPct
                    ? 'up'
                    : nowPct < prevPct
                      ? 'down'
                      : 'flat'
                  : null;
              return (
                <div className="compare" key={s.skill}>
                  <span className="compare__name">{t(skillLabelKey(s.skill))}</span>
                  <span className="compare__vals">
                    <span className="from">{prevPct != null ? `${prevPct}%` : '—'}</span> →{' '}
                    <strong>{nowPct != null ? `${nowPct}%` : '—'}</strong>
                  </span>
                  <span className={`trend trend--${dir || 'flat'}`}>
                    {dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→'} {t('parent.attempts', { n: s.attempts })}
                  </span>
                </div>
              );
            })}
            <p className="small muted" style={{ marginBottom: 0, marginTop: 12 }}>
              {t('parent.skillsNote')}
            </p>
          </div>
        </div>

        <div className="col-12">
          <div className="disclaimer">{t('parent.disclaimer')}</div>
        </div>
      </div>
      <span className="sr-only">{SKILLS.length}</span>
    </div>
  );
}
