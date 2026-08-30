import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { colorOf, isDoneOn, occursOn, visible } from '../../lib/domain';
import { DOW_FULL_ACC, minToHHMM, parseDate } from '../../lib/date';
import { t } from '../../i18n';
import './Month.css';

export default function AgendaPanel() {
  const data = useDataStore();
  const { toggleDone } = data;
  const { openQuickAdd, openCard } = useUIStore();

  const d = parseDate(data.anchor);
  const dowIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;

  const items = data.items
    .filter((it) => visible(data, it) && occursOn(it, data.anchor))
    .sort((a, b) => (a.start ?? 9999) - (b.start ?? 9999));

  return (
    <div className="mar-agenda">
      <div className="mar-agenda-head">
        <div className="mar-agenda-daynum">{d.getDate()}</div>
        <div className="mar-agenda-dayname">{DOW_FULL_ACC[dowIdx]}</div>
        <button className="mar-agenda-add" onClick={() => openQuickAdd(data.anchor, null)}>{t('addTask', data.lang)}</button>
      </div>
      <div className="mar-agenda-list">
        {items.length === 0 && <div className="mar-agenda-empty">{t('freeDayHint', data.lang)}</div>}
        {items.map((it) => {
          const done = isDoneOn(it, data.anchor);
          const color = colorOf(data, it);
          return (
            <div key={it.id} className="mar-agenda-row" onClick={() => openCard(it.id)}>
              <div
                className="mar-agenda-check"
                onClick={(e) => { e.stopPropagation(); toggleDone(it, data.anchor); }}
              >
                {done ? '✓' : ''}
              </div>
              <div className="mar-agenda-time">{it.start != null ? minToHHMM(it.start) : '—'}</div>
              <div className="mar-agenda-bar" style={{ background: color }} />
              <div className="mar-agenda-body">
                <div className={`mar-agenda-title${done ? ' is-done' : ''}`}>{it.title}</div>
                <div className="mar-agenda-meta">{it.duration} мин</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
