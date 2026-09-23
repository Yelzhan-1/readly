import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useT } from '../../i18n/index.jsx';

/* Handwriting / drawing canvas — mouse, touch and stylus friendly.
   Ink stays on device; grading uses the typed fallback service. */

const WritingCanvas = forwardRef(function WritingCanvas(
  { guide = '', width = 640, height = 300, onChange = null },
  ref
) {
  const t = useT();
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const strokes = useRef([]);
  const current = useRef(null);
  const [hasInk, setHasInk] = useState(false);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: ((src.clientX - rect.left) / rect.width) * canvas.width,
      y: ((src.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#232741';
    ctx.lineWidth = 7;
    strokes.current.forEach((stroke) => {
      if (stroke.length < 1) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      stroke.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
    });
  }, []);

  const emit = () => {
    if (onChange) onChange(strokes.current);
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    current.current = [getPos(e)];
    strokes.current.push(current.current);
    setHasInk(true);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const pt = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    const prev = current.current[current.current.length - 1];
    ctx.strokeStyle = '#232741';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    current.current.push(pt);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    current.current = null;
    emit();
  };

  const undo = () => {
    strokes.current.pop();
    setHasInk(strokes.current.length > 0);
    redraw();
    emit();
  };

  const clear = () => {
    strokes.current = [];
    setHasInk(false);
    redraw();
    emit();
  };

  useImperativeHandle(ref, () => ({
    clear,
    undo,
    getStrokes: () => strokes.current,
    hasInk: () => strokes.current.length > 0,
  }));

  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
          aria-label={t('writing.canvasHint')}
        />
        {guide && !hasInk && <div className="canvas-guide">{guide}</div>}
      </div>
      <div className="canvas-toolbar">
        <button type="button" className="btn btn--ghost btn--sm" onClick={undo} disabled={!hasInk}>
          ↩ {t('writing.undo')}
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={clear} disabled={!hasInk}>
          🧽 {t('writing.clear')}
        </button>
      </div>
    </div>
  );
});

export default WritingCanvas;
