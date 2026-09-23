import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../../../i18n/index.jsx';
import { useSpeech } from '../../../hooks/useSpeech.js';
import WritingCanvas from '../WritingCanvas.jsx';

/* Writing exercises: copy, image→word, dictation, cloze, sentence, creative. */
export default function SpellView({ ex, locked = false, onSubmit }) {
  const t = useT();
  const { say, enabled } = useSpeech();
  const [typed, setTyped] = useState('');
  const [warn, setWarn] = useState('');
  const canvasRef = useRef(null);
  const playedRef = useRef(false);

  useEffect(() => {
    setTyped('');
    setWarn('');
    playedRef.current = false;
  }, [ex.uid]);

  useEffect(() => {
    if (ex.type === 'dictation' && !playedRef.current && enabled) {
      playedRef.current = true;
      const timer = setTimeout(() => say(String(ex.answer)), 450);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [ex.uid, ex.type, ex.answer, enabled, say]);

  const isSentence = ex.type === 'sentence' || ex.type === 'creative';
  const instruction = t(ex.instructionKey, ex.instructionVars);

  let contextText = null;
  if (ex.context?.key) contextText = t(ex.context.key, ex.context.vars);
  else if (ex.contextPath) contextText = t(ex.contextPath, ex.context.vars);

  const submit = () => {
    const value = typed.trim();
    if (!value) {
      setWarn(isSentence ? t('writing.emptyAnswer') : t('exercise.needAnswer'));
      return;
    }
    onSubmit(value);
  };

  const masked = ex.type === 'cloze' ? ex.prompt : null;

  return (
    <div className="exercise">
      <div className="exercise__prompt">
        {ex.type === 'copy' && (
          <>
            <div className="prompt-emoji">{ex.emoji || '✏️'}</div>
            <div className="prompt-word">{String(ex.answer).toUpperCase()}</div>
            <p className="prompt-context">{t('writing.copyIntro')}</p>
          </>
        )}
        {ex.type === 'spellImage' && (
          <>
            <div className="prompt-emoji">{ex.emoji || '🖼️'}</div>
            <p className="prompt-context">{t('writing.imageIntro')}</p>
          </>
        )}
        {ex.type === 'dictation' && (
          <>
            <button
              type="button"
              className="btn btn--teal btn--lg"
              onClick={() => say(String(ex.answer))}
              aria-label={t('exercise.listenWord')}
            >
              🔊 {t('exercise.listenWord')}
            </button>
            <p className="prompt-context">{t('writing.dictationIntro')}</p>
          </>
        )}
        {ex.type === 'cloze' && (
          <>
            <div className="prompt-word prompt-word--masked">{masked}</div>
            <p className="prompt-context">{t('exercise.completeWord')}</p>
          </>
        )}
        {(ex.type === 'sentence' || ex.type === 'creative') && (
          <>
            <div className="prompt-emoji">{ex.emoji || '✍️'}</div>
            <p className="prompt-context">
              {contextText || (ex.type === 'creative' ? t('writing.creativePrompt') : t('exercise.writeSentence'))}
            </p>
          </>
        )}
        {contextText && ex.type !== 'sentence' && ex.type !== 'creative' && (
          <p className="prompt-context" style={{ color: 'var(--primary-dark)' }}>
            {contextText}
          </p>
        )}
      </div>

      <p className="exercise__instruction">{instruction}</p>

      {!isSentence && (
        <WritingCanvas ref={canvasRef} guide={ex.type === 'copy' ? String(ex.answer).toUpperCase() : ''} />
      )}

      <div className="field">
        <label htmlFor={`spell-${ex.uid}`}>{isSentence ? '' : t('writing.typeHint')}</label>
        {isSentence ? (
          <textarea
            id={`spell-${ex.uid}`}
            className="textarea"
            value={typed}
            placeholder={t('exercise.sentencePh')}
            onChange={(e) => {
              setTyped(e.target.value);
              setWarn('');
            }}
            disabled={locked}
            rows={3}
          />
        ) : (
          <input
            id={`spell-${ex.uid}`}
            className="input input--big"
            value={typed}
            placeholder={t('exercise.typeHere')}
            onChange={(e) => {
              setTyped(e.target.value);
              setWarn('');
            }}
            disabled={locked}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        )}
        {warn && (
          <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.9rem' }} role="alert">
            {warn}
          </span>
        )}
        {!isSentence && <span className="small muted">{t('writing.handwritingNote')}</span>}
      </div>

      <div className="session__actions">
        <button type="button" className="btn btn--primary btn--lg" onClick={submit} disabled={locked}>
          ✓ {t('writing.submit')}
        </button>
      </div>
    </div>
  );
}
