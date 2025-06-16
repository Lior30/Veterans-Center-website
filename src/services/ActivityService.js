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
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getDocs } from "firebase/firestore"; // אם לא קיים למעלה
import FlyerService from "./FlyerService";

export default class ActivityService {
  /* collection constants */
  static COL    = "activities";
  static colRef = collection(db, ActivityService.COL);


  /** ➖ delete מסמך שלם */
  static async delete(id) {
  try {
    const flyers = await FlyerService.getFlyers();
    const related = flyers.filter((f) => f.activityId === id);
    for (const flyer of related) {
      await FlyerService.deleteFlyer(flyer);
    }

    return deleteDoc(doc(db, ActivityService.COL, id));
  } catch (err) {
    console.error("שגיאה במחיקת פעילות ופליירים", err);
    throw err;
  }
}

  /* ──────────────────────────── Realtime stream ──────────────────────────── */
  static subscribe(callback) {
    return onSnapshot(
      ActivityService.colRef,
      (snap) =>
      callback(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            weekdays:     data.weekdays     || [],
            participants: data.participants || [],
            tags:         data.tags         || [],
            registrants:  Array.isArray(data.participants)
                     ? data.participants.map(p => p.phone)
                          : [],
          };
        })
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

    // ensure participants exists as array (default empty)
    if (!Array.isArray(data.participants)) data.participants = [];

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
  static async registerUser(activityId, user) {
    const ref = doc(db, ActivityService.COL, activityId);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("NOT_FOUND");

      const data = snap.data();
      const capacity = data.capacity ?? 0;
      const raw = data.participants || [];      // could be [string] or [{…}]
      
      // 1. Normalize to objects:
      const participants = raw.map((p) =>
        typeof p === "string" ? { phone: p } : { ...p }
      );

      // 2. Already-registered check:
      const alreadyRegistered = participants.some(
        (p) => p.phone === user.phone
      );
      if (alreadyRegistered) throw new Error("alreadyRegistered");

      // 3. Capacity check:
      if (capacity && participants.length >= capacity) {
        throw new Error("FULL");
      }

      // 4. Append the new participant object:
      const updatedParticipants = [
        ...participants,
        { name: user.name, phone: user.phone },
      ];

      tx.update(ref, { participants: updatedParticipants });
    });
  }


  /** ➖ admin removes user */
  static async removeUser(activityId, participant) {
    const ref = doc(db, ActivityService.COL, activityId);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("NOT_FOUND");

      const data = snap.data();
      const participants = data.participants || [];

      // participant is { name, phone }
      const updatedParticipants = participants.filter(
        (p) => p.phone !== participant.phone
      );

      tx.update(ref, { participants: updatedParticipants });
    });
  }

/** מחזיר את כל הפעילויות שהמשתמש רשום אליהן לפי מספר טלפון */
static async getUserActivities(phone) {
  const digits = phone.replace(/\D/g, "");
  const snap = await getDocs(ActivityService.colRef);
  const results = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const participants = data.participants || [];

    const isUserInActivity = participants.some((p) => p.phone === digits);
    if (isUserInActivity) {
      results.push({ id: docSnap.id, ...data });
    }
  });

  return results;
}

}