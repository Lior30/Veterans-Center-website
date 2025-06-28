// src/utils/timeFilters.js
/**
 * מחזיר טווח תאריכים (startDate, endDate) לפי filterOption:
 *  • מחרוזת: 'quarter' | 'quarterPrev' | 'month' | 'year'
 *  • אובייקט: { type, year?, month?, week? }
 */
export function getDateRange(filterOption) {
  const now = new Date();

  // תומך גם במחרוזת וגם באובייקט
  const { type, year, month, week } =
    typeof filterOption === 'string'
      ? { type: filterOption }
      : filterOption;

  let startDate, endDate;

  switch (type) {
    /* ───────── רבעון קודם ───────── */
    case 'quarter':
    case 'quarterPrev': {
      const currentQuarter = Math.floor(now.getMonth() / 3);   // 0-3
      let prevQuarter = currentQuarter - 1;
      let qYear = now.getFullYear();

      if (prevQuarter < 0) {        // מתגלגל לשנה קודמת
        prevQuarter += 4;
        qYear--;
      }

      const monthIdx = prevQuarter * 3;        // 0,3,6,9
      startDate = new Date(qYear, monthIdx, 1);
      endDate   = new Date(qYear, monthIdx + 3, 0, 23, 59, 59, 999);
      break;
    }

    /* ───────── שנה אחרונה ───────── */
    case 'year': {
      startDate = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      endDate = now;
      break;
    }

    /* ───────── חודש נבחר ───────── */
    case 'month': {
      const y = year  ?? now.getFullYear();   // ברירת־מחדל: השנה הנוכחית
      const m = month ?? now.getMonth();      // ברירת־מחדל: החודש הנוכחי

      // טווח ברירת-מחדל – כל החודש
      startDate = new Date(y, m, 1);
      endDate   = new Date(y, m + 1, 0, 23, 59, 59, 999);

      // צמצום לשבוע ספציפי (0-4) אם סופק
      if (typeof week === 'number') {
        const wStart = new Date(y, m, 1 + week * 7);
        const lastDay = new Date(y, m + 1, 0).getDate();
        const wEndDay = Math.min(wStart.getDate() + 6, lastDay);
        startDate = wStart;
        endDate   = new Date(y, m, wEndDay, 23, 59, 59, 999);
      }
      break;
    }

    default:
      throw new Error(`unknown filter "${type}"`);
  }

  return { startDate, endDate };
}