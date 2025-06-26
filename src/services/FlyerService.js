//src/services/FlyerService.js 
import { db, storage } from "../firebase";
import {
  collection, addDoc, getDocs, query, orderBy,
  doc, deleteDoc, writeBatch, serverTimestamp, Timestamp
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from "firebase/storage";
import { onSnapshot } from "firebase/firestore";


const FLYERS_COL   = "flyers";
const ONE_YEAR_MS  = 365 * 24 * 60 * 60 * 1000;

/* helper */
function toTimestamp(dateStr, fallback) {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  return Timestamp.fromDate(d);
}

const FlyerService = {
  /* upload */
async uploadFlyer({ file, name, startDate, endDate, activityId }) {
  const storageRef = ref(storage, `flyers/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const fileUrl    = await getDownloadURL(storageRef);
  const storagePath = storageRef.fullPath;

  const snap      = await getDocs(collection(db, FLYERS_COL));
  const nextOrder = snap.size;

  const nowTS   = serverTimestamp();
  const startTS = toTimestamp(startDate, nowTS);
  const endTS   = toTimestamp(
    endDate,
    Timestamp.fromMillis(Date.now() + ONE_YEAR_MS)
  );

  await addDoc(collection(db, FLYERS_COL), {
    name,
    fileUrl,
    storagePath,
    order: nextOrder,
    createdAt: nowTS,
    startDate: startTS,
    endDate: endTS,
    filename: file.name,
    activityId,    
  });
},


  /* manage*/
  async getFlyers() {
    const snap = await getDocs(
      query(collection(db, FLYERS_COL), orderBy("order", "asc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /* into website */
  async getActiveFlyers() {
    const now = new Date();
    const all = await this.getFlyers();
    return all.filter((f) => {
      const start = f.startDate?.toDate?.() ?? new Date(0);
      const end   = f.endDate?.toDate?.() ?? new Date("9999-12-31");
      return start <= now && now <= end;
    });
  },

  /* delete */
  async deleteFlyer(flyer) {
    // ① -Storage
    try {
      await deleteObject(ref(storage, flyer.storagePath));
    } catch (err) {
      if (err.code !== "storage/object-not-found") throw err;
    }
    // ② -Firestore
    await deleteDoc(doc(db, FLYERS_COL, flyer.id));
  },

  /* Drag & Drop*/
  async swapOrder(a, b) {
    const batch = writeBatch(db);
    batch.update(doc(db, FLYERS_COL, a.id), { order: a.order });
    batch.update(doc(db, FLYERS_COL, b.id), { order: b.order });
    await batch.commit();
  },
};

FlyerService.subscribe = function (callback) {
  const flyersCollection = query(collection(db, FLYERS_COL), orderBy("order", "asc"));
  return onSnapshot(flyersCollection, (snapshot) => {
    const flyers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(flyers);
  });
};

export default FlyerService;
