// src/services/FlyerService.js
import { db, storage } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

/**
 * Service for fetching flyers from Firestore.
 * Reads 'fileUrl' saved in Firestore documents under 'flyers' collection.
 * Only the read operation is needed for public LandingPage.
 */
const FlyerService = {
  /**
   * Fetches all flyers and returns array of { id, name, fileUrl }.
   */
  async getFlyers() {
    const colRef = collection(db, "flyers");
    const snapshot = await getDocs(colRef);
    return Promise.all(
      snapshot.docs.map(async doc => ({
        id: doc.id,
        name: doc.data().name,
        fileUrl: doc.data().fileUrl
      }))
    );
  }
};

export default FlyerService;
