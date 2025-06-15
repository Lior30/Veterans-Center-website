import React, { useState, useEffect, useRef } from "react";
import HomepageImagesDesign from "./HomepageImagesDesign.jsx";
import BannerService from "../services/BannerService.js";

export default function HomepageImagesContainer() {
  const [banners, setBanners] = useState([]);
  const dragIndexRef = useRef(null);

  /* ───── טעינה ראשונית ───── */
  useEffect(() => { load(); }, []);
  const load = async () => {
    const list = await BannerService.getBanners();
    /* אם חסרים שדות ישנים - מתקנים ושומרים */
    const batchFixes = [];
    list.forEach((b, idx) => {
      const fix = {};
      if (b.order === undefined)      fix.order       = idx;
      if (b.durationSec === undefined) fix.durationSec = 5;
      if (Object.keys(fix).length) batchFixes.push({ id: b.id, fix });
    });
    /* כתיבה מרוכזת כדי לא להציף את DB */
    await Promise.all(batchFixes.map(({ id, fix }) => BannerService.updateBanner(id, fix)));
    setBanners(list.map((b, i) => ({ ...b, order: b.order ?? i, durationSec: b.durationSec ?? 5 })));
  };

  /* ───── Drag & Drop ───── */
  const handleDragStart  = (_, idx)      => { dragIndexRef.current = idx; };
  const handleDragEnter  = async (_, idx) => {
    const dragIdx = dragIndexRef.current;
    if (dragIdx === null || dragIdx === idx) return;

    /* UI מיידית */
    setBanners((prev) => {
      const next = [...prev];
      [next[dragIdx], next[idx]] = [next[idx], next[dragIdx]];
      return next.map((b, i) => ({ ...b, order: i }));
    });

    /* שמירה ב-DB */
    try {
      await BannerService.swapOrder(
        { id: banners[dragIdx].id, order: idx },
        { id: banners[idx].id,     order: dragIdx }
      );
      dragIndexRef.current = idx;
    } catch (err) {
      alert("שמירת הסדר נכשלה: " + err.code);
      load(); // משחזר
    }
  };

  /* ───── שינוי משך הצגה ───── */
  const handleDurationChange = (id, val) =>
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, durationSec: val } : b)));

  const handleDurationBlur = async (id, val) => {
    try { await BannerService.updateBanner(id, { durationSec: val }); }
    catch (err) { alert("השמירה נכשלה: " + err.code); }
  };

  /* ───── העלאה / מחיקה ───── */
  const reload     = () => load();
  const handleDelete = async (banner) => {
    if (!window.confirm(`למחוק את "${banner.title}"?`)) return;
    await BannerService.deleteBanner(banner);
    load();
  };

  return (
    <HomepageImagesDesign
      banners={banners}
      onUpload={reload}
      onDelete={handleDelete}
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      onDurationChange={handleDurationChange}
      onDurationBlur={handleDurationBlur}
    />
  );
}
