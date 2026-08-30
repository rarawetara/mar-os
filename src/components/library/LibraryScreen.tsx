import { useEffect } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { t } from '../../i18n';
import { OverlayScrim, SideDrawer } from '../modals/Overlay';
import '../modals/Modals.css';
import './Library.css';

export default function LibraryScreen() {
  const data = useDataStore();
  const { collections, addCollection, renameCollection, addCollectionRow, updateCollectionCell, addCollectionField } = data;
  const { close, activeCollectionId, setActiveCollection } = useUIStore();

  useEffect(() => {
    if (!activeCollectionId && collections[0]) setActiveCollection(collections[0].id);
  }, [activeCollectionId, collections, setActiveCollection]);

  const active = collections.find((c) => c.id === activeCollectionId) || collections[0];

  const onNewField = () => {
    if (!active) return;
    const name = window.prompt(data.lang === 'ru' ? 'Название поля' : 'Field name');
    if (name && name.trim()) addCollectionField(active.id, name.trim(), 'text');
  };

  return (
    <>
      <OverlayScrim />
      <SideDrawer width={1040}>
        <div className="mar-lib-sidebar">
          <div className="mar-lib-title">{t('library', data.lang)}</div>
          <div className="mar-lib-list">
            {collections.map((c) => (
              <div key={c.id} className={`mar-lib-row${c.id === active?.id ? ' is-active' : ''}`} onClick={() => setActiveCollection(c.id)}>
                <span>{c.icon}</span>
                <span className="mar-lib-row-name">{c.name}</span>
                <span className="mar-lib-row-count">{c.items.length}</span>
              </div>
            ))}
          </div>
          <div className="mar-lib-add" onClick={() => setActiveCollection(addCollection().id)}>{t('newCollection', data.lang)}</div>
        </div>

        <div className="mar-lib-main">
          {active ? (
            <>
              <div className="mar-lib-head">
                <div className="mar-lib-icon">{active.icon}</div>
                <input className="mar-lib-name-input" value={active.name} onChange={(e) => renameCollection(active.id, e.target.value)} />
                <button className="mar-key" style={{ padding: '6px 10px' }} onClick={onNewField}>+ {data.lang === 'ru' ? 'поле' : 'field'}</button>
                <button className="mar-pill" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => addCollectionRow(active.id)}>{t('newRow', data.lang)}</button>
                <button className="mar-btn-round" aria-label={t('close', data.lang)} onClick={close}>✕</button>
              </div>

              <div className="mar-lib-table-wrap">
                <table className="mar-lib-table">
                  <thead>
                    <tr>
                      {active.fields.map((f) => <th key={f.id}>{f.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {active.items.map((row) => (
                      <tr key={row.id}>
                        {active.fields.map((f) => (
                          <td key={f.id}>
                            {f.type === 'checkbox' ? (
                              <input type="checkbox" checked={!!row.values[f.id]} onChange={(e) => updateCollectionCell(active.id, row.id, f.id, e.target.checked)} />
                            ) : f.type === 'rating' ? (
                              <input type="number" min={0} max={5} className="mar-lib-cell" value={(row.values[f.id] as number) ?? ''} onChange={(e) => updateCollectionCell(active.id, row.id, f.id, Number(e.target.value))} placeholder="—" />
                            ) : (
                              <input className="mar-lib-cell" value={(row.values[f.id] as string) ?? ''} onChange={(e) => updateCollectionCell(active.id, row.id, f.id, e.target.value)} placeholder="—" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {active.items.length === 0 && <div className="mar-lib-empty">{t('libraryEmpty', data.lang)}</div>}
              </div>
            </>
          ) : (
            <div className="mar-lib-empty" style={{ margin: 30 }}>{t('libraryEmpty', data.lang)}</div>
          )}
        </div>
      </SideDrawer>
    </>
  );
}
