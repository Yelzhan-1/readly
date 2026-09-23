import React, { useEffect, useMemo, useState } from 'react';
import { useT } from '../../../i18n/index.jsx';

/* Tap the letters in the right order to build the word. */
export default function OrderLettersView({ ex, locked = false, onSubmit }) {
  const t = useT();
  const target = String(ex.answer).toLowerCase();
  const [chosen, setChosen] = useState([]);
  const [wrongFlash, setWrongFlash] = useState(false);

  const bank = useMemo(() => {
    const letters = target.split('');
    const extraPool = 'abcdefghijklmnopqrstuvwxyz'.split('').filter((l) => !letters.includes(l));
    const withExtra = [...letters];
    if (letters.length <= 5) {
      withExtra.push(extraPool[Math.floor(Math.random() * extraPool.length)]);
    }
    for (let i = withExtra.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [withExtra[i], withExtra[j]] = [withExtra[j], withExtra[i]];
    }
    return withExtra;
  }, [ex.uid, target]);

  useEffect(() => {
    setChosen([]);
    setWrongFlash(false);
  }, [ex.uid]);

  const usedIndices = useMemo(() => {
    const used = [];
    let cursor = 0;
    chosen.forEach((letter) => {
      const idx = bank.findIndex((l, i) => l === letter && !used.includes(i));
      if (idx >= 0) used.push(idx);
      cursor += 1;
    });
    return used;
  }, [chosen, bank]);

  const tapLetter = (letter, idx) => {
    if (locked || usedIndices.includes(idx)) return;
    const next = [...chosen, letter];
    setChosen(next);
    if (next.length === target.length) {
      const ok = next.join('') === target;
      if (!ok) {
        setWrongFlash(true);
        setTimeout(() => {
          setWrongFlash(false);
          setChosen([]);
        }, 650);
      } else {
        setTimeout(() => onSubmit(next.join(''), { forcedOk: true }), 250);
      }
    }
  };

  const back = () => setChosen((c) => c.slice(0, -1));

  return (
    <div className="exercise">
      <p className="exercise__instruction">{t(ex.instructionKey)}</p>
      <div className="exercise__prompt">
        {ex.emoji && <div className="prompt-emoji">{ex.emoji}</div>}
        <div className="prompt-word" style={{ minHeight: '1.2em' }}>
          {target
            .split('')
            .map((ch, i) => (
              <span key={i} style={{ marginRight: 8, color: chosen[i] ? 'var(--ink)' : 'transparent', borderBottom: '5px solid var(--primary)' }}>
                {chosen[i] || ch}
              </span>
            ))}
        </div>
        <p className="muted" style={{ margin: 0 }}>
          {t('exercise.arrangeHint')}
        </p>
      </div>

      <div className="choices choices--letters" style={wrongFlash ? { animation: 'shake 0.35s ease' } : undefined}>
        {bank.map((ch, i) => (
          <button
            key={`${ch}-${i}`}
            type="button"
            className={`choice ${usedIndices.includes(i) ? 'choice--dim' : ''}`}
            onClick={() => tapLetter(ch, i)}
            disabled={locked || usedIndices.includes(i)}
          >
            {ch.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="session__actions">
        <button type="button" className="btn btn--ghost" onClick={back} disabled={!chosen.length || locked}>
          ⌫
        </button>
      </div>
    </div>
  );
}
