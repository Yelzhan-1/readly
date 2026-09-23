import React from 'react';

export function ProgressBar({ value = 0, tone = '', thin = false, label = null }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const cls = ['progress', tone ? `progress--${tone}` : '', thin ? 'progress--thin' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div
      className={cls}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || undefined}
    >
      <div className="progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({
  value = 0,
  size = 92,
  stroke = 10,
  label = null,
  showLabel = true,
  children,
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle
          className="ring__track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="ring__fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      {showLabel && (
        <span className="ring__label" style={{ fontSize: size * 0.22 }}>
          {children || `${Math.round(pct)}%`}
        </span>
      )}
      {!showLabel && children}
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
