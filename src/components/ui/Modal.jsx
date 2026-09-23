import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, icon = null, children, footer = null }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={title || 'dialog'}>
        {title && (
          <div className="modal__title">
            {icon && <span style={{ fontSize: '1.6rem' }}>{icon}</span>}
            <h2 style={{ margin: 0, flex: 1 }}>{title}</h2>
          </div>
        )}
        <div style={{ marginTop: 12 }}>{children}</div>
        {footer && (
          <div className="row" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
