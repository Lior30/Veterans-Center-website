// src/components/LineTimeFilter.jsx
import React from 'react';

/**
 * Re-usable time-range filter.
 *
 * @param {Object}   props.value            Current filter {type, year?, month?, week?}
 * @param {Function} props.onChange         Callback to set a new filter
 * @param {Boolean}  [props.hideWeek=false] If true – do not render the week selector
 */
export default function LineTimeFilter({ value, onChange, hideWeek = false }) {
  const { type, month, week } = value;

  /** Merge helper – keeps the rest of the filter intact */
  const set = patch => onChange({ ...value, ...patch });

  /** Month labels in Hebrew for the drop-down */
  const HEB_MONTHS = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
  ];

  /** Render week selector only when relevant */
  const showWeekSelector = type === 'month' && !hideWeek;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label>סינון לפי טווח זמן:&nbsp;</label>

      {/* main type selector */}
      <select
        value={type}
        onChange={e => set({ type: e.target.value, week: undefined })}
      >
        <option value="quarterPrev">רבעון קודם</option>
        <option value="year">שנה אחרונה</option>
        <option value="month">חודש</option>
      </select>

      {/* month selector – shown only in “month” mode */}
      {type === 'month' && (
        <>
          &nbsp;
          <select
            value={month ?? new Date().getMonth()}
            onChange={e => set({ month: +e.target.value, week: undefined })}
          >
            {HEB_MONTHS.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
        </>
      )}

      {/* optional week-in-month selector */}
      {showWeekSelector && (
        <>
          &nbsp;
          <select
            value={week ?? ''}
            onChange={e =>
              set({
                week: e.target.value === '' ? undefined : +e.target.value,
              })
            }
          >
            <option value="">כל החודש</option>
            {[0, 1, 2, 3, 4].map(w => (
              <option key={w} value={w}>שבוע {w + 1}</option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}