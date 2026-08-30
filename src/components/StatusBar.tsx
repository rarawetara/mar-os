import { useEffect, useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { fmtMin } from '../lib/domain';
import { t } from '../i18n';

export default function StatusBar() {
  const data = useDataStore();
  const running = data.items.find((it) => it.activeTimerStart);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, [running]);

  const total = data.items.length;
  const done = data.items.filter((it) => it.done).length;

  return (
    <div className="mar-status-bar">
      <span>{done}/{total} {data.lang === 'ru' ? 'сделано' : 'done'}</span>
      {running && (
        <span className="mar-status-running">
          ● {running.title} · {fmtMin((Date.now() - (running.activeTimerStart || Date.now())) / 60000)}
        </span>
      )}
      <span className="mar-status-hint">{t('statusHint', data.lang)}</span>
    </div>
  );
}
