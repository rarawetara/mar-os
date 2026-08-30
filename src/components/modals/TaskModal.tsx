import { useEffect, useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import { MEETING_KINDS, REPEAT_OPTIONS, PALETTE, fmtMin, loggedMin } from '../../lib/domain';
import type { Item, ItemType, RepeatFreq } from '../../types';
import { t } from '../../i18n';
import { OverlayScrim, CenterModal } from './Overlay';
import './Modals.css';

const empty: Omit<Item, 'id'> = {
  title: '', type: 'task', meetingKind: null, projectId: null, date: null, start: null,
  duration: 30, deadline: null, plannedMin: null, done: false, comment: '', colorOverride: null,
  timeEntries: [], activeTimerStart: null, repeat: null, doneDates: [], skipDates: [],
};

export default function TaskModal() {
  const data = useDataStore();
  const { projects, addItem, updateItem, deleteItem } = data;
  const { editingItemId, close, quickAddDate, quickAddStart } = useUIStore();
  const isNew = editingItemId === 'new';
  const original = !isNew ? data.items.find((i) => i.id === editingItemId) : null;

  const [form, setForm] = useState<Omit<Item, 'id'>>(() => (original ? { ...original } : { ...empty, date: quickAddDate, start: quickAddStart }));

  useEffect(() => {
    setForm(original ? { ...original } : { ...empty, date: quickAddDate, start: quickAddStart });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingItemId]);

  const set = <K extends keyof Item>(k: K, v: Item[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.title.trim()) { close(); return; }
    if (isNew) addItem(form);
    else if (original) updateItem(original.id, form);
    close();
  };
  const remove = () => { if (original) deleteItem(original.id); close(); };

  const logged = original ? loggedMin(original) : 0;

  return (
    <>
      <OverlayScrim />
      <CenterModal width={420}>
        <h3 className="mar-modal-title">{t('taskCard', data.lang)}</h3>

        <div className="mar-modal-field">
          <label className="mar-field-label">{t('title', data.lang)}</label>
          <input className="mar-input" value={form.title} onChange={(e) => set('title', e.target.value)} autoFocus />
        </div>

        <div className="mar-modal-row">
          <div>
            <label className="mar-field-label">{t('type', data.lang)}</label>
            <select className="mar-input" value={form.type} onChange={(e) => set('type', e.target.value as ItemType)}>
              <option value="task">{t('task', data.lang)}</option>
              <option value="meeting">{t('meeting', data.lang)}</option>
            </select>
          </div>
          {form.type === 'meeting' && (
            <div>
              <label className="mar-field-label">{t('meetingKind', data.lang)}</label>
              <select className="mar-input" value={form.meetingKind || 'meeting'} onChange={(e) => set('meetingKind', e.target.value as Item['meetingKind'])}>
                {MEETING_KINDS.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="mar-modal-field">
          <label className="mar-field-label" style={{ display: 'flex', gap: 8 }}>
            <span style={{ flex: 1 }}>{t('project', data.lang)}</span>
          </label>
          <select className="mar-input" value={form.projectId || ''} onChange={(e) => set('projectId', e.target.value || null)}>
            <option value="">{t('noProject', data.lang)}</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="mar-modal-row">
          <div>
            <label className="mar-field-label">{t('day', data.lang)}</label>
            <input type="date" className="mar-input" value={form.date || ''} onChange={(e) => set('date', e.target.value || null)} />
          </div>
          <div>
            <label className="mar-field-label">{t('start', data.lang)}</label>
            <input
              type="time"
              className="mar-input"
              value={form.start != null ? `${String(Math.floor(form.start / 60)).padStart(2, '0')}:${String(form.start % 60).padStart(2, '0')}` : ''}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) { set('start', null); return; }
                const [h, m] = v.split(':').map(Number);
                set('start', h * 60 + m);
              }}
            />
          </div>
          <div>
            <label className="mar-field-label">{t('durationMin', data.lang)}</label>
            <input type="number" min={5} step={5} className="mar-input" value={form.duration} onChange={(e) => set('duration', Number(e.target.value) || 5)} />
          </div>
        </div>

        <div className="mar-modal-row">
          <div>
            <label className="mar-field-label">{t('deadline', data.lang)}</label>
            <input type="datetime-local" className="mar-input" value={form.deadline || ''} onChange={(e) => set('deadline', e.target.value || null)} />
          </div>
          <div>
            <label className="mar-field-label">{t('plannedHours', data.lang)}</label>
            <input type="number" min={0} step={0.25} className="mar-input" value={form.plannedMin != null ? form.plannedMin / 60 : ''} onChange={(e) => set('plannedMin', e.target.value ? Number(e.target.value) * 60 : null)} />
          </div>
        </div>

        <div className="mar-modal-row">
          <div style={{ flex: 1.4 }}>
            <label className="mar-field-label">{t('repeat', data.lang)}</label>
            <select
              className="mar-input"
              value={form.repeat?.freq || 'none'}
              onChange={(e) => {
                const freq = e.target.value as RepeatFreq;
                set('repeat', freq === 'none' ? null : { freq, until: form.repeat?.until || null });
              }}
            >
              {REPEAT_OPTIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {form.repeat && form.repeat.freq !== 'none' && (
            <div>
              <label className="mar-field-label">{t('until', data.lang)}</label>
              <input type="date" className="mar-input" value={form.repeat.until || ''} onChange={(e) => set('repeat', { freq: form.repeat!.freq, until: e.target.value || null })} />
            </div>
          )}
        </div>

        <div className="mar-modal-field">
          <label className="mar-field-label">{t('color', data.lang)}</label>
          <div className="mar-swatch-row">
            <div className="mar-swatch" style={{ background: 'var(--surface-2)', color: 'var(--text)' }} onClick={() => set('colorOverride', null)}>—</div>
            {PALETTE.map((c) => (
              <div key={c} className={`mar-swatch${form.colorOverride === c ? ' is-picked' : ''}`} style={{ background: c }} onClick={() => set('colorOverride', c)} />
            ))}
          </div>
        </div>

        <div className="mar-modal-field">
          <label className="mar-field-label">{t('comment', data.lang)}</label>
          <textarea className="mar-input" style={{ minHeight: 58, resize: 'vertical' }} value={form.comment} onChange={(e) => set('comment', e.target.value)} />
        </div>

        {original && (
          <div className="mar-modal-field">
            <label className="mar-field-label">{t('timeTracking', data.lang)} · {t('totalLabel', data.lang)} {fmtMin(logged)}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {original.timeEntries.length === 0 && <span style={{ color: 'var(--text-faint)', fontSize: 11.5 }}>{t('timerNeverRun', data.lang)}</span>}
              {original.timeEntries.map((e, i) => (
                <div key={i} className="mar-time-entry">
                  <span>{new Date(e.start).toLocaleTimeString().slice(0, 5)}–{new Date(e.end).toLocaleTimeString().slice(0, 5)}</span>
                  <span>{fmtMin((e.end - e.start) / 60000)}</span>
                  <span className="mar-time-entry-del" onClick={() => updateItem(original.id, { timeEntries: original.timeEntries.filter((_, j) => j !== i) })}>✕</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mar-modal-footer">
          {original ? <button className="mar-danger-btn" onClick={remove}>{t('delete', data.lang)}</button> : <span />}
          <div className="mar-modal-footer-right">
            <button className="mar-key" onClick={close}>{t('esc', data.lang)}</button>
            <button className="mar-save-btn" onClick={save}>{original ? t('save', data.lang) : t('add', data.lang)}</button>
          </div>
        </div>
      </CenterModal>
    </>
  );
}
