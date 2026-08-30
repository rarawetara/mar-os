import { useEffect } from 'react';
import { useDataStore } from './store/dataStore';
import { useUIStore } from './store/uiStore';
import { fontForLang } from './i18n';
import Header from './components/Header';
import Rail from './components/rail/Rail';
import GridView from './components/grid/GridView';
import MonthView from './components/month/MonthView';
import StatusBar from './components/StatusBar';
import TaskModal from './components/modals/TaskModal';
import SettingsModal from './components/modals/SettingsModal';
import ProjectDrawer from './components/modals/ProjectDrawer';
import NotesScreen from './components/notes/NotesScreen';
import LibraryScreen from './components/library/LibraryScreen';
import './App.css';

export default function App() {
  const { view, theme, lang, setView, goToday } = useDataStore();
  const { overlay, close } = useUIStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-accent', fontForLang(lang));
  }, [lang]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') close();
        return;
      }
      if (e.key === 'Escape') { close(); return; }
      if (e.key === '1') setView('day2');
      else if (e.key === '2') setView('week');
      else if (e.key === '3') setView('month');
      else if (e.key === 't' || e.key === 'е') goToday();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, setView, goToday]);

  return (
    <div className="mar-app">
      <Header />
      <div className="mar-body">
        <Rail />
        <div className="mar-main">
          {view === 'month' ? <MonthView /> : <GridView />}
        </div>
      </div>
      <StatusBar />

      {overlay === 'card' && <TaskModal />}
      {overlay === 'settings' && <SettingsModal />}
      {overlay === 'project' && <ProjectDrawer />}
      {overlay === 'notes' && <NotesScreen />}
      {overlay === 'library' && <LibraryScreen />}
    </div>
  );
}
