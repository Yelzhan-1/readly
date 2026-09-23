import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/index.jsx';
import Button from '../components/ui/Button.jsx';
import { Logo, DinoMascot } from '../components/ui/Mascots.jsx';

export default function NotFound() {
  const t = useT();
  const navigate = useNavigate();
  return (
    <div className="page-enter" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div className="center">
        <Logo size={54} />
        <div style={{ margin: '18px 0' }}>
          <DinoMascot size={130} />
        </div>
        <h1 style={{ margin: '0 0 6px' }}>404</h1>
        <p className="muted" style={{ fontWeight: 600, marginTop: 0 }}>
          {t('errors.notFoundSub')}
        </p>
        <div className="row" style={{ gap: 10, justifyContent: 'center' }}>
          <Button variant="primary" onClick={() => navigate('/')}>
            🏠 {t('errors.goHome')}
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← {t('common.back')}
          </Button>
        </div>
      </div>
    </div>
  );
}
