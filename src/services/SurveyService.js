// src/services/SurveyService.js
import { collection, getDocs } from "firebase/firestore";
import { db }                 from "../firebase.js";

const SurveyService = {
  list: async () => {
    const colRef  = collection(db, "surveys");
    const snap    = await getDocs(colRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  // אפשר להוסיף כאן שיטות נוספות, למשל:
  // getById: async (id) => {
  //   const docRef = doc(db, "surveys", id);
  //   const docSnap = await getDoc(docRef);
  //   return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  // },
};

export default SurveyService;
