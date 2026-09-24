import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { useLearning } from '../../hooks/useLearning.js';
import { useSpeech } from '../../hooks/useSpeech.js';
import { classify } from '../../services/errorAnalyzer.js';
import { buildFeedback, starsForResult } from '../../services/feedbackService.js';
import { FeedbackCard, HintCard } from '../ui/Feedback.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import ChoiceView from './exercises/ChoiceView.jsx';
import LetterGridView from './exercises/LetterGridView.jsx';
import OrderLettersView from './exercises/OrderLettersView.jsx';
import SpellView from './exercises/SpellView.jsx';
import ReadAloudView from './exercises/ReadAloudView.jsx';
import CoachPanel from '../ui/CoachPanel.jsx';

function renderView(ex, props) {
  switch (ex.type) {
    case 'choice':
      return <ChoiceView ex={ex} {...props} onPick={(v) => props.onSubmit(v)} />;
    case 'letterGrid':
      return <LetterGridView ex={ex} {...props} />;
    case 'orderLetters':
      return <OrderLettersView ex={ex} {...props} />;
    case 'readAloud':
      return <ReadAloudView ex={ex} {...props} />;
    default:
      return <SpellView ex={ex} {...props} />;
  }
}

export default function SessionRunner({
  module = 'practice',
  size = 4,
  questItem = null,
  onExit = null,
  initialItems = null,
}) {
  const t = useT();
  const navigate = useNavigate();
  const { settings, profile } = useApp();
  const hintsOn = settings.hints !== false;
  const { say } = useSpeech();
  const { buildSet, recordExercise, finishSession } = useLearning();

  const [items, setItems] = useState(
    () => initialItems || buildSet(module, size)
  );
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('active'); // active | checking | feedback | summary
  const [attempt, setAttempt] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [quitOpen, setQuitOpen] = useState(false);
  const [stats, setStats] = useState({ correct: 0, hints: 0, stars: 0, startedAt: Date.now() });
  const finishedRef = useRef(false);
  const timerRef = useRef(null);

  const ex = items[idx];
  const total = items.length;

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  useEffect(() => {
    if (phase !== 'feedback' || !feedback || settings.speakFeedback === false) return;
    const title = t(feedback.titleKey, feedback.titleVars);
    const body = t(feedback.textKey, feedback.textVars);
    say(`${title}. ${body}`);
  }, [phase, feedback, settings.speakFeedback]);

  const next = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAttempt(1);
    setHintsUsed(0);
    setShowAnswer(false);
    setFeedback(null);
    setLastAnalysis(null);
    setPhase('active');
    setIdx((i) => {
      if (i + 1 >= items.length) {
        setPhase('summary');
        return i;
      }
      return i + 1;
    });
  }, [items.length]);

  const grade = useCallback(
    (value, meta = {}) => {
      if (!ex) return;
      let analysis;
      if (meta.analysis) {
        const a = meta.analysis;
        const ok = a.correct != null ? a.correct >= Math.ceil((a.total || 1) * 0.75) : !!a.ok;
        analysis = {
          ok,
          errors: [],
          types: ok ? [] : ['skipped_word'],
          primary: ok ? null : 'skipped_word',
          wpm: a.wpm,
          reading: a,
        };
      } else if (meta.forcedOk != null) {
        analysis = {
          ok: meta.forcedOk,
          errors: [],
          types: meta.forcedOk ? [] : ['wrong_letter'],
          primary: meta.forcedOk ? null : 'wrong_letter',
        };
      } else if (ex.type === 'sentence' || ex.type === 'creative') {
        const chars = String(value).replace(/\s/g, '').length;
        const ok = chars >= (ex.minChars || 6);
        analysis = {
          ok,
          errors: [],
          types: ok ? [] : ['sentence_structure'],
          primary: ok ? null : 'sentence_structure',
        };
      } else {
        analysis = classify(ex.answer, value, 'word');
      }

      const ok = analysis.ok;
      const stars = starsForResult(ok, hintsUsed, attempt);
      const perExerciseSec = Math.min(180, Math.round((Date.now() - stats.startedAt) / 1000));

      recordExercise({
        module,
        skill: ex.skill || 'spelling',
        kind:
          ex.type === 'sentence' || ex.type === 'creative'
            ? 'sentence'
            : ex.type === 'readAloud'
              ? 'sentence'
              : 'word',
        expected: ex.type === 'sentence' || ex.type === 'creative' ? ex.answer : ex.answer,
        actual: value,
        word: ex.word || (typeof ex.answer === 'string' && ex.answer.length < 20 ? ex.answer : null),
        hints: hintsUsed,
        durationSec: Math.max(10, Math.round(perExerciseSec / Math.max(1, idx + 1))),
        stars,
        analysis,
        wpm: analysis.wpm,
      });

      setStats((s) => ({
        ...s,
        correct: s.correct + (ok ? 1 : 0),
        hints: s.hints + hintsUsed,
        stars: s.stars + stars,
      }));
      setLastAnalysis(analysis);
      setFeedback(buildFeedback(analysis, { hints: hintsUsed, attempt, expected: ex.answer }));
      setPhase('feedback');

      if (ok && timerRef.current) clearTimeout(timerRef.current);
      if (ok) {
        timerRef.current = setTimeout(next, 1800);
      }
    },
    [ex, hintsUsed, attempt, stats.startedAt, idx, recordExercise, module, next]
  );

  /* summary side-effects: award session + quest progress once */
  useEffect(() => {
    if (phase !== 'summary' || finishedRef.current || !ex) return;
    finishedRef.current = true;
    const durationSec = Math.round((Date.now() - stats.startedAt) / 1000);
    finishSession({
      module,
      correct: stats.correct,
      total,
      stars: stats.stars,
      durationSec,
      questItem,
    });
  }, [phase, ex, stats, total, finishSession, module, questItem]);

  const restart = () => {
    finishedRef.current = false;
    setItems(initialItems ? initialItems.map((x) => ({ ...x })) : buildSet(module, size));
    setIdx(0);
    setAttempt(1);
    setHintsUsed(0);
    setShowAnswer(false);
    setFeedback(null);
    setLastAnalysis(null);
    setStats({ correct: 0, hints: 0, stars: 0, startedAt: Date.now() });
    setPhase('active');
  };

  const exit = () => {
    if (onExit) onExit();
    else navigate('/learn', { replace: true });
  };

  const useHint = () => {
    setHintsUsed((h) => h + 1);
    if (hintsUsed + 1 >= (ex?.hints?.length || 0)) setShowAnswer(true);
  };

  const percent = phase === 'summary' ? 100 : ((idx + (phase === 'feedback' && lastAnalysis?.ok ? 1 : 0)) / total) * 100;

  const summaryStars = useMemo(() => {
    const ratio = stats.correct / Math.max(1, total);
    return ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
  }, [stats.correct, total]);

  if (!items.length) {
    return (
      <div className="session">
        <div className="empty">
          <div className="empty__art">🌱</div>
          <div className="empty__title">{t('quest.empty')}</div>
          <Button variant="primary" onClick={exit}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className="session page-enter">
        <div className="card card--pad-xl">
          <div className="summary-hero">
            <div className="summary-hero__art" aria-hidden="true">
              {stats.correct === total ? '🏆' : stats.correct >= total / 2 ? '🌟' : '💪'}
            </div>
            <h1>{t('session.summaryTitle')}</h1>
            <p className="muted" style={{ fontWeight: 700 }}>
              {stats.correct === total
                ? t('session.summaryGreat')
                : stats.correct >= total / 2
                  ? t('session.summaryGood')
                  : t('session.summaryKeep')}
            </p>
            <div className="stars-row" aria-label={t('session.starsEarned')}>
              {[0, 1, 2].map((i) => (
                <span key={i} className={i < summaryStars ? '' : 'off'}>
                  ⭐
                </span>
              ))}
            </div>
          </div>

          <div className="stat-row" style={{ marginTop: 18 }}>
            <div className="stat-tile">
              <div className="stat-tile__value">
                {stats.correct}/{total}
              </div>
              <div className="stat-tile__label">{t('session.correct')}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__value">{stats.hints}</div>
              <div className="stat-tile__label">{t('session.withHints')}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__value">+{stats.stars}</div>
              <div className="stat-tile__label">{t('session.starsEarned')}</div>
            </div>
          </div>

          <p className="center muted" style={{ marginTop: 16, fontWeight: 700 }}>
            🧩 {t('session.adaptedNote')}
          </p>

          <div className="session__actions" style={{ marginTop: 20 }}>
            <Button variant="primary" size="lg" onClick={restart}>
              🔄 {t('session.tryAnother')}
            </Button>
            <Button variant="ghost" onClick={exit}>
              🏠 {t('session.backHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!ex) return null;

  const locked = phase !== 'active';

  return (
    <div className="session page-enter">
      <div className="session__top">
        <button type="button" className="icon-btn" onClick={() => setQuitOpen(true)} aria-label={t('session.quit')}>
          ✕
        </button>
        <div className="progress" aria-label={t('session.step', { current: idx + 1, total })}>
          <div className="progress__fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="exercise__step">
          {t('session.step', { current: idx + 1, total })}
        </span>
      </div>

      <div className="card">
        {phase === 'checking' ? (
          <div className="loading-screen" style={{ minHeight: 320 }}>
            <div className="spinner" aria-hidden="true" />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
              {t('session.checking')}
            </div>
          </div>
        ) : (
          <div key={`${ex.uid}-${attempt}`}>
            {renderView(ex, {
              locked,
              onSubmit: (value, meta) => {
                if (locked) return;
                setPhase('checking');
                setTimeout(() => grade(value, meta), 520);
              },
            })}

            {phase === 'active' && hintsOn && ex.hints?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <HintCard
                  hints={ex.hints}
                  used={hintsUsed}
                  onUse={useHint}
                  onShowAnswer={() => {
                    setHintsUsed((h) => h + 1);
                    setShowAnswer(true);
                  }}
                  showAnswer={showAnswer}
                  answer={ex.answer}
                />
              </div>
            )}

            {phase === 'feedback' && feedback && (
              <div className="stack" style={{ marginTop: 18, gap: 12 }}>
                <FeedbackCard
                  tone={feedback.tone}
                  title={t(feedback.titleKey, feedback.titleVars)}
                  text={t(feedback.textKey, feedback.textVars)}
                />
                {!lastAnalysis?.ok && (
                  <CoachPanel kind="child" analysis={lastAnalysis} profile={profile} />
                )}
                <div className="session__actions">
                  {!lastAnalysis?.ok ? (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (timerRef.current) clearTimeout(timerRef.current);
                          setAttempt((a) => a + 1);
                          setHintsUsed(0);
                          setShowAnswer(false);
                          setFeedback(null);
                          setPhase('active');
                        }}
                      >
                        💪 {t('common.retry')}
                      </Button>
                      <Button variant="ghost" onClick={next}>
                        {idx + 1 >= total ? t('session.finish') : t('common.next')} →
                      </Button>
                    </>
                  ) : (
                    <Button variant="teal" onClick={next} autoFocus>
                      {idx + 1 >= total ? t('session.finish') : t('common.next')} →
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        open={quitOpen}
        onClose={() => setQuitOpen(false)}
        title={t('session.quitTitle')}
        icon="🚪"
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuitOpen(false)}>
              {t('session.keepGoing')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const durationSec = Math.round((Date.now() - stats.startedAt) / 1000);
                const attempted = idx + (phase === 'feedback' ? 1 : 0);
                if (attempted > 0) {
                  finishSession({
                    module,
                    correct: stats.correct,
                    total: attempted,
                    stars: stats.stars,
                    durationSec,
                    questItem: null,
                  });
                }
                finishedRef.current = true;
                exit();
              }}
            >
              {t('session.quitYes')}
            </Button>
          </>
        }
      >
        <p className="muted" style={{ marginBottom: 0 }}>
          {t('session.quitText')}
        </p>
      </Modal>
    </div>
  );
}
