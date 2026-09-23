import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { buildWritingExercise } from '../../services/adaptiveEngine.js';
import SessionRunner from '../../components/child/SessionRunner.jsx';

export default function Writing() {
  const t = useT();
  const navigate = useNavigate();
  const { profile } = useApp();

  const items = useMemo(() => {
    if (!profile) return [];
    return [1, 2, 3].map((lv) => buildWritingExercise(profile, lv));
  }, [profile]);

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
        key={profile.id + (profile.learning?.difficulty || 1)}
        module="writing"
        size={3}
        questItem="writing"
        initialItems={items}
        onExit={() => navigate('/home', { replace: true })}
      />
    </div>
  );
}
