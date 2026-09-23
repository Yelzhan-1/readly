import React from 'react';

const VARIANTS = {
  primary: 'btn--primary',
  teal: 'btn--teal',
  violet: 'btn--violet',
  sun: 'btn--sun',
  ghost: 'btn--ghost',
  soft: 'btn--soft',
  danger: 'btn--danger',
  default: '',
};

export default function Button({
  children,
  variant = 'default',
  size = 'md',
  block = false,
  className = '',
  ...rest
}) {
  const cls = [
    'btn',
    VARIANTS[variant] || '',
    size === 'lg' ? 'btn--lg' : size === 'sm' ? 'btn--sm' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
