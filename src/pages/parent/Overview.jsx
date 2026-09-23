import React from 'react';
import { useT, useI18n } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import {
  derivedProfile,
  learningTimeSeconds,
  weeklyAccuracy,
  commonErrors,
  errorLabelKey,
  moduleLabelKey,
} from '../../services/profileService.js';
import { generateInsights, resolveInsightVars, dailyAccuracy } from '../../services/insights.js';
import { ParentStatCard, Insight } from '../../components/ui/ParentStat.jsx';
import { srsDue } from '../../services/srs.js';
import { formatDate, formatDuration } from '../../utils/dates.js';
import CoachPanel from '../../components/ui/CoachPanel.jsx';

export default function ParentOverview() {
  const t = useT();
  const { lang } = useI18n();
  const { profile } = useApp();

  if (!profile) {
    return (
      <div className="parent-head">
        <div>
          <h1>{t('parent.overviewTitle')}</h1>
          <p>{t('errors.noProgress')}</p>
        </div>
      </div>
    );
  }

  const d = derivedProfile(profile);
  const insights = generateInsights(profile);
  const week = dailyAccuracy(profile, 7);
  const weekAcc = weeklyAccuracy(profile, 6, 0);
  const reading = profile.learning.skills.reading;
  const writing = profile.learning.skills.writing;
  const errors = commonErrors(profile, 5);
  const due = srsDue(profile.learning.difficultWords || []);

  const exerciseCount = (profile.history || []).filter(
    (h) => h.at >= Date.now() - 7 * 86400000
  ).length;

  return (
    <div className="page-enter">
      <div className="parent-head">
        <div>
          <h1>{t('parent.overviewTitle')}</h1>
          <p>{t('parent.overviewSub', { name: profile.name })}</p>
        </div>
        <span className="chip chip--demo">{t('common.demoMode')}</span>
      </div>

      <div className="parent-grid">
        <div className="col-3">
          <ParentStatCard
            icon="⏱️"
            label={t('parent.statTime')}
            value={formatDuration(learningTimeSeconds(profile, 7))}
            hint={t('parent.statTimeHint')}
          />
        </div>
        <div className="col-3">
          <ParentStatCard
            icon="✅"
            label={t('parent.statExercises')}
            value={exerciseCount}
            hint={t('parent.statExercisesHint')}
          />
        </div>
        <div className="col-3">
          <ParentStatCard
            icon="📖"
            label={t('parent.statReading')}
            value={reading?.attempts ? `${Math.round((reading.correct / reading.attempts) * 100)}%` : '—'}
            hint={t('parent.statReadingHint')}
            trend={weekAcc != null ? `${Math.round(weekAcc * 100)}%` : null}
            trendDir="up"
          />
        </div>
        <div className="col-3">
          <ParentStatCard
            icon="✏️"
            label={t('parent.statWriting')}
            value={writing?.attempts ? `${Math.round((writing.correct / writing.attempts) * 100)}%` : '—'}
            hint={t('parent.statWritingHint')}
          />
        </div>

        <div className="col-12">
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

        <div className="col-12">
          <div className="panel">
            <h2>{t('parent.activityTitle')}</h2>
            {(profile.history || []).length ? (
              <ol className="activity-list">
                {(profile.history || []).slice(0, 5).map((item) => (
                  <li key={item.id || item.at} className={item.ok ? 'activity-item' : 'activity-item activity-item--miss'}>
                    <i aria-hidden="true" />
                    <span>
                      <strong>{t(moduleLabelKey(item.module))}</strong>
                      {item.word ? ` · ${item.word}` : ''}
                    </span>
                    <span className="small muted">
                      {item.ok ? t('parent.resultCorrect') : t('parent.resultPartial')} · {formatDate(item.at, lang)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="panel-sub" style={{ marginBottom: 0 }}>
                {t('parent.activityEmpty')}
              </p>
            )}
          </div>
        </div>

        <div className="col-12">
          <CoachPanel kind="parent" profile={profile} />
        </div>

        <div className="col-8">
          <div className="panel">
            <h2>💡 {t('parent.overviewTitle')}</h2>
            <p className="panel-sub">{t('parent.difficultiesSub')}</p>
            <div className="insight-list">
              {insights.map((ins, i) => (
                <Insight key={i} icon={ins.icon}>
                  {t(ins.key, resolveInsightVars(t, ins.vars))}
                </Insight>
              ))}
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="panel">
            <h2>{t('parent.statLevel')}</h2>
            <p className="panel-sub">{t(d.level.nameKey)}</p>
            <div className="stack" style={{ gap: 8 }}>
              <div className="row-between">
                <span className="small muted">{t('parent.statStreak')}</span>
                <strong>🔥 {profile.streak}</strong>
              </div>
              <div className="row-between">
                <span className="small muted">⭐</span>
                <strong>{profile.stars}</strong>
              </div>
              <div className="row-between">
                <span className="small muted">🗺️</span>
                <strong>{t('parent.sessionCount', { n: profile.questsDone || 0 })}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="panel">
            <h2>{t('parent.difficultiesTitle')}</h2>
            <p className="panel-sub">{t('parent.difficultiesSub')}</p>
            {errors.length ? (
              <div className="diff-list">
                {errors.map((e) => (
                  <div className="row-between" key={e.type}>
                    <span className="chip chip--rose">{t(errorLabelKey(e.type))}</span>
                    <strong>×{e.total}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                {t('parent.noneYet')}
              </p>
            )}

            <h2 style={{ marginTop: 20 }}>{t('parent.difficultWords')}</h2>
            <p className="panel-sub">{t('parent.difficultWordsSub')}</p>
            {due.length ? (
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {due.slice(0, 8).map((w) => (
                  <span className="chip" key={w.word}>
                    {w.word}
                  </span>
                ))}
                <span className="chip chip--sun">
                  {due.length} {t('parent.dueToday')}
                </span>
              </div>
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                {t('parent.noneYet')}
              </p>
            )}
          </div>
        </div>

        <div className="col-12">
          <div className="disclaimer">{t('parent.disclaimer')}</div>
        </div>
      </div>
    </div>
  );
}
