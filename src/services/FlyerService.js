// =========  src/services/FlyerService.js  =========
import { db, storage } from "../firebase";
import {
  collection, addDoc, getDocs, doc, deleteDoc,
  serverTimestamp, orderBy, writeBatch, query,
  Timestamp,
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL, deleteObject,
} from "firebase/storage";

const FLYERS_COL = "flyers";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function toTimestamp(dateStr, fallback) {
  return dateStr
    ? Timestamp.fromDate(new Date(dateStr))
    : fallback;
}

const FlyerService = {
  /* ─── העלאה ─── */
  async uploadFlyer(name, file, startDate, endDate) {
    if (!name || !file) throw new Error("Name / file missing");

    const fileName   = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `flyers/${fileName}`);
    await uploadBytes(storageRef, file);
    const fileUrl    = await getDownloadURL(storageRef);

    // קביעת סדר תצוגה הבא
    const nextOrder  = (await getDocs(collection(db, FLYERS_COL))).size;
    const nowTS      = Timestamp.now();
    const startTS    = toTimestamp(startDate, nowTS);
    const endTS      = toTimestamp(
      endDate,
      Timestamp.fromDate(new Date(Date.now() + ONE_YEAR_MS))
    );

    await addDoc(collection(db, FLYERS_COL), {
      name,
      fileUrl,
      url      : fileUrl,   // תאימות לאחור
      order    : nextOrder,
      createdAt: serverTimestamp(),
      startDate: startTS,
      endDate  : endTS,
    });
  },

  /* ─── שליפה (לניהול) ─── */
  async getFlyers() {
    const snap = await getDocs(query(collection(db, FLYERS_COL), orderBy("order", "asc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /* ─── לשליפת Landing / Guest ─── */
  async getActiveFlyers() {
    const now = new Date();
    const all = await this.getFlyers();
    return all.filter((f) => {
      const start = f.startDate?.toDate?.() ?? new Date(0);
      const end   = f.endDate?.toDate?.()   ?? new Date("9999-12-31");
      return start <= now && now <= end;
    });
  },

  async deleteFlyer(flyer) {
    const path = flyer.fileUrl.split("/o/")[1].split("?")[0];
    await deleteObject(ref(storage, path));
    await deleteDoc(doc(db, FLYERS_COL, flyer.id));
  },

  async swapOrder(a, b) {
    const batch = writeBatch(db);
    batch.update(doc(db, FLYERS_COL, a.id), { order: a.order });
    batch.update(doc(db, FLYERS_COL, b.id), { order: b.order });
    await batch.commit();
  },
};

export default FlyerService;
