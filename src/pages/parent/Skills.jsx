import React from 'react';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { skillLabelKey, errorLabelKey, commonErrors, focusErrorType } from '../../services/profileService.js';
import { skillSnapshots } from '../../services/insights.js';
import { ProgressBar } from '../../components/ui/Progress.jsx';

export default function ParentSkills() {
  const t = useT();
  const { profile } = useApp();

  if (!profile) return null;
  const snaps = skillSnapshots(profile);
  const errors = commonErrors(profile, 8);
  const focus = focusErrorType(profile);

  return (
    <div className="page-enter">
      <div className="parent-head">
        <div>
          <h1>{t('parent.skillsTitle')}</h1>
          <p>{t('parent.skillsSub')}</p>
        </div>
        {focus && <span className="chip chip--sun">🎯 {t(errorLabelKey(focus))}</span>}
      </div>

      <div className="parent-grid">
        <div className="col-8">
          <div className="panel">
            <h2>{t('parent.skillLetter')} … {t('parent.skillWriting')}</h2>
            <p className="panel-sub">{t('parent.skillsSub')}</p>
            {snaps.map((s) => (
              <div className="skill-row" key={s.skill}>
                <span className="skill-row__name">{t(s.labelKey)}</span>
                <div className="progress">
                  <div
                    className="progress__fill"
                    style={{ width: `${s.now != null ? Math.round(s.now * 100) : 0}%` }}
                  />
                </div>
                <span className="skill-row__val">
                  {s.now != null ? `${Math.round(s.now * 100)}%` : '—'}
                </span>
              </div>
            ))}
            <p className="small muted" style={{ marginBottom: 0, marginTop: 10 }}>
              {t('parent.skillsNote')}
            </p>
          </div>
        </div>

        <div className="col-4">
          <div className="panel">
            <h2>{t('parent.difficultiesTitle')}</h2>
            <p className="panel-sub">{t('parent.difficultiesSub')}</p>
            {errors.length ? (
              <div className="diff-list">
                {errors.map((e) => (
                  <div className="row-between" key={e.type}>
                    <span>{t(errorLabelKey(e.type))}</span>
                    <strong>×{e.total}</strong>
                  </div>
                ))}
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
