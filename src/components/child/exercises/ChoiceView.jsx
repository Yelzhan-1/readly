import React, { useEffect, useState } from 'react';
import { useT } from '../../../i18n/index.jsx';
import { useSpeech } from '../../../hooks/useSpeech.js';

/* Multiple-choice exercises: letter finding, word matching, comprehension. */
export default function ChoiceView({ ex, locked = false, onPick }) {
  const t = useT();
  const { say } = useSpeech();
  const [picked, setPicked] = useState(null);
  const [state, setState] = useState({});

  useEffect(() => {
    setPicked(null);
    setState({});
  }, [ex.uid]);

  const instruction = t(ex.instructionKey, ex.instructionVars);
  const context = ex.contextPath ? t(ex.contextPath, ex.contextVars) : null;
  const question = ex.questionKey ? t(ex.questionKey, ex.questionVars) : null;

  const handle = (opt) => {
    if (locked || picked) return;
    setPicked(opt);
    const ok = String(opt).toLowerCase() === String(ex.answer).toLowerCase();
    setState((s) => ({ ...s, [opt]: ok ? 'correct' : 'wrong' }));
    if (ex.wordOptions || ex.subtype === 'matchWord') say(String(opt));
    onPick(opt);
  };

  return (
    <div className="exercise">
      <div className="exercise__prompt">
        {ex.promptEmoji && <div className="prompt-emoji">{ex.promptEmoji}</div>}
        {ex.letter && <div className="prompt-word">{ex.letter}</div>}
        {ex.prompt && <div className="prompt-word">{ex.prompt}</div>}
        {question && <div className="prompt-context">{question}</div>}
        {!question && context && <div className="prompt-context">{context}</div>}
        {ex.subtype === 'matchWord' && !ex.promptEmoji && !ex.prompt && (
          <div className="prompt-context">{context || instruction}</div>
        )}
        {ex.subtype === 'comprehension' && (
          <div className="prompt-emoji" aria-hidden="true">
            {ex.emojis ? '📖' : '📖'}
          </div>
        )}
      </div>

      <p className="exercise__instruction">{instruction}</p>

      <div className={`choices ${ex.subtype === 'findLetter' || ex.subtype === 'choosePair' ? 'choices--letters' : ''}`}>
        {ex.options.map((opt, i) => {
          const letterish =
            ex.subtype === 'findLetter' || ex.subtype === 'choosePair' || !ex.wordOptions;
          const cls = [
            'choice',
            letterish ? '' : 'choice--word',
            state[opt] === 'correct' ? 'choice--correct' : '',
            state[opt] === 'wrong' ? 'choice--wrong' : '',
            picked && !state[opt] ? 'choice--dim' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button key={`${opt}-${i}`} type="button" className={cls} onClick={() => handle(opt)} disabled={locked || !!picked}>
              {ex.emojis && ex.emojis[i] && <span style={{ fontSize: '1.7rem', display: 'block' }}>{ex.emojis[i]}</span>}
              {letterish ? String(opt).toUpperCase() : String(opt)}
            </button>
          );
        })}
      </div>

      {!ex.hints?.length && <span className="sr-only">{t('common.ok')}</span>}
    </div>
  );
}
