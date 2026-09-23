import React, { useState } from 'react';
import { useT } from '../../i18n/index.jsx';
import { useApp } from '../../store/AppContext.jsx';
import { moduleLabelKey, errorLabelKey, skillLabelKey } from '../../services/profileService.js';
import Button from '../../components/ui/Button.jsx';
import { EmptyState } from '../../components/ui/Empty.jsx';
import { formatDate } from '../../utils/dates.js';

const PAGE = 14;

export default function ParentHistory() {
  const t = useT();
  const { profile } = useApp();
  const [limit, setLimit] = useState(PAGE);

  if (!profile) return null;
  const rows = (profile.history || []).slice(0, limit);

  return (
    <div className="page-enter">
      <div className="parent-head">
        <div>
          <h1>{t('parent.historyTitle')}</h1>
          <p>{t('parent.historySub')}</p>
        </div>
        <span className="chip">{t('parent.attempts', { n: profile.history.length })}</span>
      </div>

      <div className="panel">
        {rows.length ? (
          <>
            <table className="history-table">
              <thead>
                <tr>
                  <th>{t('parent.thDate')}</th>
                  <th>{t('parent.thModule')}</th>
                  <th>{t('parent.thResult')}</th>
                  <th>{t('parent.thErrors')}</th>
                  <th>{t('parent.thWord')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((h) => (
                  <tr key={h.id}>
                    <td>{formatDate(h.at)}</td>
                    <td>{t(moduleLabelKey(h.module))}</td>
                    <td>
                      <span className={`chip ${h.ok ? 'chip--teal' : 'chip--rose'}`}>
                        {h.ok ? t('parent.resultCorrect') : t('parent.resultPartial')}
                      </span>
                    </td>
                    <td>
                      {h.errors?.length
                        ? h.errors.map((e) => t(errorLabelKey(e))).join(', ')
                        : '—'}
                    </td>
                    <td>
                      {h.word ? <code>{h.word}</code> : '—'}
                      <span className="small muted"> · {t(skillLabelKey(h.skill))}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {limit < profile.history.length && (
              <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
                <Button variant="soft" onClick={() => setLimit((l) => l + PAGE)}>
                  {t('common.seeAll')} ↓
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            art="🕘"
            title={t('parent.historyEmpty')}
            sub={t('parent.historyEmptySub')}
          />
        )}
      </div>

      <div className="disclaimer" style={{ marginTop: 16 }}>
        {t('parent.disclaimer')}
      </div>
    </div>
  );
}
