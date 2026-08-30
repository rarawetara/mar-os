import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { isRepeating, REPEAT_OPTIONS, colorOf } from '../../lib/domain';
import { t } from '../../i18n';
import { OverlayScrim, CenterModal } from './Overlay';
import './Modals.css';

export default function SettingsModal() {
  const data = useDataStore();
  const { loadMode, setLoadMode, updateItem } = data;
  const { close } = useUIStore();

  const repeatItems = data.items.filter(isRepeating);

  return (
    <>
      <OverlayScrim />
      <CenterModal width={360}>
        <h3 className="mar-modal-title">{t('settings', data.lang)}</h3>

        <div className="mar-modal-field">
          <label className="mar-field-label">{t('loadMode', data.lang)}</label>
          <select className="mar-input" value={loadMode} onChange={(e) => setLoadMode(e.target.value as typeof loadMode)}>
            <option value="all">{t('loadModeAll', data.lang)}</option>
            <option value="meetings">{t('loadModeMeetings', data.lang)}</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontSize: 9.5, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginRight: 2 }}>{t('less', data.lang)}</span>
          {[15, 40, 65, 100].map((p) => (
            <div key={p} style={{ flex: 1, height: 9, borderRadius: 6, background: `color-mix(in srgb, var(--accent) ${p}%, var(--surface-2))` }} />
          ))}
          <span style={{ fontSize: 9.5, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginLeft: 2 }}>{t('more', data.lang)}</span>
        </div>

        <div style={{ fontFamily: 'var(--font-accent)', fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 7 }}>{t('recurring', data.lang)}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 180, overflowY: 'auto', marginBottom: 18 }}>
          {repeatItems.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.5 }}>{t('recurringEmpty', data.lang)}</div>}
          {repeatItems.map((it) => {
            const freqName = REPEAT_OPTIONS.find((r) => r.id === it.repeat?.freq)?.name;
            return (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.2px solid var(--border-strong)', borderRadius: 10, padding: '6px 9px', background: 'var(--surface)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: colorOf(data, it), flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{freqName}</span>
                <span
                  title={t('removeRepeat', data.lang)}
                  style={{ cursor: 'pointer', color: 'var(--text-faint)', fontSize: 12, flexShrink: 0 }}
                  onClick={() => updateItem(it.id, { repeat: null })}
                >✕</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="mar-key" onClick={close}>{t('esc', data.lang)}</button>
        </div>
      </CenterModal>
    </>
  );
}
