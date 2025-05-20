import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

const messagesCol = collection(db, "messages");

export default {
  // Create a message (with optional activityId)
  async create(msg) {
    return addDoc(messagesCol, {
      ...msg,
      createdAt: new Date(),
    });
  },

  // List all messages (newest first)
  async list() {
    const q = query(messagesCol, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // List only messages attached to a given activity
  async listByActivity(activityId) {
    const q = query(
      messagesCol,
      where("activityId", "==", activityId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};