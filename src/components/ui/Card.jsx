import React from 'react';

export default function Card({
  children,
  flat = false,
  soft = false,
  pad = 'md',
  accent = false,
  onClick = null,
  className = '',
  as: Tag = 'div',
  ...rest
}) {
  const cls = [
    'card',
    flat ? 'card--flat' : '',
    soft ? 'card--soft' : '',
    pad === 'sm' ? 'card--pad-sm' : pad === 'xl' ? 'card--pad-xl' : '',
    onClick ? 'card--click' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const props = { className: cls, ...rest };
  if (onClick) {
    props.onClick = onClick;
    props.role = 'button';
    props.tabIndex = 0;
    props.onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    };
  }
  return (
    <Tag {...props}>
      {accent && <span className="card__accent" aria-hidden="true" />}
      {children}
    </Tag>
  );
}
