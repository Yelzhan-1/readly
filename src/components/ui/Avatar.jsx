import React from 'react';

export default function Avatar({ profile, size = 'md', mascotSvg = null }) {
  const cls = ['avatar', size === 'sm' ? 'avatar--sm' : size === 'lg' ? 'avatar--lg' : '']
    .filter(Boolean)
    .join(' ');
  const initial = profile?.name ? profile.name.slice(0, 1).toUpperCase() : '?';
  const color = profile?.color || '#FF7A45';
  return (
    <span
      className={cls}
      style={{ background: `linear-gradient(180deg, #fff, ${color}33)` }}
      aria-hidden="true"
      title={profile?.name}
    >
      {mascotSvg || <span style={{ color, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{initial}</span>}
    </span>
  );
}
