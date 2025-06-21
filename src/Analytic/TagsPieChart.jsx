// src/components/TagsPieChart.jsx
import React, { useMemo } from 'react';
import { ResponsivePie }   from '@nivo/pie';
import TagsDetailsPage from './TagsDetailsPage';

/* ───────────── צבעים קבועים (עד 10) ───────────── */
const BASE_COLORS = [
  '#7e64e0', // סגול
  '#3de2da', // טורקיז
  '#ffe87e', // צהוב-פסטל
  '#ff9d02', // כתום
  '#00b7ff', // תכלת
  '#d7c4ff', // סגול-בהיר
  '#4e2fa7', // סגול-כהה
  '#8c564b', // חום-אדמדם
  '#e377c2', // ורוד
  '#17becf'  // כחול-ירקרק
];

/* ── מחולל צבעים נוספים שלא דומים ל-BASE_COLORS ── */
function createColorPicker(base = BASE_COLORS) {
  const usedHue = base.map(hexToHue);

  return function pick() {
    let h    = 0;
    let tries = 0;
    do {
      h = Math.floor(Math.random() * 360);
      tries++;
    } while (usedHue.some(u => Math.abs(u - h) < 25) && tries < 50);

    usedHue.push(h);
    return `hsl(${h} 70% 55%)`;
  };
}

/* Hex → Hue (0-360) */
function hexToHue(hex) {
  const [r, g, b] = [1, 3, 5].map(i =>
    parseInt(hex.slice(i, i + 2), 16) / 255
  );
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;

  const d = max - min;
  const h =
    max === r ? (g - b) / d + (g < b ? 6 : 0)
    : max === g ? (b - r) / d + 2
    : (r - g) / d + 4;

  return h * 60;
}

/* ────────────────── קומפוננטת העוגה ────────────────── */
export default function TagsPieChart({ activities = [] }) {

  /* יוצר פעם אחת מחולל-צבעים, לא בכל רינדור */
  const pickExtraColor = useMemo(
    () => createColorPicker(BASE_COLORS),
    []
  );

  /* ---------- עיבוד נתונים ---------- */
  const pieData = useMemo(() => {
    /* ➊ צבירת משתתפים-וקיבולת לפי תגית */
    const byTag = {};
    activities.forEach(
      ({ tag, participants = 0, capacity = 0 }) => {
        if (!byTag[tag]) byTag[tag] = { p: 0, c: 0 };
        byTag[tag].p += participants;
        byTag[tag].c += capacity;
      }
    );

    /* ➋ יחס ניצול גולמי */
    const raw = Object.entries(byTag).map(([tag, { p, c }]) => ({
      tag,
      ratio: c ? p / c : 0            // בין 0-1
    }));

    /* ➌ נרמול לסכום 100% */
    const total = raw.reduce((s, d) => s + d.ratio, 0) || 1;

    /* ➍ מיון + הצמדת צבע */
    return raw
      .sort((a, b) => b.ratio - a.ratio)              // גדול → קטן
      .map(({ tag, ratio }, idx) => ({
        id   : tag,
        label: tag,
        value: (ratio / total) * 100,                // אחוזים
        color: BASE_COLORS[idx] ?? pickExtraColor()
      }));
  }, [activities, pickExtraColor]);

  if (!pieData.length) {
    return <p style={{ textAlign: 'center' }}>אין נתונים להצגה</p>;
  }

  /* ---------- UI ---------- */
  return (
    <div
      style={{
        height: 300,
        display: 'flex',
        columnGap: 24,
        direction: 'ltr'      // סרגל גלילה מימין בלג'נד
      }}
    >
      {/* ── Pie ── */}
      <div style={{ flex: 1 }}>
        <ResponsivePie
          data={pieData}
          colors={d => d.data.color}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          innerRadius={0}
          padAngle={0.5}
          cornerRadius={3}
          enableArcLabels={false}
          enableSliceLabels={false}
          enableArcLinkLabels={false}
          animate={false}               // אין “קפיצה” בהובר
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          tooltip={({ datum }) => (
            <div style={{ padding: 8, direction: 'rtl' }}>
              <strong>{datum.id}</strong><br />
              {datum.value.toFixed(1)}%
            </div>
          )}
        />
      </div>

      {/* ── Legend ── */}
      <div
        style={{
          width: 140,
          maxHeight: 260,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          paddingInlineEnd: 4,
          paddingTop: 16    // כדי שלא יידבק למעלה
        }}
      >
        {pieData.map(item => (
          <div
            key={item.id}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: item.color,
                flexShrink: 0
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: '#495057',
                direction: 'rtl',
                whiteSpace: 'normal',
                lineHeight: 1.25
              }}
            >
              {item.label}<br />
              {item.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}