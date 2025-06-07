// src/services/UserService.js
import { db }                                     from "../firebase";
import { doc, getDoc, setDoc }                    from "firebase/firestore";

/**
 * Basic helper around the “users” collection.
 * Phone number (digits-only) is used as the document-ID, so it’s unique.
 */
export default class UserService {
  static COL = "users";

  /** get specific user (or null) */
  static async get(id) {
    const ref  = doc(db, UserService.COL, id);
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
    const id   = phone.replace(/\D/g, "");            // keep digits only
    const ref  = doc(db, UserService.COL, id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      // update name if it changed
      if (name && snap.data().name !== name) {
        await setDoc(ref, { name }, { merge: true });
      }
      return { id, ...snap.data() };
    }

    await setDoc(ref, { name, phone });
    return { id, name, phone };
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



  


  
}


