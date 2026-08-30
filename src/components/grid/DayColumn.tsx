import { useRef } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { occursOn, visible, HOUR_START, HOUR_END, HOUR_PX, WORK_START, WORK_END } from '../../lib/domain';
import { minuteFromOffsetY, hourLabels, gridHeightPx } from '../../lib/grid';
import { today } from '../../lib/date';
import TaskBlock from './TaskBlock';
import './Grid.css';

export default function DayColumn({ date }: { date: string }) {
  const data = useDataStore();
  const { moveItem } = data;
  const { openQuickAdd, draggingItemId, setDragging } = useUIStore();
  const ref = useRef<HTMLDivElement>(null);

  const blocks = data.items.filter((it) => it.start != null && visible(data, it) && occursOn(it, date));
  const isToday = date === today();

  const nowMin = (() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  })();
  const showNow = isToday && nowMin >= HOUR_START * 60 && nowMin <= HOUR_END * 60;
  const nowTop = ((nowMin - HOUR_START * 60) / 60) * HOUR_PX;

  const offTopH = Math.max(0, (WORK_START - HOUR_START)) * HOUR_PX;
  const offBottomH = Math.max(0, (HOUR_END - WORK_END)) * HOUR_PX;

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggingItemId;
    if (!id || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const start = minuteFromOffsetY(y);
    moveItem(id, { date, start });
    setDragging(null);
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    if (e.target !== ref.current) return; // ignore clicks bubbling from blocks
    const rect = ref.current!.getBoundingClientRect();
    const y = e.clientY - rect.top;
    openQuickAdd(date, minuteFromOffsetY(y));
  };

  return (
    <div
      ref={ref}
      className="mar-day-canvas"
      style={{ height: gridHeightPx() }}
      onClick={onCanvasClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {offTopH > 0 && <div className="mar-off-hours" style={{ top: 0, height: offTopH }} />}
      {offBottomH > 0 && <div className="mar-off-hours" style={{ bottom: 0, height: offBottomH }} />}
      {hourLabels().map((h) => (
        <div key={h.minute} className="mar-hour-line" style={{ top: ((h.minute - HOUR_START * 60) / 60) * HOUR_PX }} />
      ))}
      {showNow && <div className="mar-now-line" style={{ top: nowTop }} />}
      {blocks.map((b) => <TaskBlock key={b.id} item={b} date={date} />)}
    </div>
  );
}
