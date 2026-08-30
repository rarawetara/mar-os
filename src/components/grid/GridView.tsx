import { useEffect, useRef } from 'react';
import { useDataStore } from '../../store/dataStore';
import { dayLoad, HOUR_START, HOUR_PX } from '../../lib/domain';
import { periodDates } from '../../lib/domain';
import { hourLabels, gridHeightPx } from '../../lib/grid';
import { DOW_SHORT, DOW_SHORT_EN, parseDate, today } from '../../lib/date';
import DayColumn from './DayColumn';
import UntimedRow from './UntimedRow';
import './Grid.css';

export default function GridView() {
  const data = useDataStore();
  const { setAnchor } = data;
  const scrollRef = useRef<HTMLDivElement>(null);
  const dates = periodDates(data.view, data.anchor);
  const dowNames = data.lang === 'ru' ? DOW_SHORT : DOW_SHORT_EN;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (9 - HOUR_START) * HOUR_PX - 30;
    }
  }, []);

  const maxLoad = Math.max(1, ...dates.map((d) => dayLoad(data, d)));

  return (
    <div className="mar-grid-view">
      <div className="mar-day-heads">
        <div className="mar-hour-gutter" />
        {dates.map((date) => {
          const d = parseDate(date);
          const dowIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
          const load = dayLoad(data, date);
          return (
            <div
              key={date}
              className={`mar-day-head${date === data.anchor ? ' is-selected' : ''}`}
              onClick={() => setAnchor(date)}
            >
              <div className="mar-day-head-row">
                <span className="mar-day-num" style={date === today() ? { color: 'var(--accent-strong)' } : undefined}>{d.getDate()}</span>
                <span className="mar-day-name">{dowNames[dowIdx]}</span>
              </div>
              <div className="mar-day-load-track">
                <div className="mar-day-load-fill" style={{ width: `${Math.round((load / maxLoad) * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <UntimedRow dates={dates} />

      <div className="mar-hour-scroll" ref={scrollRef}>
        <div className="mar-hour-grid" style={{ height: gridHeightPx() }}>
          <div className="mar-hour-gutter mar-hour-labels">
            {hourLabels().map((h) => (
              <div key={h.minute} className="mar-hour-tick" style={{ top: ((h.minute - HOUR_START * 60) / 60) * HOUR_PX }}>{h.label}</div>
            ))}
          </div>
          {dates.map((date) => <DayColumn key={date} date={date} />)}
        </div>
      </div>
    </div>
  );
}
