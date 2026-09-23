import React from 'react';

export function ParentStatCard({ label, value, hint = null, icon = '📊', trend = null, trendDir = null }) {
  return (
    <div className="pstat">
      <div className="pstat__label">
        <span aria-hidden="true">{icon}</span>
        {label}
      </div>
      <div className="pstat__value">{value}</div>
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
