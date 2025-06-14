// =========  src/services/FlyerService.js  =========
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const FLYERS_COL = "flyers";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/* ─── עזר ─── */
function toTimestamp(dateStr, fallback) {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  return Timestamp.fromDate(d);
}

const FlyerService = {
  /* ─── העלאת פלייר ─── */
  async uploadFlyer({ file, name, startDate, endDate }) {
    // 1. העלאה ל-Storage
    const storageRef = ref(storage, `flyers/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);
    const storagePath = storageRef.fullPath; // <-- הנתיב המדויק

    // 2. חישוב order הבא
    const snap = await getDocs(collection(db, FLYERS_COL));
    const nextOrder = snap.size;

    // 3. תאריכים
    const nowTS = serverTimestamp();
    const startTS = toTimestamp(startDate, nowTS);
    const endTS = toTimestamp(
      endDate,
      Timestamp.fromDate(new Date(Date.now() + ONE_YEAR_MS))
    );

    // 4. כתיבת מסמך
    await addDoc(collection(db, FLYERS_COL), {
      name,
      fileUrl,
      storagePath, // ← נשמר במסמך
      order: nextOrder,
      createdAt: nowTS,
      startDate: startTS,
      endDate: endTS,
    });
  },

  /* ─── שליפת כל הפליירים (לניהול) ─── */
  async getFlyers() {
    const snap = await getDocs(
      query(collection(db, FLYERS_COL), orderBy("order", "asc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /* ─── שליפת פליירים פעילים (לאתר) ─── */
  async getActiveFlyers() {
    const now = new Date();
    const all = await this.getFlyers();
    return all.filter((f) => {
      const start = f.startDate?.toDate?.() ?? new Date(0);
      const end = f.endDate?.toDate?.() ?? new Date("9999-12-31");
      return start <= now && now <= end;
    });
  },

  /* ─── מחיקה מוחלטת ─── */
  async deleteFlyer(flyer) {
    /* ① מחיקת הקובץ מ-Storage */
    try {
      if (flyer.storagePath) {
        // חדש – יש storagePath מדויק
        await deleteObject(ref(storage, flyer.storagePath));
      } else {
        // ישנים – מפענח מה-URL
        const encoded = flyer.fileUrl.split("/o/")[1].split("?")[0];
        const decoded = decodeURIComponent(encoded);
        await deleteObject(ref(storage, decoded));
      }
    } catch (err) {
      // אם הקובץ כבר לא קיים ב-Bucket → ממשיכים למחיקת המסמך
      if (err.code !== "storage/object-not-found") throw err;
    }

    /* ② מחיקת המסמך מ-Firestore */
    await deleteDoc(doc(db, FLYERS_COL, flyer.id));
  },

  /* ─── החלפת סדר (Drag & Drop) ─── */
  async swapOrder(a, b) {
    const batch = writeBatch(db);
    batch.update(doc(db, FLYERS_COL, a.id), { order: a.order });
    batch.update(doc(db, FLYERS_COL, b.id), { order: b.order });
    await batch.commit();
  },
};

export default FlyerService;
