import { useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { dayLoad, occursOn, visible } from '../../lib/domain';
import { DOW_SHORT, DOW_SHORT_EN, addDays, fmtDate, parseDate, today } from '../../lib/date';
import AgendaPanel from './AgendaPanel';
import './Month.css';

export default function MonthView() {
  const data = useDataStore();
  const { setAnchor, moveItem } = data;
  const { draggingItemId, setDragging } = useUIStore();
  const dowNames = data.lang === 'ru' ? DOW_SHORT : DOW_SHORT_EN;

  const cells = useMemo(() => {
    const anchorD = parseDate(data.anchor);
    const first = new Date(anchorD.getFullYear(), anchorD.getMonth(), 1);
    const dow = first.getDay();
    const off = dow === 0 ? -6 : 1 - dow;
    const start = fmtDate(first);
    const gridStart = addDays(start, off);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [data.anchor]);

  const maxLoad = Math.max(1, ...cells.map((d) => dayLoad(data, d)));
  const monthIdx = parseDate(data.anchor).getMonth();

  return (
    <div className="mar-month-view">
      <div className="mar-month-grid">
        {dowNames.map((n) => <div key={n} className="mar-month-dow">{n}</div>)}
        {cells.map((date) => {
          const d = parseDate(date);
          const outOfMonth = d.getMonth() !== monthIdx;
          const isToday = date === today();
          const selected = date === data.anchor;
          const load = dayLoad(data, date);
          const here = data.items
            .filter((it) => visible(data, it) && occursOn(it, date))
            .sort((a, b) => (a.start ?? 9999) - (b.start ?? 9999));
          const shown = here.slice(0, 3);
          const more = here.length - shown.length;

          return (
            <div
              key={date}
              className={`mar-month-cell${outOfMonth ? ' is-out' : ''}${selected ? ' is-selected' : ''}`}
              onClick={() => setAnchor(date)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain') || draggingItemId;
                if (id) moveItem(id, { date });
                setDragging(null);
              }}
            >
              <div className="mar-month-cell-head">
                <div className={`mar-month-num${isToday ? ' is-today' : ''}`}>{d.getDate()}</div>
                {load > 0 && <span className="mar-month-dot" style={{ opacity: 0.35 + 0.65 * (load / maxLoad) }} />}
              </div>
              <div className="mar-month-chips">
                {shown.map((it) => (
                  <div
                    key={it.id}
                    className="mar-month-chip"
                    draggable
                    onDragStart={(e) => { e.stopPropagation(); setDragging(it.id); e.dataTransfer.setData('text/plain', it.id); }}
                    onClick={(e) => { e.stopPropagation(); setAnchor(date); }}
                    style={{ borderLeftColor: 'var(--ink)' }}
                  >
                    {it.title}
                  </div>
                ))}
                {more > 0 && <div className="mar-month-more">+{more} ещё</div>}
              </div>
            </div>
          );
        })}
      </div>
      <AgendaPanel />
    </div>
  );
}
