import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { Box, TextField, Button } from "@mui/material";

function ReplyContainer({ messageId, onClose }) {
  const [replyText, setReplyText] = useState("");
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const phone = sessionStorage.getItem("userPhone");
    if (!phone) {
      console.warn("🔒 No phone in sessionStorage, cannot fetch user data");
      return;
    }
    const loadUser = async () => {
      const userRef = doc(db, "users", phone);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        console.warn("⚠️ User not found in Firestore for phone:", phone);
      }
    };
    loadUser();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!replyText.trim()) {
      newErrors.replyText = "נא למלא את ההודעה";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !userData) return;

    const fullName = `${userData.first_name?.trim() || ""} ${userData.last_name?.trim() || ""}`;
    const phoneClean = userData.phone?.trim().replace(/\D/g, "");
    const replyTime = new Date().toISOString();

    try {
      await addDoc(collection(db, "messages", messageId, "replies"), {
        fullname: fullName,
        phone: phoneClean,
        replyText,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("ReplyContainer: failed to save reply:", e);
      return;
    }

    const userRef = doc(db, "users", phoneClean);

    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        console.warn(`ReplyContainer: user document not found for ID ${phoneClean}. העדכון לא יתבצע.`);
      }

      let messageTitle = messageId;
      try {
        const msgSnap = await getDoc(doc(db, "messages", messageId));
        if (msgSnap.exists()) {
          const data = msgSnap.data();
          if (data.title && typeof data.title === "string") {
            messageTitle = data.title.trim();
          }
        }
      } catch (e) {
        console.warn("ReplyContainer: could not fetch message title:", e);
      }

      const nowIso = new Date().toISOString();
      try {
        await updateDoc(userRef, {
          replies: arrayUnion(messageTitle),
          replies_date: arrayUnion(nowIso),
        });
      } catch (e) {
        console.error("ReplyContainer: updateDoc failed for userId:", phoneClean, e);
      }
    } catch (e) {
      console.error("ReplyContainer: error when accessing user document:", e);
    }

    if (onClose) {
      onClose();
    }
  };

  const placeholderAlign = {
    inputProps: { style: { textAlign: "right" } },
    sx: {
      "& input::placeholder": { textAlign: "right" },
      "& textarea::placeholder": { textAlign: "right" },
    }
  };

  if (!userData) return <p>טוען פרטי משתמש…</p>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, direction: "rtl" }}>
      <TextField
        placeholder="כתוב את תגובתך כאן..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        multiline
        rows={4}
        fullWidth
        error={!!errors.replyText}
        helperText={errors.replyText}
        inputProps={placeholderAlign.inputProps}
        sx={placeholderAlign.sx}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="contained" onClick={handleSubmit}>
          שלח תגובה
        </Button>
      </Box>
    </Box>
  );
}

export default ReplyContainer;
