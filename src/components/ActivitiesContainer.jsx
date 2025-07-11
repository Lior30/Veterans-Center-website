// src/components/ActivitiesContainer.jsx
import { useEffect, useState } from "react";
import usePublicHolidays from "../hooks/usePublicHolidays";
import ActivityService from "../services/ActivityService";
import ActionFeedbackDialog from "./ActionFeedbackDialog";
import ActivitiesDesign from "./ActivitiesDesign";
import ConfirmDialog from "./ConfirmDialog";


const initialForm = {
  id: null,
  name: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  capacity: "",
  flyerId: "",
  recurring: false,
  weekdays: [],
  participants: [],
  registrationCondition: "",
  tags: [],
  priceMember60: "",
  priceRegular: "",
  location: "",
};

export default function ActivitiesContainer() {
  const [tab, setTab] = useState(0);
  const [activities, setActivities] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const [message, setMessage] = useState({ open: false, text: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  const holidays = usePublicHolidays();

  useEffect(() => {
    const unsub = ActivityService.subscribe(setActivities);
    return () => unsub();
  }, []);

  const handleNew = () => {
    setForm(initialForm);
    setDialogOpen(true);
  };

  const handleEdit = (row) => {
    setForm({ ...row });
    setDialogOpen(true);
  };

  const handleDelete = (row) => {
    setActivityToDelete(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!activityToDelete) return;

    try {
      await ActivityService.delete(activityToDelete.id);
      setMessage({ open: true, type: "success", text: "הפעילות נמחקה בהצלחה" });
    } catch (err) {
      setMessage({ open: true, type: "error", text: "שגיאה במחיקת הפעילות" });
    } finally {
      setConfirmOpen(false);
      setActivityToDelete(null);
    }
  };


  const toMinutes = (timeStr) => {
    const [hh, mm] = timeStr.split(":").map((x) => parseInt(x, 10));
    return hh * 60 + mm;
  };

  const handleDateClick = (dateStr) => {
    setForm({ ...initialForm, date: dateStr });
    setDialogOpen(true);
  };

  const handleEventClick = (info) => {
    // strip off any "-rec" suffix
    const rawId = String(info.event.id).replace(/-rec$/, "");
    const act = activities.find((a) => a.id === rawId);
    if (act) handleEdit(act);
  };

  const handleSave = async () => {
    if (!form.name || !form.date || !form.startTime || !form.endTime) {
      setMessage({
        open: true,
        type: "error",
        text: "יש למלא שם, תאריך, שעת התחלה ושעת סיום.",
      });
      return;
    }

    if (!form.tags || form.tags.length === 0) {
      setMessage({
        open: true,
        type: "error",
        text: "יש לבחור לפחות תגית אחת לפעילות.",
      });
      return;
    }

    if (Number(form.capacity) < 1) {
      setMessage({
        open: true,
        type: "error",
        text: "הקיבולת חייבת להיות 1 או יותר.",
      });
      return;
    }

    if (Number(form.priceMember60) < 0 || Number(form.priceRegular) < 0) {
      setMessage({
        open: true,
        type: "error",
        text: "המחיר חייב להיות 0 או יותר.",
      });
      return;
    }

    const startMinutes = toMinutes(form.startTime);
    const endMinutes = toMinutes(form.endTime);
    if (endMinutes - startMinutes < 30) {
      setMessage({
        open: true,
        type: "error",
        text: "שעת הסיום חייבת להיות לפחות חצי שעה אחרי שעת ההתחלה.",
      });
      return;
    }

    try {
      await ActivityService.save({
        ...form,
        capacity: Number(form.capacity),
        priceMember60: Number(form.priceMember60),
        priceRegular: Number(form.priceRegular),
      });

      setDialogOpen(false);
      setMessage({
        open: true,
        type: "success",
        text: "הפעילות נשמרה בהצלחה.",
      });
    } catch (err) {
      setMessage({
        open: true,
        type: "error",
        text: "שגיאה בשמירת הפעילות.",
      });
    }
  };

  return (
    <>
      <ActivitiesDesign
        tab={tab}
        activities={activities}
        holidays={holidays}
        dialogOpen={dialogOpen}
        form={form}
        onTabChange={setTab}
        onNew={handleNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        onFormChange={setForm}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />

      {/* Dialogs below */}
      <ActionFeedbackDialog
        open={message.open}
        type={message.type}
        text={message.text}
        onClose={() => setMessage((prev) => ({ ...prev, open: false }))}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="אישור מחיקה"
        text={`האם למחוק את הפעילות?`}
      />
    </>
  );
}
