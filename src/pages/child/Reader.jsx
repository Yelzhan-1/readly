import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { useLearning } from '../../hooks/useLearning.js';
import { useSpeech } from '../../hooks/useSpeech.js';
import { STORIES } from '../../data/stories.js';
import Button from '../../components/ui/Button.jsx';
import { ProgressBar } from '../../components/ui/Progress.jsx';
import { FeedbackCard } from '../../components/ui/Feedback.jsx';
import { Mascot } from '../../components/ui/Mascots.jsx';

function levelKey(n) {
  if (n <= 1) return 'easy';
  if (n === 2) return 'medium';
  return 'hard';
}

function splitSentences(s) {
  return String(s || '').split(/\s+/).filter(Boolean);
}

export default function Reader() {
  const t = useT();
  const navigate = useNavigate();
  const { storyId } = useParams();
  const { profile, state } = useApp();
  const { completeStory, recordExercise } = useLearning();
  const { say } = useSpeech();

  const all = [...STORIES, ...state.stories.filter((s) => s.owner === profile?.id)];
  const story = all.find((s) => s.id === storyId);
  const sentences = story?.sentences || [];
  const questions = story?.questions || [];

  const totalWords = sentences.reduce((s, line) => s + splitSentences(line).length, 0);

  const [phase, setPhase] = useState('read'); // read | quiz | done
  const [spoken, setSpoken] = useState(() => new Set());
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const celebratedRef = useRef(false);

  useEffect(() => {
    if (!profile) navigate('/profiles', { replace: true });
    else if (!story) navigate('/read', { replace: true });
  }, [profile, story, navigate]);

  useEffect(() => () => setPhase('read'), [storyId]);

  if (!profile || !story) return null;

  const celebrate = () => {
    if (celebratedRef.current) return;
    celebratedRef.current = true;
    completeStory();
  };

  const tapWord = (key, word) => {
    say(word);
    setSpoken((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const finishReading = () => {
    celebrate();
    if (questions.length) {
      setPhase('quiz');
      setQi(0);
      setPicked(null);
      setQuizFeedback(null);
    } else {
      setPhase('done');
    }
  };

  const answerQuestion = (opt) => {
    if (picked) return;
    const q = questions[qi];
    const ok = String(opt).toLowerCase() === String(q.answer).toLowerCase();
    setPicked(opt);
    setQuizFeedback(
      ok
        ? { tone: 'great', title: t('reader.right'), text: '' }
        : { tone: 'almost', title: t('reader.wrong', { answer: q.answer }), text: '' }
    );
    recordExercise({
      module: 'reading',
      skill: 'comprehension',
      kind: 'word',
      expected: q.answer,
      actual: opt,
      word: null,
      hints: 0,
      durationSec: 20,
      stars: ok ? 3 : 0,
      analysis: {
        ok,
        errors: [],
        types: ok ? [] : ['word_substitution'],
        primary: ok ? null : 'word_substitution',
      },
    });
  };

  const nextQuestion = () => {
    if (qi + 1 >= questions.length) {
      setPhase('done');
      return;
    }
    setQi((i) => i + 1);
    setPicked(null);
    setQuizFeedback(null);
  };

  const percent = totalWords ? Math.min(100, (spoken.size / totalWords) * 100) : 0;

  /* ---------- done ---------- */
  if (phase === 'done') {
    return (
      <div className="page-enter" style={{ paddingTop: 20 }}>
        <div className="card" style={{ textAlign: 'center', padding: 30 }}>
          <div style={{ fontSize: '3.5rem' }}>🎉</div>
          <h1 style={{ margin: '10px 0 6px' }}>{t('reader.doneTitle')}</h1>
          <p className="muted" style={{ fontWeight: 600 }}>
            {t('reader.doneSub', { n: 6 })}
          </p>
          <div className="stars-row" aria-hidden="true">
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>
          <div className="row" style={{ gap: 12, justifyContent: 'center', marginTop: 14 }}>
            <Button variant="primary" onClick={() => navigate('/read')}>
              📚 {t('reader.moreStories')}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/home')}>
              🏠 {t('nav.home')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- quiz ---------- */
  if (phase === 'quiz') {
    const q = questions[qi];
    if (!q) {
      return (
        <div className="page-enter">
          <div className="card">
            <Button variant="primary" onClick={() => setPhase('done')}>
              →
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="page-enter">
        <div className="row-between" style={{ marginBottom: 14 }}>
          <Button variant="ghost" size="sm" onClick={() => setPhase('read')}>
            ← {t('common.back')}
          </Button>
          <span className="chip chip--violet">
            {t('session.step', { current: qi + 1, total: questions.length })}
          </span>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="row" style={{ gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: '2rem' }} aria-hidden="true">
              🤔
            </span>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{t(q.qKey, q.qVars)}</h2>
          </div>

          <div className="choices">
            {(q.options || []).map((opt, i) => {
              const chosen = picked === opt;
              const isRight = String(opt).toLowerCase() === String(q.answer).toLowerCase();
              const cls = [
                'choice',
                'choice--word',
                picked && isRight ? 'choice--correct' : '',
                picked && chosen && !isRight ? 'choice--wrong' : '',
                picked && !chosen && !isRight ? 'choice--dim' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <button
                  key={`${opt}-${i}`}
                  type="button"
                  className={cls}
                  onClick={() => answerQuestion(opt)}
                  disabled={!!picked}
                >
                  {q.emojis?.[i] && (
                    <span style={{ fontSize: '1.7rem', display: 'block' }}>{q.emojis[i]}</span>
                  )}
                  {opt}
                </button>
              );
            })}
          </div>

          {quizFeedback && (
            <div className="stack" style={{ marginTop: 16, gap: 12 }}>
              <FeedbackCard tone={quizFeedback.tone} title={quizFeedback.title} text={quizFeedback.text} />
              <div className="session__actions">
                <Button variant="primary" onClick={nextQuestion} autoFocus>
                  {qi + 1 >= questions.length ? t('session.finish') : t('reader.quizNext')} →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------- reading ---------- */
  return (
    <div className="page-enter">
      <div className="row-between" style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/read')}>
          ← {t('common.back')}
        </Button>
        <div style={{ flex: 1, maxWidth: 320 }}>
          <ProgressBar value={percent} tone="teal" label={t('reader.readWords', { read: spoken.size, total: totalWords })} />
        </div>
        <span className="chip chip--teal">⭐ {profile.stars}</span>
      </div>

      <div className="reader">
        <div className="reader__paper">
          <div className="row" style={{ gap: 14, marginBottom: 8 }}>
            <span
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                background: story.tint || 'var(--teal-soft)',
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.8rem',
              }}
                aria-hidden="true"
            >
              {story.emoji}
            </span>
            <div>
              <h1 className="reader__title" style={{ margin: 0, fontSize: '1.5rem' }}>
                {story.title}
              </h1>
              <span className="small muted">
                {t(`reading.levels.${levelKey(story.level)}`)} ·{' '}
                {t('reader.sentenceOf', { current: 1, total: sentences.length })}
              </span>
            </div>
          </div>

          <div className="reader__text" lang="en">
            {sentences.map((line, si) =>
              splitSentences(line).map((w, wi) => {
                const key = `${si}-${wi}`;
                const isSpoken = spoken.has(key);
                const plain = w.replace(/[^A-Za-z']/g, '').toLowerCase();
                const difficult = (profile.learning.difficultWords || []).some(
                  (d) => d.word === plain
                );
                const cls = ['rw', isSpoken ? 'spoken' : '', difficult ? 'difficult' : '']
                  .filter(Boolean)
                  .join(' ');
                return (
                  <button
                    key={key}
                    type="button"
                    className={cls}
                    onClick={() => tapWord(key, plain || w)}
                    title={t('reading.tapWordHint')}
                  >
                    {w}
                  </button>
                );
              })
            )}
          </div>

          <div className="reader__controls" style={{ marginTop: 20 }}>
            <Button variant="teal" onClick={() => say(story.title)}>
              🔊 {t('reader.sayTitle')}
            </Button>
            <Button
              variant="soft"
              onClick={() => {
                sentences.forEach((line, i) => {
                  setTimeout(() => say(line), i * 1800);
                });
              }}
            >
              👂 {t('reader.slow')}
            </Button>
            <Button variant="primary" onClick={finishReading}>
              ✓ {t('reader.finishRead')}
            </Button>
          </div>

          <div className="row" style={{ gap: 10, marginTop: 18 }}>
            <Mascot id={profile.mascot} size={74} />
            <p className="small muted" style={{ margin: 0 }}>
              {t('reader.tip')}
            </p>
          </div>
        </div>

        <div className="card card--soft">
          <h3 style={{ margin: '0 0 6px' }}>{t('reader.questions')}</h3>
          {(story.practiceWords || []).slice(0, 4).map((w) => (
            <button
              key={w}
              type="button"
              className="btn btn--ghost btn--sm"
              style={{ marginRight: 8, marginBottom: 8 }}
              onClick={() => say(w)}
            >
              🔊 {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
