// src/services/ActivityService.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,      // ← added
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

export default class ActivityService {
  static COL = "activities";
  static colRef = collection(db, ActivityService.COL);

  /** Real‐time subscription to activities collection */
  static subscribe(callback) {
    return onSnapshot(
      ActivityService.colRef,
      (snap) =>
        callback(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            weekdays: d.data().weekdays || [], // ensure array
          }))
        ),
      console.error
    );
  }

  /** Create or update an activity */
  static async save(activity) {
    const payload = {
      name: activity.name,
      description: activity.description,
      date: activity.date,
      startTime: activity.startTime,
      endTime: activity.endTime,
      capacity: activity.capacity,
      flyerId: activity.flyerId || null,
      recurring: activity.recurring,
      weekdays: activity.weekdays || [],
    };

    if (activity.id) {
      await updateDoc(doc(db, ActivityService.COL, activity.id), payload);
    } else {
      await addDoc(ActivityService.colRef, payload);
    }
  }

  /** Delete an activity by Firestore ID */
  static async delete(id) {
    await deleteDoc(doc(db, ActivityService.COL, id));
  }
}
