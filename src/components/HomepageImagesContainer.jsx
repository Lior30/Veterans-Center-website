import React, { useEffect, useState, useCallback } from "react";
import HomepageImagesDesign from "./HomepageImagesDesign.jsx";

import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";            // ← משנה נתיב אם צריך

/** Container – טוען ומנהל את הבאנרים, מעביר ל-Design */
export default function HomepageImagesContainer() {
  const [banners, setBanners] = useState([]);

  /** טעינה מחדש של כל הבאנרים */
  const loadBanners = useCallback(async () => {
    const snap = await getDocs(collection(db, "homepageBanners"));
    setBanners(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, []);

  useEffect(() => { loadBanners(); }, [loadBanners]);

  /** מחיקה */
  const handleDelete = async (id) => {
    if (!window.confirm("למחוק באנר זה?")) return;
    await deleteDoc(doc(db, "homepageBanners", id));
    loadBanners();
  };

  return (
    <HomepageImagesDesign
      banners={banners}
      onUpload={loadBanners}
      onDelete={handleDelete}
    />
  );
}
