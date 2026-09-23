import React, { useEffect, useMemo, useState } from 'react';
import { useT } from '../../../i18n/index.jsx';

/* "Tap every d you can see" — letter grid hunt. */
export default function LetterGridView({ ex, locked = false, onSubmit }) {
  const t = useT();
  const [picked, setPicked] = useState(new Set());

  const cells = useMemo(() => {
    const target = String(ex.answer).toLowerCase();
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const others = alphabet.split('').filter((l) => l !== target);
    const size = 18;
    const targetCount = 4;
    const arr = [];
    for (let i = 0; i < targetCount; i += 1) arr.push(target);
    while (arr.length < size) {
      const l = others[Math.floor(Math.random() * others.length)];
      arr.push(l);
    }
    // shuffle
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [ex.uid, ex.answer]);

  useEffect(() => {
    setPicked(new Set());
  }, [ex.uid]);

  const toggle = (idx) => {
    if (locked) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const check = () => {
    const target = String(ex.answer).toLowerCase();
    const chosenLetters = [...picked].map((i) => cells[i]);
    const ok =
      chosenLetters.length > 0 &&
      chosenLetters.every((l) => l === target) &&
      cells.filter((l) => l === target).length === chosenLetters.length;
    onSubmit(chosenLetters.join(''), { forcedOk: ok });
  };

  return (
    <div className="exercise">
      <p className="exercise__instruction">{t(ex.instructionKey, ex.instructionVars)}</p>
      <div className="exercise__prompt" style={{ padding: 18 }}>
        <div className="letter-grid">
          {cells.map((ch, i) => (
            <button
              key={`${ch}-${i}`}
              type="button"
              className={`letter-cell ${picked.has(i) ? 'letter-cell--picked' : ''}`}
              onClick={() => toggle(i)}
              disabled={locked}
              aria-pressed={picked.has(i)}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
      <div className="session__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={check}
          disabled={locked || picked.size === 0}
        >
          ✓ {t('exercise.check')}
        </button>
      </div>
    </div>
  );
}
