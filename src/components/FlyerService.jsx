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

import {
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  deleteObject,
} from "firebase/storage";

const FlyerService = {
  async uploadFlyer(name, file) {
    if (!name || !file) {
      throw new Error("Missing name or file");
    }

    try {
      // Create a unique storage path for the file
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `flyers/${fileName}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // Save flyer metadata to Firestore
      await addDoc(collection(db, "flyers"), {
        name,
        fileUrl,
        fileName,
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
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        fileUrl: doc.data().fileUrl ?? "", // fallback to empty if missing
      }));
    } catch (error) {
      console.error("Error fetching flyers:", error);
      throw error;
    }
  },

  async deleteFlyer(flyer) {
    try {
      // Delete from storage
      const path = decodeURIComponent(flyer.fileUrl.split("/o/")[1].split("?")[0]); // Extract the path after the storage bucket
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, "flyers", flyer.id));
    } catch (error) {
    console.error("Error deleting flyer:", error);
    throw error;
    }
  }

};

export default FlyerService;
