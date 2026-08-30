import type { AppData } from '../types';
import { newItem, uid, PALETTE, PROJECT_ICONS } from '../lib/domain';
import { today, addDays } from '../lib/date';

export function seed(): AppData {
  const t = today();
  const projects = [
    { id: uid(), name: 'Личное', color: PALETTE[0], icon: PROJECT_ICONS[3] },
    { id: uid(), name: 'Работа', color: PALETTE[6], icon: PROJECT_ICONS[4] },
    { id: uid(), name: 'Здоровье', color: PALETTE[7], icon: PROJECT_ICONS[0] },
  ];
  const [personal, work, health] = projects;

  const items = [
    newItem({ title: 'Созвон с командой', type: 'meeting', meetingKind: 'meeting', projectId: work.id, date: t, start: 10 * 60, duration: 45 }),
    newItem({ title: 'Разобрать почту', type: 'task', projectId: work.id, date: t, start: 9 * 60, duration: 30 }),
    newItem({ title: 'Пробежка', type: 'task', projectId: health.id, date: t, start: 19 * 60, duration: 40 }),
    newItem({ title: 'Купить продукты', type: 'task', projectId: personal.id }),
    newItem({ title: 'Записаться к врачу', type: 'task', projectId: health.id }),
    newItem({ title: 'Оплатить интернет', type: 'task', projectId: personal.id, date: addDays(t, 1), start: 12 * 60, duration: 15 }),
  ];

  const notes = [
    { id: uid(), title: 'Мысли на неделю', body: 'Меньше созвонов, больше длинных блоков. Утро — только своё.', color: 'paper-1', tags: ['план'], date: null, pinned: true, updatedAt: Date.now() },
    { id: uid(), title: 'Купить', body: 'кофе\nлампочки E14\nбумага для принтера', color: 'paper-3', tags: ['дом'], date: null, pinned: false, updatedAt: Date.now() },
  ];

  const fb = 'f_' + uid(), fa = 'f_' + uid(), fs = 'f_' + uid();
  const collections = [
    { id: uid(), name: 'Библиотека', icon: '📚', fields: [
      { id: fb, name: 'Книга', type: 'text' as const },
      { id: fa, name: 'Автор', type: 'text' as const },
      { id: fs, name: 'Статус', type: 'select' as const, options: ['хочу', 'читаю', 'прочитано'] },
    ], items: [{ id: uid(), values: { [fb]: 'Слепота', [fa]: 'Жозе Сарамаго', [fs]: 'читаю' } }] },
    { id: uid(), name: 'Список желаний', icon: '✨', fields: [
      { id: 'f_' + uid(), name: 'Название', type: 'text' as const },
      { id: 'f_' + uid(), name: 'Приоритет', type: 'rating' as const },
    ], items: [] },
  ];

  const projectFilter: Record<string, boolean> = {};

  return {
    projects, items, notes, collections, projectFilter,
    view: 'week', anchor: t, loadMode: 'all', theme: 'light', lang: 'ru',
  };
}
