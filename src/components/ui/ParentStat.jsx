import React from 'react';
import CountUp from './CountUp.jsx';

function spotlight(event) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--sx', `${event.clientX - rect.left}px`);
  el.style.setProperty('--sy', `${event.clientY - rect.top}px`);
}

export function ParentStatCard({ label, value, hint = null, icon = '📊', trend = null, trendDir = null }) {
  const numeric = typeof value === 'number';
  return (
    <div className="pstat spotlight" onMouseMove={spotlight}>
      <div className="pstat__label">
        <span aria-hidden="true">{icon}</span>
        {label}
      </div>
      <div className="pstat__value">{numeric ? <CountUp to={value} /> : value}</div>
      <div className="row" style={{ gap: 8 }}>
        {hint && <span className="pstat__hint">{hint}</span>}
        {trend && (
          <span className={`trend trend--${trendDir || 'flat'}`}>
            {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export function Insight({ icon = '💡', children, tone = '' }) {
  return (
    <div className={`insight ${tone ? `insight--${tone}` : ''}`}>
      <span className="ico" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}
