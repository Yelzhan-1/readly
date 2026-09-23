import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { buildWritingExercise } from '../../services/adaptiveEngine.js';
import SessionRunner from '../../components/child/SessionRunner.jsx';

const LENGTH_LEVELS = {
  short: [1, 2],
  medium: [1, 2, 3],
  long: [1, 2, 3, 4],
};

export default function Writing() {
  const t = useT();
  const navigate = useNavigate();
  const { profile, settings } = useApp();

  const items = useMemo(() => {
    if (!profile) return [];
    const tuned = { ...profile, parentDifficulty: settings.difficulty || 'auto' };
    const levels = LENGTH_LEVELS[settings.sessionLength] || LENGTH_LEVELS.medium;
    return levels.map((lv) => buildWritingExercise(tuned, lv));
  }, [profile, settings.difficulty, settings.sessionLength]);

  if (!profile) return null;

  return (
    <div className="page-enter">
      <div className="section-title">
        <div>
          <h1 style={{ marginBottom: 4 }}>{t('writing.title')}</h1>
          <p className="sub" style={{ margin: 0 }}>
            {t('writing.chooseSub')}
          </p>
        </div>
        <span className="chip chip--sun">✏️</span>
      </div>

      <SessionRunner
        key={`${profile.id}-${profile.learning?.difficulty || 1}-${settings.difficulty || 'auto'}-${settings.sessionLength || 'medium'}`}
        module="writing"
        size={3}
        questItem="writing"
        initialItems={items}
        onExit={() => navigate('/home', { replace: true })}
      />
    </div>
  );
}
