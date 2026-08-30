import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { t } from '../../i18n';
import './Rail.css';

export default function ProjectsGrid() {
  const data = useDataStore();
  const { projects, toggleProjectFilter, addProject } = data;
  const { openProject } = useUIStore();

  const countFor = (id: string) => data.items.filter((it) => it.projectId === id).length;

  const onAdd = () => {
    const name = window.prompt(data.lang === 'ru' ? 'Название новой папки' : 'New folder name');
    if (name && name.trim()) addProject(name.trim());
  };

  return (
    <div className="mar-rail-card">
      <div className="mar-project-grid">
        {projects.map((p, i) => {
          const isOff = data.projectFilter[p.id] === false;
          return (
            <div
              key={p.id}
              className={`mar-folder${isOff ? ' is-off' : ''}`}
              title={p.name}
              onClick={() => toggleProjectFilter(p.id)}
              onDoubleClick={() => openProject(p.id)}
            >
              <span className="mar-folder-tab" style={{ background: isOff ? 'var(--surface-2)' : `${p.color}33` }} />
              <span className="mar-folder-card">
                <span className="mar-barcode mar-barcode--wide" style={{ ['--bc-color' as string]: isOff ? 'var(--border-strong)' : p.color }} />
                <span className="mar-folder-inner">
                  <span className="mar-folder-name-row">
                    <span className="mar-folder-icon">{p.icon}</span>
                    <span className="mar-folder-name">{p.name}</span>
                    <span className="mar-folder-count">{countFor(p.id)}</span>
                  </span>
                  <span className="mar-folder-sku">{`MÄR-${String(i + 1).padStart(2, '0')}`}</span>
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && <div className="mar-rail-empty">{t('projectsEmpty', data.lang)}</div>}

      <div className="mar-pill mar-new-project" onClick={onAdd}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        {t('newProject', data.lang)}
      </div>
    </div>
  );
}
