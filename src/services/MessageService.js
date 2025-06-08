// =========  src/services/MessageService.js  =========
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  Timestamp,
  query,
   doc,
  writeBatch,
} from "firebase/firestore";

const messagesCol = collection(db, "messages");
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function toTimestamp(dateStr, fallback) {
  return dateStr ? Timestamp.fromDate(new Date(dateStr)) : fallback;
}

export default {
  /* ─── יצירת הודעה ─── */
  async create(msg) {
    const nowTS   = Timestamp.now();
    const startTS = toTimestamp(msg.startDate, nowTS);
    const endTS   = toTimestamp(
      msg.endDate,
      Timestamp.fromDate(new Date(Date.now() + ONE_YEAR_MS))
    );

    return addDoc(messagesCol, {
      ...msg,
      startDate: startTS,
      endDate  : endTS,
      createdAt: nowTS,
      order    : msg.order ?? 0,
    });
  },

  /* ─── כל ההודעות לפי order ─── */
  async list() {
    const snap = await getDocs(query(messagesCol, orderBy("order", "asc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /* ─── הודעות פעילות (טווח תאריכים) ─── */
  async listActive() {
    const now = new Date();
    const all = await this.list();
    return all.filter((m) => {
      const start = m.startDate?.toDate?.() ?? new Date(0);
      const end   = m.endDate?.toDate?.()   ?? new Date("9999-12-31");
      return start <= now && now <= end;
    });
  },

 /* ─── החלפת סדר בין שתי הודעות ─── */
 async swapOrder(a, b) {
   // a & b הם אובייקטים עם id + order
   const batch = writeBatch(db);
    batch.update(doc(messagesCol, a.id), { order: b.order });
   batch.update(doc(messagesCol, b.id), { order: a.order });
    await batch.commit();
 },
};
