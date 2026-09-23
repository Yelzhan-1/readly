import React, { useEffect, useState } from 'react';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import {
  adoptCloudAccount,
  cloudMode,
  getParentSession,
  pullCloudState,
  signInParent,
  signOutParent,
  signUpParent,
} from '../../services/cloudSync.js';
import Button from '../ui/Button.jsx';

export default function ParentCloudAccount() {
  const t = useT();
  const { state, hydrateCloud } = useApp();
  const mode = cloudMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionEmail, setSessionEmail] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    getParentSession().then((session) => {
      if (live) setSessionEmail(session?.user?.email || '');
    });
    return () => {
      live = false;
    };
  }, []);

  if (mode === 'off') {
    return <span className="chip">{t('parent.cloudLocal')}</span>;
  }

  const run = async (fn) => {
    setBusy(true);
    setNote('');
    const presentIds = (state.profiles || []).map((profile) => profile.id);
    const { data, error } = await fn(email.trim(), password);
    setBusy(false);
    if (error) {
      setNote(t('parent.cloudAuthError'));
      return;
    }
    const signed = data?.session?.user?.email || '';
    const userId = data?.session?.user?.id || '';
    if (signed && userId) {
      adoptCloudAccount(userId, presentIds);
      setSessionEmail(signed);
      setPassword('');
      pullCloudState()
        .then((remote) => hydrateCloud(remote))
        .catch(() => {});
      return;
    }
    setNote(t('parent.cloudCheckEmail'));
  };

  if (sessionEmail) {
    return (
      <div className="cloud-account">
        <span className="chip chip--teal">{t('parent.cloudSync')}</span>
        <p className="small" style={{ margin: '8px 0' }}>
          {t('parent.cloudSignedIn', { email: sessionEmail })}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await signOutParent();
            setSessionEmail('');
          }}
        >
          {t('parent.cloudSignOut')}
        </Button>
      </div>
    );
  }

  return (
    <div className="cloud-account">
      <span className="chip">{t('parent.cloudReady')}</span>
      <h3 style={{ margin: '10px 0 4px' }}>{t('parent.cloudAccount')}</h3>
      <p className="small muted" style={{ marginTop: 0 }}>
        {t('parent.cloudAccountSub')}
      </p>
      <div className="field">
        <label htmlFor="cloud-email">{t('parent.cloudEmail')}</label>
        <input
          id="cloud-email"
          className="input"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="cloud-pass">{t('parent.cloudPassword')}</label>
        <input
          id="cloud-pass"
          className="input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <Button variant="primary" disabled={busy || !email || password.length < 6} onClick={() => run(signInParent)}>
          {t('parent.cloudSignIn')}
        </Button>
        <Button variant="soft" disabled={busy || !email || password.length < 6} onClick={() => run(signUpParent)}>
          {t('parent.cloudSignUp')}
        </Button>
      </div>
      {note && (
        <p className="small" role="status" style={{ marginBottom: 0 }}>
          {note}
        </p>
      )}
    </div>
  );
}
