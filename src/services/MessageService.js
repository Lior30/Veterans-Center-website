//src/services/MessageService.js  
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

const messagesCol = collection(db, "messages");
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function toTimestamp(dateStr, fallback) {
  return dateStr ? Timestamp.fromDate(new Date(dateStr)) : fallback;
}

export default {
  /* new message */
  async create(msg) {
    const nowTS = Timestamp.now();
    const startTS = toTimestamp(msg.startDate, nowTS);
    const endTS = toTimestamp(
      msg.endDate,
      Timestamp.fromDate(new Date(Date.now() + ONE_YEAR_MS))
    );

    return addDoc(messagesCol, {
      ...msg,
      startDate: startTS,
      endDate: endTS,
      createdAt: nowTS,
      order: msg.order ?? 0,
    });
  },

  /* order */
  async list() {
    const snap = await getDocs(query(messagesCol, orderBy("order", "asc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /* dates */
  async listActive() {
    const now = new Date();
    const all = await this.list();
    return all.filter((m) => {
      const start = m.startDate?.toDate?.() ?? new Date(0);
      const end = m.endDate?.toDate?.() ?? new Date("9999-12-31");
      return start <= now && now <= end;
    });
  },

  /* switch*/
  async swapOrder(a, b) {
    // a & b id + order
    const batch = writeBatch(db);
    batch.update(doc(messagesCol, a.id), { order: b.order });
    batch.update(doc(messagesCol, b.id), { order: a.order });
    await batch.commit();
  },
};
