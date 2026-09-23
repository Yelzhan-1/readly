import React, { useEffect, useState } from 'react';
import { useT } from '../../i18n/index.jsx';
import { demoCoach, resolveCoach } from '../../services/aiCoach.js';

export default function CoachPanel({ kind = 'child', analysis = null, profile = null, topic = '' }) {
  const t = useT();
  const [tip, setTip] = useState(() => demoCoach({ kind, analysis, profile, topic }));

  const errorType = analysis?.primary || analysis?.types?.[0] || '';
  const signature = [
    kind,
    errorType,
    profile?.id || '',
    profile?.name || '',
    (profile?.history || []).length,
    topic,
  ].join('|');

  useEffect(() => {
    let live = true;
    const input = { kind, analysis, profile, topic };
    setTip(demoCoach(input));
    resolveCoach(input).then((next) => {
      if (live) setTip(next);
    });
    return () => {
      live = false;
    };
    // signature is the stable snapshot of the inputs above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const lead =
    kind === 'parent' ? t('coach.parentLead') : kind === 'story' ? t('coach.storyLead') : t('coach.childLead');

  return (
    <aside className={`coach-panel coach-panel--${kind}`} aria-live="polite">
      <div className="coach-panel__head">
        <strong>{t('coach.title')}</strong>
        <span className={`chip ${tip.mode === 'live' ? 'chip--teal' : 'chip--demo'}`}>
          {tip.mode === 'live' ? t('coach.live') : t('coach.demo')}
        </span>
      </div>
      <p className="coach-panel__lead">{lead}</p>
      <p className="coach-panel__text">{t(tip.key, tip.vars)}</p>
    </aside>
  );
}
