import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { colorOf, isDoneOn, occursOn, visible } from '../../lib/domain';
import './Grid.css';

export default function UntimedRow({ dates }: { dates: string[] }) {
  const data = useDataStore();
  const { moveItem, toggleDone } = data;
  const { openCard, draggingItemId, setDragging } = useUIStore();

  return (
    <div className="mar-untimed-row">
      <div className="mar-hour-gutter mar-untimed-label">без часа</div>
      {dates.map((date) => {
        const chips = data.items.filter((it) => it.start == null && it.date === date && visible(data, it) && occursOn(it, date));
        return (
          <div
            key={date}
            className="mar-untimed-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData('text/plain') || draggingItemId;
              if (id) moveItem(id, { date, start: null });
              setDragging(null);
            }}
          >
            {chips.map((c) => {
              const color = colorOf(data, c);
              const done = isDoneOn(c, date);
              return (
                <div
                  key={c.id}
                  className={`mar-untimed-chip${done ? ' is-done' : ''}`}
                  draggable
                  onDragStart={(e) => { setDragging(c.id); e.dataTransfer.setData('text/plain', c.id); }}
                  onClick={() => openCard(c.id)}
                  style={{ borderLeftColor: color }}
                >
                  <span className="mar-barcode-dot" style={{ background: color }} />
                  <span className="mar-untimed-title">{c.title}</span>
                  <span
                    className="mar-untimed-check"
                    title="Выполнено"
                    onClick={(e) => { e.stopPropagation(); toggleDone(c, date); }}
                  >
                    {done ? '✓' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
