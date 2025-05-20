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
}
