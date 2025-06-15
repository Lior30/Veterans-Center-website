// =========  src/services/BannerService.js  =========
import { db, storage } from "../firebase";
import {
  collection, addDoc, getDocs, query, orderBy, limit,
  writeBatch, doc, updateDoc, serverTimestamp
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from "firebase/storage";

const COLL = "homepageBanners";
const PATH = "banners/";
const DEFAULT_DURATION = 5;

/* ───────── עזר ───────── */
async function nextOrder() {
  const snap = await getDocs(
    query(collection(db, COLL), orderBy("order", "desc"), limit(1))
  );
  return snap.empty ? 0 : snap.docs[0].data().order + 1;
}

/* ───────── API ───────── */
const service = {
  /* העלאת באנר חדש */
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
      duration,          //  <<<<<<<<<<<<<<   שם השדה אחיד
      order: await nextOrder(),
      createdAt: serverTimestamp(),
      storagePath: fileRef.fullPath,
      filename: file.name,
    });
  },

  /* שליפה ממוקמת לפי order */
  async getBanners() {
    const snap = await getDocs(
      query(collection(db, COLL), orderBy("order", "asc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /* עדכון */
  async updateBanner(id, data) {
    await updateDoc(doc(db, COLL, id), data);
  },

  /* החלפת סדר בין שני פריטים */
  async swapOrder(a, b) {
    const batch = writeBatch(db);
    batch.update(doc(db, COLL, a.id), { order: a.order });
    batch.update(doc(db, COLL, b.id), { order: b.order });
    await batch.commit();
  },

  /* מחיקה */
  async deleteBanner(banner) {
    await deleteObject(ref(storage, banner.storagePath));
    // אם אתה מוחק מסמך:
    // await deleteDoc(doc(db, COLL, banner.id));
  },
};

export default service;
