// src/services/ContactService.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const CONTACT_DOC = doc(db, "contactDetails", "q7TAHi1avVOPGGlOawKK");

export default {
  async get() {
    const snap = await getDoc(CONTACT_DOC);
    return snap.exists() ? snap.data() : {};
  },

  async update(details) {
    await setDoc(CONTACT_DOC, details, { merge: true });
    return details;
  },
};
