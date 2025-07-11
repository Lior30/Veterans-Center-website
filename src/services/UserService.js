// src/services/UserService.js
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";


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
    return /^05\d{8}$/.test(phone.replace(/\D/g, ""));
  }


  static async removeActivity(phone, activityName) {
    const ref = doc(db, UserService.COL, phone);
    await updateDoc(ref, {
      activities: arrayRemove(activityName),
    });
  }

  static async addActivity(phone, activityName) {
    const ref = doc(db, UserService.COL, phone);
    await updateDoc(ref, {
      activities: arrayUnion(activityName),
    });
  }



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
        (lastName && data.lastName !== lastName)
      ) {
        await setDoc(ref, { firstName, lastName }, { merge: true });
      }
      return { id, ...data, firstName, lastName };
    }

    await setDoc(ref, { firstName, lastName, phone });
    return { id, firstName, lastName, phone };
  }



  static getPhoneError(phoneRaw) {
    const digits = phoneRaw.replace(/\D/g, "");


    if (digits.length !== 10) {
      return "מספר טלפון צריך להכיל בדיוק 10 ספרות";
    }


    if (!/^05[01234578]\d{7}$/.test(digits)) {
      return "הקידומת שהוקלדה אינה נתמכת";
    }

    return null;

  }


  static isValidPhone(phone) {
    return UserService.getPhoneError(phone) === null;
  }


  static isValidName(name) {
    return /^[א-תA-Za-z]{2,}(?: [א-תA-Za-z]{2,})*$/.test(name.trim());
  }


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
