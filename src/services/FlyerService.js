// =========  src/services/FlyerService.js  =========
import { db, storage } from "../firebase";
import {
  collection, addDoc, getDocs, query, orderBy,
  doc, deleteDoc, writeBatch, serverTimestamp, Timestamp
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from "firebase/storage";

const FLYERS_COL   = "flyers";
const ONE_YEAR_MS  = 365 * 24 * 60 * 60 * 1000;

/* --- עזר --- */
function toTimestamp(dateStr, fallback) {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  return Timestamp.fromDate(d);
}

const FlyerService = {
  /* --- העלאה --- */
  async uploadFlyer({ file, name, startDate, endDate }) {
    // 1. העלאה ל-Storage
    const storageRef = ref(storage, `flyers/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file, { contentType: file.type });
    const fileUrl    = await getDownloadURL(storageRef);
    const storagePath = storageRef.fullPath;          // לבחירת deleteObject

    // 2. חישוב order הבא
    const snap      = await getDocs(collection(db, FLYERS_COL));
    const nextOrder = snap.size;                      // אפס-בייס

    // 3. תאריכים
    const nowTS   = serverTimestamp();
    const startTS = toTimestamp(startDate, nowTS);
    const endTS   = toTimestamp(
      endDate,
      Timestamp.fromMillis(Date.now() + ONE_YEAR_MS)
    );

    // 4. הוספת מסמך
    await addDoc(collection(db, FLYERS_COL), {
      name,
      fileUrl,
      storagePath,
      order: nextOrder,
      createdAt: nowTS,
      startDate: startTS,
      endDate: endTS,
      filename: file.name,
    });
  },

  /* --- שליפה (לניהול) --- */
  async getFlyers() {
    const snap = await getDocs(
      query(collection(db, FLYERS_COL), orderBy("order", "asc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /* --- שליפה פעילים (לאתר) --- */
  async getActiveFlyers() {
    const now = new Date();
    const all = await this.getFlyers();
    return all.filter((f) => {
      const start = f.startDate?.toDate?.() ?? new Date(0);
      const end   = f.endDate?.toDate?.() ?? new Date("9999-12-31");
      return start <= now && now <= end;
    });
  },

  /* --- מחיקה --- */
  async deleteFlyer(flyer) {
    // ① -Storage
    try {
      await deleteObject(ref(storage, flyer.storagePath));
    } catch (err) {
      if (err.code !== "storage/object-not-found") throw err;
    }
    // ② -Firestore
    await deleteDoc(doc(db, FLYERS_COL, flyer.id));
  },

  /* --- החלפת סדר (Drag & Drop) --- */
  async swapOrder(a, b) {
    const batch = writeBatch(db);
    batch.update(doc(db, FLYERS_COL, a.id), { order: a.order });
    batch.update(doc(db, FLYERS_COL, b.id), { order: b.order });
    await batch.commit();
  },
};

export default FlyerService;
