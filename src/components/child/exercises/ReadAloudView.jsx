import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../../../i18n/index.jsx';
import { useApp } from '../../../store/AppContext.jsx';
import { useSpeech } from '../../../hooks/useSpeech.js';
import {
  recognitionSupported,
  createRecognizer,
  analyzeTranscript,
  simulateReading,
} from '../../../services/speechService.js';

/* Read-aloud exercise with mic (when available), tap-to-read fallback,
   and honest demo simulation when neither is usable. */
export default function ReadAloudView({ ex, locked = false, onSubmit }) {
  const t = useT();
  const { profile, lang, settings } = useApp();
  const { say } = useSpeech();
  const words = String(ex.sentence || ex.answer || '').split(/\s+/).filter(Boolean);

  const [phase, setPhase] = useState('idle'); // idle | recording | done | micError
  const [interim, setInterim] = useState('');
  const [tapMode, setTapMode] = useState(() => settings.tapMode === true);
  const [tapIdx, setTapIdx] = useState(0);
  const [tapDone, setTapDone] = useState(false);
  const recRef = useRef(null);
  const startRef = useRef(0);
  const transcriptRef = useRef('');

  useEffect(() => {
    setPhase('idle');
    setInterim('');
    setTapMode(settings.tapMode === true);
    setTapIdx(0);
    setTapDone(false);
    transcriptRef.current = '';
    return () => {
      if (recRef.current) recRef.current.stop();
    };
  }, [ex.uid, settings.tapMode]);

  const finishWithTranscript = (extraWords = []) => {
    const duration = Math.max(4, Math.round((Date.now() - startRef.current) / 1000));
    const base = transcriptRef.current || extraWords.join(' ');
    const analysis = analyzeTranscript(ex.sentence || ex.answer, base, duration);
    setPhase('done');
    onSubmit(analysis.transcript || base || ' ', { analysis });
  };

  const startMic = () => {
    if (!recognitionSupported()) {
      setPhase('micError');
      setTapMode(true);
      return;
    }
    transcriptRef.current = '';
    startRef.current = Date.now();
    setInterim('');
    setPhase('recording');
    // Practice words and stories are English. The mic stays en-US on purpose;
    // the UI language only changes labels and spoken feedback.
    const rec = createRecognizer({
      lang: 'en-US',
      onFinal: (text) => {
        transcriptRef.current = `${transcriptRef.current} ${text}`.trim();
      },
      onInterim: setInterim,
      onError: (code) => {
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setPhase('micError');
          setTapMode(true);
        }
      },
    });
    if (!rec) {
      setPhase('micError');
      setTapMode(true);
      return;
    }
    recRef.current = rec;
    rec.start();
  };

  const stopMic = () => {
    if (recRef.current) recRef.current.stop();
    finishWithTranscript();
  };

  const tapNext = () => {
    const next = tapIdx + 1;
    setTapIdx(next);
    if (next >= words.length) setTapDone(true);
  };

  const finishTapMode = (all) => {
    const typed = (all ? words : words.slice(0, Math.max(1, words.length - 1))).join(' ');
    transcriptRef.current = typed;
    // honest fallback: treat tapped words as read; misses the last one if "some were hard"
    const analysis = analyzeTranscript(ex.sentence || ex.answer, typed, Math.max(6, words.length * 1.4));
    if (!all) {
      analysis.correct = Math.max(0, analysis.correct - 1);
      analysis.skipped = [...analysis.skipped, words[words.length - 1]];
    }
    onSubmit(typed, { analysis });
  };

  const useSimulation = () => {
    const analysis = simulateReading(ex.sentence || ex.answer, profile);
    onSubmit(words.join(' '), { analysis });
  };

  return (
    <div className="exercise">
      <p className="exercise__instruction">{t(ex.instructionKey, ex.instructionVars) || t('exercise.read')}</p>

      <div className="exercise__prompt">
        <div className="reader__text" style={{ justifyContent: 'center' }}>
          {words.map((w, i) => (
            <button
              key={`${w}-${i}`}
              type="button"
              className={`rw ${tapMode && i < tapIdx ? 'read' : ''} ${tapMode && i === tapIdx ? 'active' : ''}`}
              onClick={() => say(w)}
              title={t('reading.tapWordHint')}
            >
              {w}
            </button>
          ))}
        </div>
        <p className="muted" style={{ margin: 0, fontWeight: 700 }}>
          {t('reading.tapWordHint')}
        </p>
      </div>

      {phase === 'idle' && (
        <div className="session__actions">
          <button type="button" className="btn btn--teal btn--lg" onClick={() => say(ex.sentence || ex.answer)}>
            🔊 {t('common.listen')}
          </button>
          <button type="button" className="btn btn--primary btn--lg" onClick={startMic} disabled={locked}>
            🎤 {t('reading.startReading')}
          </button>
          <p className="small muted center" style={{ margin: 0, flexBasis: '100%' }}>
            {t('reading.micEnglish')}
          </p>
          <button type="button" className="btn btn--ghost" onClick={() => { setTapMode(true); startRef.current = Date.now(); }} disabled={locked}>
            👆 {t('reading.tapMode')}
          </button>
        </div>
      )}

      {phase === 'recording' && (
        <div className="stack" style={{ alignItems: 'center', gap: 10 }}>
          <div className="dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="muted" style={{ fontWeight: 700, margin: 0 }}>
            {interim || t('reading.analyzing')}
          </p>
          <button type="button" className="btn btn--primary btn--lg" onClick={stopMic}>
            ⏹ {t('reading.stopReading')}
          </button>
        </div>
      )}

      {phase === 'micError' && (
        <div className="feedback feedback--almost" role="status">
          <span className="feedback__emoji">🎤</span>
          <div>
            <div className="feedback__title">{t('reading.micUnavailable')}</div>
            <p className="feedback__text">{t('reading.tapModeHint')}</p>
          </div>
        </div>
      )}

      {tapMode && (phase === 'idle' || phase === 'micError') && (
        <div className="stack" style={{ gap: 12 }}>
          <p className="center" style={{ fontWeight: 800, margin: 0 }}>
            {t('reading.tapModeHint')}
          </p>
          <div className="word-tap">
            {words.map((w, i) => (
              <button
                key={`${w}-${i}`}
                type="button"
                className={i < tapIdx ? 'read' : i === tapIdx ? 'active' : ''}
                onClick={tapNext}
                disabled={locked || i > tapIdx}
              >
                {w}
              </button>
            ))}
          </div>
          <div className="session__actions">
            <button type="button" className="btn btn--primary" onClick={() => finishTapMode(true)} disabled={!tapDone || locked}>
              ✓ {t('reading.selfYes')}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => finishTapMode(false)} disabled={tapIdx === 0 || locked}>
              {t('reading.selfSome')}
            </button>
            <button type="button" className="btn btn--soft" onClick={useSimulation} disabled={locked}>
              🎮 {t('common.practice')} {t('common.demoTag')}
            </button>
          </div>
        </div>
      )}

      {!tapMode && phase === 'idle' && (
        <div className="session__actions">
          <button type="button" className="btn btn--soft btn--sm" onClick={useSimulation} disabled={locked}>
            🎮 {t('common.practice')} {t('common.demoTag')}
          </button>
        </div>
      )}
    </div>
  );
}
