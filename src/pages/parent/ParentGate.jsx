import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import Button from '../../components/ui/Button.jsx';
import { Logo } from '../../components/ui/Mascots.jsx';

const PIN = '1234';

export default function ParentGate() {
  const t = useT();
  const navigate = useNavigate();
  const { setParentUnlocked, parentUnlocked } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (parentUnlocked) navigate('/parent/overview', { replace: true });
  }, [parentUnlocked, navigate]);

  const press = (d) => {
    setError('');
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      if (next === PIN) {
        setParentUnlocked(true);
        navigate('/parent/overview', { replace: true });
      } else {
        setError(t('parent.pinWrong'));
        setTimeout(() => setPin(''), 500);
      }
    }
  };

  return (
    <div className="gate page-enter">
      <div className="gate__card">
        <div style={{ display: 'grid', placeItems: 'center', gap: 12, marginBottom: 8 }}>
          <Logo size={46} />
          <h1 style={{ margin: 0 }}>{t('parent.gateTitle')}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {t('parent.gateSub')}
          </p>
        </div>

        <div className="pin-dots" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`} />
          ))}
        </div>

        <div className="gate__error" role="alert">
          {error}
        </div>

        <div className="pin-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} type="button" onClick={() => press(String(n))}>
              {n}
            </button>
          ))}
          <button type="button" className="blank" tabIndex={-1} aria-hidden="true">
            ·
          </button>
          <button type="button" onClick={() => press('0')}>
            0
          </button>
          <button type="button" onClick={() => setPin((p) => p.slice(0, -1))} aria-label="delete">
            ⌫
          </button>
        </div>

        <div className="gate__hint">{t('parent.pinHint')}</div>

        <div style={{ marginTop: 18 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
            ← {t('parent.backToChild')}
          </Button>
        </div>
      </div>
    </div>
  );
}
