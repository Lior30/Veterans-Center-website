// =========  src/services/FlyerService.js  =========
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const FLYERS_COL = "flyers";

const FlyerService = {
  /* ─── הוספת פלייאר ─── */
  async uploadFlyer(name, file) {
    if (!name || !file) throw new Error("Name / file missing");

    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `flyers/${fileName}`);
    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);

    const nextOrder = (await getDocs(collection(db, FLYERS_COL))).size;

    await addDoc(collection(db, FLYERS_COL), {
      name,
      fileUrl,
      url: fileUrl,          // תאימות לאחור
      order: nextOrder,
      createdAt: serverTimestamp(),
    });
  },

  /* ─── שליפה + תיקון order חסר ─── */
  async getFlyers() {
    const col = collection(db, FLYERS_COL);

    // קודם־כל טוענים את הכול (בלי orderBy)
    const snap = await getDocs(col);
    if (snap.empty) return [];                // אין מסמכים בכלל

    // האם כולם מכילים order?
    const needsFix = snap.docs.some((d) => d.data().order === undefined);

    if (needsFix) {
      // מוסיף order לכל מי שחסר
      const batch = writeBatch(db);
      let idx = 0;
      // ממיינים לפי createdAt כדי לשמר סדר העלאה מקורי
      snap.docs
        .sort(
          (a, b) =>
            (a.data().createdAt?.seconds ?? 0) -
            (b.data().createdAt?.seconds ?? 0)
        )
        .forEach((d) => {
          batch.update(doc(db, FLYERS_COL, d.id), { order: idx++ });
        });
      await batch.commit();
    }

    // עכשיו מביאים ממויין
    const orderedSnap = await getDocs(
      query(col, orderBy("order", "asc"))
    );

    return orderedSnap.docs.map((d) => ({
      id: d.id,
      name: d.data().name,
      fileUrl:
        d.data().fileUrl ??
        d.data().url ??
        d.data().imageUrl ??
        "",
      order: d.data().order ?? 0,
    }));
  },

  /* ─── מחיקה ─── */
  async deleteFlyer(flyer) {
    const path = decodeURIComponent(
      flyer.fileUrl.split("/o/")[1].split("?")[0]
    );
    await deleteObject(ref(storage, path));
    await deleteDoc(doc(db, FLYERS_COL, flyer.id));
  },

  /* ─── החלפת שתי רשומות ─── */
  async swapOrder(a, b) {
    const batch = writeBatch(db);
    batch.update(doc(db, FLYERS_COL, a.id), { order: a.order });
    batch.update(doc(db, FLYERS_COL, b.id), { order: b.order });
    await batch.commit();
  },
};

export default FlyerService;
