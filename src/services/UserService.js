// src/services/UserService.js
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, onSnapshot } from "firebase/firestore";

/**
 * Basic helper around the “users” collection.
 * Phone number (digits-only) is used as the document-ID, so it’s unique.
 */
export default class UserService {
  static COL = "users";

  /** get specific user (or null) */
  static async get(id) {
    const ref = doc(db, UserService.COL, id);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  static isValidPhone(phone) {
    return /^(?:050|052|053|054|051|055)\d{7}$/.test(phone);
  }

  /** וולידציה לשם: אותיות מרובות מילים, מינימום 2 תווים כל מילה */
  static isValidName(name) {
    return /^[א-תA-Za-z]{2,}(?: [א-תA-Za-z]{2,})*$/.test(name.trim());
  }

  /** find user by phone or create a new one */
  static async findOrCreate({ name, phone }) {
    const id = phone.replace(/\D/g, "");
    const [firstName, ...rest] = name.trim().split(" ");
    const lastName = rest.join(" ");
    const ref = doc(db, UserService.COL, id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      if (
        (firstName && data.firstName !== firstName) ||
        (lastName  && data.lastName  !== lastName)
      ) {
        await setDoc(ref, { firstName, lastName }, { merge: true });
      }
      return { id, ...data, firstName, lastName };
    }

    await setDoc(ref, { firstName, lastName, phone });
    return { id, firstName, lastName, phone };
  }

  static getPhoneError(phone) {
    const digits = phone.replace(/\D/g, "");

    if (!digits.startsWith("0")) {
      return "המספר שהוקלד אינו תקין";
    }

    if (!digits.startsWith("05")) {
      return "המספר שהוקלד אינו תקין";
    }

    // בדוק תחילת מספר
    if (!/^(05[0-5]|058)/.test(digits)) {
      // לא התחיל ב־050–055
      return "המספר שהוקלד אינו תקין";
    }
    // אורך
    if (digits.length < 10) {
      return "מספר טלפון צריך להכיל 10 ספרות";
    }
    if (digits.length > 10) {
      return "המספר שהוקלד אינו תקין";
    }
    return null;
  }

  /** האם מספר תקין? */
  static isValidPhone(phone) {
    return UserService.getPhoneError(phone) === null;
  }

  /** (אופציונלי) וולידציה לשם */
  static isValidName(name) {
    return /^[א-תA-Za-z]{2,}(?: [א-תA-Za-z]{2,})*$/.test(name.trim());
  }

  /**
   * מאזין לשינויים בקולקציית המשתמשים
   * ומעביר מפה של phone → fullName לכל callback
   */
  static subscribe(callback) {
    const colRef = collection(db, UserService.COL);
    return onSnapshot(colRef, (snap) => {
      const users = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const fullName =
          [data.firstName, data.lastName].filter(Boolean).join(" ") ||
          data.name?.trim() ||
          d.id;
        users[d.id] = fullName;
      });
      callback(users);
    });
  }
}
