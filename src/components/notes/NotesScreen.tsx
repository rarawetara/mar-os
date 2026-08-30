import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { t } from '../../i18n';
import { OverlayScrim, SideDrawer } from '../modals/Overlay';
import '../modals/Modals.css';
import './Notes.css';

const TILT = [-2.5, 1.5, -1, 2, -1.8, 1.2];

export default function NotesScreen() {
  const data = useDataStore();
  const { addNote, updateNote, deleteNote, addItem } = data;
  const { close } = useUIStore();

  const notes = [...data.notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);

  return (
    <>
      <OverlayScrim />
      <SideDrawer width={760}>
        <div style={{ padding: '16px 22px 13px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--accent)', textShadow: '2px 2px 0 var(--ink)' }}>{t('notes', data.lang)}</div>
          <button className="mar-pill" style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: 12 }} onClick={addNote}>{t('addNote', data.lang)}</button>
          <button className="mar-btn-round" aria-label={t('close', data.lang)} onClick={close}>✕</button>
        </div>

        <div className="mar-notes-scroll">
          {notes.length === 0 && <div className="mar-agenda-empty" style={{ margin: 20 }}>{t('notesEmpty', data.lang)}</div>}
          <div className="mar-notes-grid">
            {notes.map((n, i) => (
              <div key={n.id} className="mar-sticker" style={{ background: `var(--${n.color})`, transform: `rotate(${TILT[i % TILT.length]}deg)` }}>
                <div className="mar-sticker-head">
                  <input
                    className="mar-sticker-title"
                    placeholder={t('noteTitlePh', data.lang)}
                    value={n.title}
                    onChange={(e) => updateNote(n.id, { title: e.target.value })}
                  />
                  <span
                    className={`mar-sticker-pin${n.pinned ? ' is-pinned' : ''}`}
                    title={t('pin', data.lang)}
                    onClick={() => updateNote(n.id, { pinned: !n.pinned })}
                  >📌</span>
                </div>
                <textarea
                  className="mar-sticker-body"
                  placeholder={t('noteBodyPh', data.lang)}
                  value={n.body}
                  onChange={(e) => updateNote(n.id, { body: e.target.value })}
                />
                <div className="mar-sticker-foot">
                  <button
                    className="mar-sticker-action"
                    onClick={() => { addItem({ title: n.title || n.body.slice(0, 60) }); deleteNote(n.id); }}
                  >{t('turnIntoTask', data.lang)}</button>
                  <span className="mar-sticker-del" onClick={() => deleteNote(n.id)}>✕</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SideDrawer>
    </>
  );
}
