// src/components/FlyerService.js
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const FlyerService = {
  async uploadFlyer(name, file) {
    if (!name || !file) {
      throw new Error("Missing name or file");
    }

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `flyers/${fileName}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

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
        fileUrl: doc.data().fileUrl ?? "",
      }));
    } catch (error) {
      console.error("Error fetching flyers:", error);
      throw error;
    }
  },

  async deleteFlyer(flyer) {
    try {
      const path = decodeURIComponent(
        flyer.fileUrl.split("/o/")[1].split("?")[0]
      );
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);

      await deleteDoc(doc(db, "flyers", flyer.id));
    } catch (error) {
      console.error("Error deleting flyer:", error);
      throw error;
    }
  },
};

export default FlyerService;
