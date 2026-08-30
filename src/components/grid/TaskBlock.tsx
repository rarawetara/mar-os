import { useRef, useState } from 'react';
import type { Item } from '../../types';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { colorOf, deadlineInfo, fmtMin, isDoneOn, kindGlyph, loggedMin } from '../../lib/domain';
import { blockHeight, blockTop } from '../../lib/grid';
import { minToHHMM } from '../../lib/date';
import './Grid.css';

export default function TaskBlock({ item, date }: { item: Item; date: string }) {
  const data = useDataStore();
  const { moveItem, toggleDone, toggleTimer } = data;
  const { openCard, setDragging } = useUIStore();
  const [resizing, setResizing] = useState(false);
  const suppressClick = useRef(false);

  if (item.start == null) return null;

  const color = colorOf(data, item);
  const done = isDoneOn(item, date);
  const dl = deadlineInfo(item);
  const overdue = dl?.tone === 'over' && !done;
  const top = blockTop(item.start);
  const height = blockHeight(item.duration);
  const compact = height < 46;
  const logged = loggedMin(item);
  const running = !!item.activeTimerStart;

  const onResizeDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizing(true);
    suppressClick.current = true;
    const startY = e.clientY;
    const origDur = item.duration;
    const onMove = (ev: PointerEvent) => {
      const dMin = Math.round(((ev.clientY - startY) / 52) * 60 / 5) * 5;
      const dur = Math.max(15, origDur + dMin);
      moveItem(item.id, { duration: dur });
    };
    const onUp = () => {
      setResizing(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setTimeout(() => { suppressClick.current = false; }, 0);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      className={`mar-block${done ? ' is-done' : ''}${overdue ? ' is-overdue' : ''}${resizing ? ' is-resizing' : ''}`}
      style={{ top, height, borderColor: overdue ? 'var(--danger)' : 'var(--ink)' }}
      draggable
      onDragStart={(e) => { setDragging(item.id); e.dataTransfer.setData('text/plain', item.id); }}
      onDragEnd={() => setDragging(null)}
      onClick={() => { if (!suppressClick.current) openCard(item.id); }}
    >
      <div className="mar-block-stripe" style={{ background: color }} />
      <div className="mar-block-title">{item.title || '…'}</div>
      {!compact && (
        <div className="mar-block-time">{minToHHMM(item.start)}–{minToHHMM(item.start + item.duration)}</div>
      )}
      {dl && (
        <div className={`mar-block-deadline mar-block-deadline--${dl.tone}`}>{dl.text}</div>
      )}
      {!compact && (
        <div className="mar-block-meta">
          <div
            className="mar-block-timer"
            title="Таймер"
            onClick={(e) => { e.stopPropagation(); toggleTimer(item.id); }}
          >
            <span className={`mar-timer-glyph${running ? ' is-running' : ''}`} />
          </div>
          {logged > 0 && <span className="mar-block-logged">{fmtMin(logged)}</span>}
          {item.type === 'meeting' && <span className="mar-block-kind">{kindGlyph(item.meetingKind)}</span>}
        </div>
      )}
      <div
        className="mar-block-check"
        title="Выполнено"
        onClick={(e) => { e.stopPropagation(); toggleDone(item, date); }}
      >
        {done ? '✓' : ''}
      </div>
      <div className="mar-block-resize" onPointerDown={onResizeDown} />
    </div>
  );
}
