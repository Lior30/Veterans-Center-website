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
        
    case 'quarter': {
      const now   = new Date()
      const year  = now.getFullYear()
      const currQ = Math.floor(now.getMonth() / 3)         // 0-3

      // אם הגיע מספר רבעון מבחוץ – השתמש בו, אחרת הרבעון הנוכחי
      const q  = (filterOption.quarter ?? currQ)
      const sm = q * 3                        // month index 0 / 3 / 6 / 9

      const startDate = new Date(year, sm, 1, 0, 0, 0, 0)
      const endDate   =
        q === currQ
          ? now                                         // רבעון נוכחי → עד היום
          : new Date(year, sm + 3, 0, 23, 59, 59, 999)  // אחר → סוף אותו רבעון

      return { startDate, endDate }
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