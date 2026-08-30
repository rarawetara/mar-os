import { useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import { computeWeekStats } from '../../lib/stats';
import { plural } from '../../lib/domain';
import { t } from '../../i18n';
import './Rail.css';

export default function WeekStats() {
  const data = useDataStore();
  const stats = useMemo(() => computeWeekStats(data), [data.items, data.projectFilter, data.loadMode]);

  const streakPhrase = data.lang === 'ru'
    ? (stats.streak >= 2 ? 'дней подряд закрыты полностью' : stats.streak === 1 ? 'день закрыт полностью' : 'полностью закрытых дней нет')
    : (stats.streak === 1 ? 'day fully closed' : 'days fully closed in a row');

  return (
    <div className="mar-rail-card mar-rail-card--foot">
      <div className="mar-stats-title">{t('weekInNumbers', data.lang)}</div>

      <div className="mar-dow-bars">
        {stats.dowBars.map((b, i) => (
          <div key={i} className="mar-dow-bar" style={{ height: `${b.value}%`, background: b.isBest ? 'var(--accent)' : `color-mix(in srgb, var(--accent) ${25 + Math.round((b.value / 100) * 45)}%, var(--surface))` }} />
        ))}
      </div>

      <p className="mar-stats-text">
        {data.lang === 'ru' ? (
          <>Закрываешь <b>{stats.closedPct}%</b> дел{stats.streak > 0 ? <>, серия <b>{stats.streak} {plural(stats.streak, 'день', 'дня', 'дней')}</b></> : ', серия 0 дней'}
            {stats.bestDowName && <> и чаще всего успеваешь в <b>{stats.bestDowName}</b></>}.</>
        ) : (
          <>You close <b>{stats.closedPct}%</b> of your tasks, streak — <b>{stats.streak}</b> {streakPhrase}
            {stats.bestDowName && <>, and you get the most done on <b>{stats.bestDowName}</b></>}.</>
        )}
      </p>
    </div>
  );
}
