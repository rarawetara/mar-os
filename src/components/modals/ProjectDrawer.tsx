import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { PALETTE, isDoneOn, fmtMin, loggedMin } from '../../lib/domain';
import { today } from '../../lib/date';
import { t } from '../../i18n';
import { OverlayScrim, SideDrawer } from './Overlay';
import './Modals.css';

export default function ProjectDrawer() {
  const data = useDataStore();
  const { renameProject, recolorProject, deleteProject, updateItem, addItem, toggleDone } = data;
  const { activeProjectId, close, openCard } = useUIStore();
  const project = data.projects.find((p) => p.id === activeProjectId);
  if (!project) { close(); return null; }

  const tasks = data.items.filter((it) => it.projectId === project.id);
  const doneCount = tasks.filter((it) => isDoneOn(it, it.date || today())).length;
  const totalLogged = tasks.reduce((sum, it) => sum + loggedMin(it), 0);

  return (
    <>
      <OverlayScrim />
      <SideDrawer width={620}>
        <div style={{ padding: '16px 22px 13px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, border: '1.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, background: `${project.color}22` }}>{project.icon}</div>
          <input
            className="mar-input"
            style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', fontFamily: 'var(--font-display)', fontSize: 22, padding: '2px 0' }}
            value={project.name}
            onChange={(e) => renameProject(project.id, e.target.value)}
          />
          <button className="mar-btn-round" aria-label={t('close', data.lang)} onClick={close}>✕</button>
        </div>

        <div style={{ padding: '14px 22px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <b style={{ fontFamily: 'var(--font-mono)', fontSize: 17 }}>{tasks.length}</b>
            <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>дел</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <b style={{ fontFamily: 'var(--font-mono)', fontSize: 17 }}>{doneCount}</b>
            <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>сделано</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <b style={{ fontFamily: 'var(--font-mono)', fontSize: 17 }}>{fmtMin(totalLogged)}</b>
            <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>время</span>
          </div>
          <div className="mar-swatch-row" style={{ marginLeft: 'auto' }}>
            {PALETTE.map((c) => (
              <div key={c} className={`mar-swatch${project.color === c ? ' is-picked' : ''}`} style={{ background: c }} onClick={() => recolorProject(project.id, c)} />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px 30px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((it) => {
            const done = isDoneOn(it, it.date || today());
            return (
              <div key={it.id} className="mar-agenda-row" onClick={() => openCard(it.id)}>
                <div className="mar-agenda-check" onClick={(e) => { e.stopPropagation(); toggleDone(it, it.date || today()); }}>{done ? '✓' : ''}</div>
                <div className="mar-agenda-body">
                  <div className={`mar-agenda-title${done ? ' is-done' : ''}`}>{it.title}</div>
                  <div className="mar-agenda-meta">{it.date || '—'}</div>
                </div>
                {!it.date && (
                  <button className="mar-key" onClick={(e) => { e.stopPropagation(); updateItem(it.id, { date: today() }); }}>{t('scheduleIt', data.lang)}</button>
                )}
              </div>
            );
          })}
          {tasks.length === 0 && <div className="mar-agenda-empty">{t('folderEmpty', data.lang)}</div>}
          <div
            className="mar-agenda-empty"
            style={{ cursor: 'pointer', padding: '10px 12px' }}
            onClick={() => addItem({ title: '', projectId: project.id })}
          >
            {t('addTaskToFolder', data.lang)}
          </div>
        </div>

        <div style={{ padding: '12px 22px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <button className="mar-danger-btn" style={{ marginLeft: 'auto' }} onClick={() => { deleteProject(project.id); close(); }}>{t('deleteFolder', data.lang)}</button>
        </div>
      </SideDrawer>
    </>
  );
}
