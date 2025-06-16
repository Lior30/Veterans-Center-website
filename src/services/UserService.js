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

   /* ✔︎ כל מספר שמתחיל ב-05 ולאחריו עוד 8 ספרות (סה״כ 10) */
  static isValidPhone(phone) {
    return /^05\d{8}$/.test(phone.replace(/\D/g, ""));
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


    static getPhoneError(phoneRaw) {
      const digits = phoneRaw.replace(/\D/g, "");      // משאיר ספרות בלבד

      // 1. חייב להיות בדיוק 10 ספרות
      if (digits.length !== 10) {
        return "מספר טלפון צריך להכיל בדיוק 10 ספרות";
      }

      // 2. בדיקת קידומת מותרת
      //    05 ואז אחת מהספרות: 0,1,2,3,4,5,7,8
      if (!/^05[01234578]\d{7}$/.test(digits)) {
        return "הקידומת שהוקלדה אינה נתמכת";
      }

      return null;   // ✔︎ תקין
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


