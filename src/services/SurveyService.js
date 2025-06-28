// src/services/SurveyService.js
import { collection, getDocs, getDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";

const SurveyService = {
  // List all surveys
  list: async (includeOrphaned = false) => {
  const colRef = collection(db, "surveys");
  const snap = await getDocs(colRef);
  const now = new Date();

  const surveys = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((s) => !s.expires_at || new Date(s.expires_at) > now);

  if (includeOrphaned) return surveys;

  // Only keep surveys with valid activities or general ones
  const filtered = [];
  for (const s of surveys) {
    if (!s.of_activity || s.of_activity === "כללי") {
      filtered.push(s);
    } else {
      const actRef = doc(db, "activities", s.of_activity);
      const actSnap = await getDoc(actRef);
      if (actSnap.exists()) filtered.push(s);
    }
  }

  return filtered;
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

  update: async (surveyId, data) => {
    const docRef = doc(db, "surveys", surveyId);
    await updateDoc(docRef, data);
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
    const ref = collection(db, "surveys", surveyId, "responses");
    await addDoc(ref, response);
    console.log("✅ Response saved successfully.");
    
  } catch (err) {
    console.error("🔥 Failed to save survey response:", err);
    throw err; // Let the caller handle this
  }
}

export async function update(surveyId, data) {
  const docRef = doc(db, "surveys", surveyId);
  await updateDoc(docRef, data);
}


export default SurveyService;
export { SurveyService };