// src/components/FlyerService.jsx
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const FlyerService = {
  async uploadFlyer(name, file) {
    if (!name || !file) {
      throw new Error("Missing name or file");
    }

    try {
      // Upload file to Storage
      const storageRef = ref(storage, `flyers/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // Save metadata to Firestore
      await addDoc(collection(db, "flyers"), {
        name,
        fileUrl,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error uploading flyer:", error);
      throw error;
    }
  },

  async getFlyers() {
    try {
      const snapshot = await getDocs(collection(db, "flyers"));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching flyers:", error);
      throw error;
    }
  },
};

export default FlyerService;
