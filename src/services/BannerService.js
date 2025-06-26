// src/services/BannerService.js 
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  writeBatch,
  doc,
  updateDoc,
  deleteDoc,          
  serverTimestamp
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

const COLL = "homepageBanners";
const PATH = "banners/";
const DEFAULT_DURATION = 5;

/* helper */
async function nextOrder() {
  const snap = await getDocs(
    query(collection(db, COLL), orderBy("order", "desc"), limit(1))
  );
  return snap.empty ? 0 : snap.docs[0].data().order + 1;
}

/*API  */
const service = {
  /* upload banner*/
  async uploadBanner({ title, file, link = "", start, end, duration = DEFAULT_DURATION }) {
    // 1. Storage
    const fileRef = ref(storage, PATH + Date.now() + "_" + file.name);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    // 2. Firestore
    await addDoc(collection(db, COLL), {
      title,
      url,
      link,
      startDate: start || null,
      endDate:   end   || null,
      duration,
      order: await nextOrder(),
      createdAt: serverTimestamp(),
      storagePath: fileRef.fullPath, 
      filename: file.name,
    });
  },

  /* order */
  async getBanners() {
    const snap = await getDocs(
      query(collection(db, COLL), orderBy("order", "asc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /* update*/
  async updateBanner(id, data) {
    await updateDoc(doc(db, COLL, id), data);
  },

  /* switch*/
  async swapOrder(a, b) {
    const batch = writeBatch(db);
    batch.update(doc(db, COLL, a.id), { order: a.order });
    batch.update(doc(db, COLL, b.id), { order: b.order });
    await batch.commit();
  },

  /* delete*/
  async deleteBanner(banner) {
    
    try {
      await deleteObject(ref(storage, banner.storagePath));
    } catch (err) {
      if (err.code !== "storage/object-not-found") {
        throw err;
      }
    }
    
    await deleteDoc(doc(db, COLL, banner.id));
  },
};

export default service;
