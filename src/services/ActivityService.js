// src/services/ActivityService.js
import {
  collection,
  addDoc,
  updateDoc,
  doc,
   query,
  where,
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

/**
 * ➕ user registers (transaction = capacity safe), ועדכון גם של מסמך המשתמש
 * @param {string} activityId
 * @param {{name: string, phone: string}} user  - שדה phone הוא הערך כפי ששמור ב-userProfile (עדיף סטרינג של ספרות בלבד)
 */
static async registerUser(activityId, user) {
  // בדיקות מקדימות
  if (!activityId) {
    throw new Error("MISSING_ACTIVITY_ID");
  }
  if (!user || !user.phone) {
    throw new Error("USER_NO_PHONE");
  }
  // Normalize phone: סטרינג של ספרות בלבד
  const normalizedPhone = String(user.phone).replace(/\D/g, "");
  if (!normalizedPhone) {
    throw new Error("USER_PHONE_INVALID");
  }

  // מציאת מסמך המשתמש בקולקשן 'users' לפי phone
  const usersCol = collection(db, "users");
  const userQuery = query(usersCol, where("phone", "==", normalizedPhone));
  console.log("ActivityService.registerUser: query user by phone:", normalizedPhone);
  const userSnap = await getDocs(userQuery);
  if (userSnap.empty) {
    console.warn("ActivityService.registerUser: USER_NOT_FOUND for phone:", normalizedPhone);
    throw new Error("USER_NOT_FOUND");
  }
  const userRef = userSnap.docs[0].ref;

  const activityRef = doc(db, ActivityService.COL, activityId);

  // מבצעים טרנזקציה: בודקים קיבולת ונרשמים לפעילות + מעדכנים מסמך המשתמש
  try {

    const result =await runTransaction(db, async (tx) => {
    const snap = await tx.get(activityRef);
      if (!snap.exists()) {
        console.warn("ActivityService.registerUser: activity not found:", activityId);
        throw new Error("NOT_FOUND");
      }
      const data = snap.data();

      const userSnapTx = await tx.get(userRef);
      const userData = userSnapTx.data();

      // ✅ בדיקה אם הפעילות דורשת חבר מועדון 60+
      if (data.registrationCondition === 'member60' && !userData.is_club_60) {
        return { success: false, reason: "CONDITION_NOT_MET", message: "פעילות זו מיועדת לחברי מרכז 60+ בלבד" };
      }

      const capacity = data.capacity ?? 0;
      const rawParticipants = Array.isArray(data.participants)
        ? data.participants
        : [];
      // Normalize participants array: כל פריט או סטרינג או אובייקט
      const participants = rawParticipants
        .map((p) => {
          if (typeof p === "string") {
            return { phone: String(p).replace(/\D/g, "") };
          } else {
            return {
              ...p,
              phone: p.phone ? String(p.phone).replace(/\D/g, "") : "",
            };
          }
        })
        .filter((p) => p.phone); // השמט entry ללא phone חוקי

      // Already-registered?
      if (participants.some((p) => p.phone === normalizedPhone)) {
        console.warn("ActivityService.registerUser: already registered:", normalizedPhone);
        throw new Error("alreadyRegistered");
      }
      // Capacity check
      if (capacity && participants.length >= capacity) {
        return { success: false, reason: "FULL", message: "הפעילות מלאה" };
      }
      // מוסיפים משתתף חדש
      const newParticipant = {
        name: user.name || "",
        phone: normalizedPhone,
      };
      const updatedParticipants = [...participants, newParticipant];
      tx.update(activityRef, { participants: updatedParticipants });

      // עדכון מסמך המשתמש:
      const activityName = data.name || data.title || activityId;
      console.log("ActivityService.registerUser: adding activity to user:", activityName);
      tx.update(userRef, {
        activities: arrayUnion(activityName),
        activities_date: arrayUnion(new Date().toISOString()),
      });

      return { success: true, reason: "OK", message: "נרשמת בהצלחה 🎉" };
    });
    
    console.log("ActivityService.registerUser: SUCCESS for phone:", normalizedPhone, "activityId:", activityId);
    return result ?? { success: false, reason: "ERROR", message: "שגיאה לא צפויה בהרשמה" };
  } catch (err) {
    console.error("ActivityService.registerUser: Transaction failed:", err);
    throw err;
  }
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

      if (participants.some((p) => p.phone === digits)) {
        // כאן אתם מוודאים ש-data.time קיים
        results.push({
          id: docSnap.id,
          name: data.name,
          date: data.date,
          time: data.starttime,            // <-- דאגו שזה שם
          location: data.location,
          description: data.description,
        });
      }


    if (isUserInActivity) {
      results.push({ id: docSnap.id, ...data });
    }
  });

  return results;
}

}