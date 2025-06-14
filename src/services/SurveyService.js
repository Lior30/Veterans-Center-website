// src/services/SurveyService.js
import { collection, getDocs, getDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";

const SurveyService = {
  // List all surveys
  list: async () => {
  const colRef = collection(db, "surveys");
  const snap = await getDocs(colRef);
  const now = new Date();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((s) => !s.expires_at || new Date(s.expires_at) > now);
},

  // Fetch a single survey by ID
  getById: async (id) => {
  if (!id) {
    console.warn("❗ getById called with null or undefined ID");
    return null;
  }
  const docRef = doc(db, "surveys", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
  },

  // Create a new survey
  create: async (payload) => {
    const colRef = collection(db, "surveys");
    const newDoc = await addDoc(colRef, {
      ...payload,
      createdAt: new Date(),
    });
    return newDoc.id;
  },

  

  /**
   * Return an array of all activities for the dropdown.
   * Now queries Firestore directly (collection 'activities').
   */
  listActivities: async () => {
    const colRef = collection(db, "activities");
    const snap = await getDocs(colRef);
    // Assume each activity doc has 'title' or 'name' field
    return snap.docs.map((d) => ({ id: d.id, title: d.data().title || d.data().name || "פעילות" }));
  },
};

export async function saveSurveyResponse(surveyId, response) {
  try {
    console.log("📨 Saving to survey ID:", surveyId);
    console.log("📨 Payload:", response);

    const ref = collection(db, "surveys", surveyId, "responses");
    await addDoc(ref, response);

    console.log("✅ Response saved successfully.");
  } catch (err) {
    console.error("🔥 Failed to save survey response:", err);
    throw err; // Let the caller handle this
  }
}

export default SurveyService;
export { SurveyService };