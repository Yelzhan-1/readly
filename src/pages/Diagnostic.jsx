import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/index.jsx';
import { useApp } from '../store/AppContext.jsx';
import { buildDiagnostic, seedProfileFromDiagnostic } from '../services/adaptiveEngine.js';
import { classify } from '../services/errorAnalyzer.js';
import { buildFeedback, starsForResult } from '../services/feedbackService.js';
import { applyExerciseResult } from '../services/profileService.js';
import { FeedbackCard } from '../components/ui/Feedback.jsx';
import ChoiceView from '../components/child/exercises/ChoiceView.jsx';
import SpellView from '../components/child/exercises/SpellView.jsx';
import ReadAloudView from '../components/child/exercises/ReadAloudView.jsx';
import Button from '../components/ui/Button.jsx';
import { Logo, Mascot } from '../components/ui/Mascots.jsx';

export default function Diagnostic() {
  const t = useT();
  const navigate = useNavigate();
  const { profile, mutateProfile } = useApp();

  const [phase, setPhase] = useState('intro');
  const [tasks, setTasks] = useState(() => (profile ? buildDiagnostic(profile) : []));
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [lastOk, setLastOk] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!profile) navigate('/profiles', { replace: true });
    else if (profile.diagnosticDone && phase === 'intro') navigate('/home', { replace: true });
  }, [profile, phase, navigate]);

  useEffect(() => {
    if (profile && !tasks.length) setTasks(buildDiagnostic(profile));
  }, [profile, tasks.length]);

  if (!profile) return null;

  const task = tasks[idx];

  const advance = () => {
    setFeedback(null);
    if (idx + 1 >= tasks.length) {
      finish();
      return;
    }
    setIdx((i) => i + 1);
  };

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase('done');

    const skills = seedProfileFromDiagnostic(results);
    const score = results.filter((r) => r.ok).length;

    mutateProfile(profile.id, (p) => {
      const working = JSON.parse(JSON.stringify(p));
      Object.entries(skills).forEach(([k, v]) => {
        working.learning.skills[k] = v;
      });
      working.learning.difficulty = score >= 5 ? 2 : 1;
      working.diagnosticDone = true;
      working.stars += 10;
      return working;
    });
  };

  const handleSubmit = (value, meta = {}) => {
    if (phase !== 'tasks') return;
    setPhase('checking');

    setTimeout(() => {
      let analysis;
      if (meta.analysis) {
        const a = meta.analysis;
        const ok = a.correct != null ? a.correct >= Math.ceil((a.total || 1) * 0.75) : true;
        analysis = { ok, errors: [], types: ok ? [] : ['skipped_word'], primary: ok ? null : 'skipped_word' };
      } else {
        analysis = classify(task.answer, value, 'word');
      }
      const ok = analysis.ok;

      // record into the live profile as a real first touch-point
      const working = JSON.parse(JSON.stringify(profile));
      applyExerciseResult(working, {
        module: 'diagnostic',
        skill: task.skill || 'spelling',
        kind: 'word',
        expected: task.answer,
        actual: value,
        word: task.word || (typeof task.answer === 'string' ? task.answer : null),
        hints: 0,
        durationSec: 15,
        stars: starsForResult(ok, 0, 1),
        analysis,
      });
      mutateProfile(profile.id, () => working);

      setResults((r) => [...r, { skill: task.skill, ok }]);
      setLastOk(ok);
      setFeedback(buildFeedback(analysis, { hints: 0, attempt: 1, expected: task.answer }));
      setPhase('feedback');
    }, 520);
  };

  /* ---------- intro ---------- */
  if (phase === 'intro') {
    return (
      <div className="diagnostic page-enter">
        <div className="row-between" style={{ marginBottom: 20 }}>
          <Logo size={36} />
          <span className="chip chip--demo">{t('common.demoMode')}</span>
        </div>
        <div className="diagnostic__intro">
          <Mascot id={profile.mascot} size={170} />
          <h1 style={{ marginBottom: 0 }}>{t('diagnostic.introTitle')}</h1>
          <p className="muted" style={{ fontWeight: 600, maxWidth: '40ch' }}>
            {t('diagnostic.introSub')}
          </p>
          <Button variant="primary" size="lg" onClick={() => setPhase('tasks')}>
            🌍 {t('diagnostic.introCta')}
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- done ---------- */
  if (phase === 'done') {
    return (
      <div className="diagnostic page-enter">
        <div className="diagnostic__intro" style={{ paddingTop: 60 }}>
          <div style={{ fontSize: '4.5rem', animation: 'starBurst 0.5s ease both' }}>🦖</div>
          <h1>{t('diagnostic.unlockedTitle', { world: t('worlds.dino') })}</h1>
          <p className="muted" style={{ fontWeight: 600 }}>
            {t('diagnostic.unlockedSub')}
          </p>
          <div className="stars-row" aria-hidden="true">
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>
          <Button variant="primary" size="lg" onClick={() => navigate('/home', { replace: true })}>
            🎒 {t('diagnostic.startBtn')}
          </Button>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const checking = phase === 'checking';
  const percent = ((idx + (phase === 'feedback' ? 1 : 0)) / tasks.length) * 100;

  const viewProps = {
    locked: checking || phase === 'feedback',
    onSubmit: handleSubmit,
  };

  let view;
  if (task.type === 'choice') view = <ChoiceView ex={task} {...viewProps} onPick={handleSubmit} />;
  else if (task.type === 'readAloud') view = <ReadAloudView ex={task} {...viewProps} />;
  else view = <SpellView ex={task} {...viewProps} />;

  return (
    <div className="diagnostic page-enter">
      <div className="diagnostic__bar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/profiles')}
          aria-label={t('common.close')}
        >
          ✕
        </button>
        <div className="progress" aria-label={t('diagnostic.progress')}>
          <div className="progress__fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="exercise__step">
          {t('session.step', { current: idx + 1, total: tasks.length })}
        </span>
      </div>

      <div className="card">
        {checking ? (
          <div className="loading-screen" style={{ minHeight: 300 }}>
            <div className="spinner" aria-hidden="true" />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
              {t('diagnostic.checking')}
            </div>
          </div>
        ) : (
          <div key={task.uid}>
            {view}
            {phase === 'feedback' && feedback && (
              <div className="stack" style={{ marginTop: 18, gap: 12 }}>
                <FeedbackCard
                  tone={feedback.tone}
                  title={t(feedback.titleKey, feedback.titleVars)}
                  text={t(feedback.textKey, feedback.textVars)}
                />
                <div className="session__actions">
                  <Button variant="primary" onClick={advance} autoFocus>
                    {idx + 1 >= tasks.length ? t('session.finish') : t('common.next')} →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <span className="sr-only">{lastOk ? 'ok' : 'retry'}</span>
    </div>
  );
}
