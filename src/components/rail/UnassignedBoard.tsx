import { useRef, useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { colorOf, deadlineInfo, visible } from '../../lib/domain';
import { t } from '../../i18n';
import './Rail.css';

export default function UnassignedBoard() {
  const data = useDataStore();
  const { addUnscheduled } = data;
  const { openCard, setDragging } = useUIStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');

  const unsched = data.items.filter((it) => it.date == null && visible(data, it));

  const submit = () => {
    const v = (inputRef.current?.value || '').trim();
    if (!v) return;
    addUnscheduled(v);
    if (inputRef.current) inputRef.current.value = '';
    setText('');
  };

  return (
    <div className="mar-rail-card mar-rail-card--top">
      <div className="mar-quick-row">
        <input
          ref={inputRef}
          type="text"
          maxLength={120}
          placeholder={t('addTaskPlaceholder', data.lang)}
          className="mar-quick-input"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
        <button className="mar-quick-add-btn" disabled={!text.trim()} aria-label={t('add', data.lang)} onClick={submit}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </button>
      </div>

      {unsched.length > 0 ? (
        <div className="mar-board">
          {unsched.map((u) => {
            const color = colorOf(data, u);
            const dl = deadlineInfo(u);
            const overdue = dl?.tone === 'over';
            return (
              <div
                key={u.id}
                className="mar-board-tile"
                draggable
                title={u.title}
                onDragStart={(e) => { setDragging(u.id); e.dataTransfer.setData('text/plain', u.id); }}
                onDragEnd={() => setDragging(null)}
                onClick={() => openCard(u.id)}
                style={{ background: `${color}22`, borderColor: 'var(--ink)' }}
              >
                <span className="mar-board-pin" style={{ background: overdue ? 'var(--danger)' : 'var(--accent)' }} />
                <span className="mar-board-body">
                  <span className="mar-board-title">{u.title}</span>
                </span>
                <span className="mar-barcode" style={{ ['--bc-color' as string]: color }} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mar-rail-empty">{t('unassignedEmpty', data.lang)}</div>
      )}
    </div>
  );
}
