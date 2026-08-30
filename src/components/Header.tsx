import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import { t } from '../i18n';
import type { ViewMode } from '../types';
import './Header.css';

const TABS: { id: ViewMode; key: 'day2' | 'week' | 'month' }[] = [
  { id: 'day2', key: 'day2' },
  { id: 'week', key: 'week' },
  { id: 'month', key: 'month' },
];

export default function Header() {
  const { view, setView, step, goToday, theme, toggleTheme, lang, toggleLang } = useDataStore();
  const { openLibrary, openSettings, openNotes } = useUIStore();

  return (
    <header className="mar-header">
      <div className="mar-logo">im Mär</div>

      <div className="mar-nav-group">
        <button className="mar-btn-round" title={t('back', lang)} aria-label={t('back', lang)} onClick={() => step(-1)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button className="mar-pill mar-today-btn" onClick={goToday}>{t('today', lang)}</button>
        <button className="mar-btn-round" title={t('forward', lang)} aria-label={t('forward', lang)} onClick={() => step(1)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      <div className="mar-view-switch">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`mar-view-tab${view === tab.id ? ' is-active' : ''}`}
            onClick={() => setView(tab.id)}
          >
            {t(tab.key, lang)}
          </button>
        ))}
      </div>

      <button className="mar-btn-round" title={t('notes', lang)} aria-label={t('notes', lang)} onClick={openNotes}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 3.5h9l4.5 4.5V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M15 3.5V8h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M8 12h8M8 15.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      <button className="mar-btn-round" title={t('library', lang)} aria-label={t('library', lang)} onClick={openLibrary}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 4.5h4.5v15H4a.7.7 0 0 1-.7-.7V5.2A.7.7 0 0 1 4 4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><rect x="9.7" y="4.5" width="4.5" height="15" rx="0.7" stroke="currentColor" strokeWidth="1.6" /><path d="M15.6 5.9l4 1-2.6 14.1-4-.9 2.6-14.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
      </button>
      <button className="mar-btn-round" title={t('settings', lang)} aria-label={t('settings', lang)} onClick={openSettings}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.7" /><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.2 6.2l1.6 1.6M16.2 16.2l1.6 1.6M17.8 6.2l-1.6 1.6M7.8 16.2l-1.6 1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
      </button>
      <button className="mar-btn-round mar-lang-btn" title="RU / EN" onClick={toggleLang}>
        {lang.toUpperCase()}
      </button>
      <button className="mar-btn-round" title={t('theme', lang)} aria-label={t('theme', lang)} onClick={toggleTheme}>
        {theme === 'light' ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" /></svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        )}
      </button>
    </header>
  );
}
