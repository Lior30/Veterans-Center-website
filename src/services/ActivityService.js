// src/services/ActivityService.js
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  getDoc,
  runTransaction,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";

export default class ActivityService {
  /* collection constants */
  static COL    = "activities";
  static colRef = collection(db, ActivityService.COL);

  /* ──────────────────────────── Realtime stream ──────────────────────────── */
  static subscribe(callback) {
    return onSnapshot(
      ActivityService.colRef,
      (snap) =>
        callback(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            weekdays:    d.data().weekdays    || [],
            registrants: d.data().registrants || [],
            tags:        d.data().tags        || [],
          }))
        ),
      console.error
    );
  }

  /* ───────────────────────────── CRUD helpers ───────────────────────────── */

  /** ➕ create */
  static add(data) {
    return addDoc(ActivityService.colRef, data);
  }

  /** ✏️ update */
  static update(id, data) {
    return updateDoc(doc(db, ActivityService.COL, id), data);
  }

  /** ⚡ save (create or update) – with sanitisation */
  static async save(activity) {
    // clone – never mutate caller’s object
    const data = { ...activity };

    /* ---------- normalise optional numeric fields ---------- */
    if (data.capacity === "" || data.capacity === null) {
      delete data.capacity;
    } else if (data.capacity !== undefined) {
      data.capacity = Number(data.capacity);
    }

    /* ---------- drop empty arrays / fields ---------- */
    if (!data.recurring) delete data.weekdays;
    if (!Array.isArray(data.weekdays) || data.weekdays.length === 0)
      delete data.weekdays;

    if (!Array.isArray(data.tags) || data.tags.length === 0) delete data.tags;

    /* ---------- strip id before sending ---------- */
    const { id, ...payload } = data;

    return id
      ? ActivityService.update(id, payload)
      : ActivityService.add(payload);
  }

  /** get single doc */
  static async get(id) {
    const snap = await getDoc(doc(db, ActivityService.COL, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  /* ──────────────────────── Registration helpers ──────────────────────── */

  /** ➕ user registers (transaction = capacity safe) */
  static async registerUser(activityId, userId) {
    const ref = doc(db, ActivityService.COL, activityId);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("NOT_FOUND");

      const data        = snap.data();
      const capacity    = data.capacity ?? 0;          // 0 → unlimited
      const registrants = data.registrants || [];

      if (registrants.includes(userId)) return;        // already registered
      if (capacity && registrants.length >= capacity) {
        throw new Error("FULL");
      }

      tx.update(ref, { registrants: arrayUnion(userId) });
    });
  }

  /** ➖ admin removes user */
  static removeUser(activityId, userId) {
    return updateDoc(
      doc(db, ActivityService.COL, activityId),
      { registrants: arrayRemove(userId) }
    );
  }
}
