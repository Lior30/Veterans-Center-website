import {
  uploadBytes,
  getDownloadURL,
  ref as storageRef,
} from "firebase/storage";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { storage, db } from "../firebase";

const COLL = "homepageBanners"; // Firestore collection
const PATH = "banners/";        // Firebase-Storage folder

/** העלאת באנר חדש ומידע נלווה */
async function uploadBanner({ title, file, link, start, end }) {
  // 1. Storage
  const ref = storageRef(storage, PATH + file.name);
  await uploadBytes(ref, file);
  const url = await getDownloadURL(ref);

  // 2. Firestore
  await addDoc(collection(db, COLL), {
    title,
    url,
    link,
    startDate: start || null,
    endDate:   end   || null,
    createdAt: serverTimestamp(),
  });
}

export default { uploadBanner };
