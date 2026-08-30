// Date helpers. Dates are represented as local yyyy-mm-dd strings throughout
// the app to avoid timezone drift when comparing/persisting.

export const pad2 = (n: number) => (n < 10 ? '0' : '') + n;

export const fmtDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const parseDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: string, n: number) => {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return fmtDate(d);
};

export const today = () => fmtDate(new Date());

export const minToHHMM = (m: number) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;

export const hhmmToMin = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + (m || 0);
};

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Monday-first ISO week start for the given date string. */
export const weekStart = (s: string) => {
  const d = parseDate(s);
  const dow = d.getDay();
  const off = dow === 0 ? -6 : 1 - dow;
  return addDays(s, off);
};

export const isSameDay = (a: string, b: string) => a === b;

export const DOW_SHORT = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
export const DOW_SHORT_EN = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const DOW_FULL_ACC = ['понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу', 'воскресенье'];
export const MONTHS_NOM_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
export const MONTHS_NOM_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** dow index with Monday=0..Sunday=6 */
export const mondayDow = (d: Date) => (d.getDay() === 0 ? 6 : d.getDay() - 1);
