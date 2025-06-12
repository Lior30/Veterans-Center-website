// src/components/ActivitiesContainer.jsx
import React, { useState, useEffect } from "react";
import ActivityService from "../services/ActivityService";
import usePublicHolidays from "../hooks/usePublicHolidays";
import ActivitiesDesign from "./ActivitiesDesign";

const initialForm = {
  id: null,
  name: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  capacity: 0,
  flyerId: "",
  recurring: false,
  weekdays: [],     // 0=Sun … 6=Sat
  participants: [],
  registrationCondition: "",
  tags: [],
  price: "",
  location: "",
};

export default function ActivitiesContainer() {
  const [tab, setTab] = useState(0);
  const [activities, setActivities] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

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

  const handleDelete = async (row) => {
    if (
      window.confirm(`אתה בטוח שברצונך למחוק את הפעילות "${row.name}"?`)
    ) {
      await ActivityService.delete(row.id);
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
      alert("אנא מלא שם, תאריך, שעת התחלה ושעת סיום.");
      return;
    }

    if (!form.tags || form.tags.length === 0) {
      alert("אנא בחרי לפחות תגית אחת לפעילות.");
      return;
    }

     if (Number(form.capacity) < 0) {
      alert("הקיבולת חייבת להיות 0 או יותר");
      return;
    }
    if (Number(form.price) < 0) {
      alert("המחיר חייב להיות 0 או יותר");
      return;
    }

    const startMinutes = toMinutes(form.startTime);
    const endMinutes = toMinutes(form.endTime);
    if (endMinutes - startMinutes < 30) {
      alert("שעת הסיום חייבת להיות לפחות חצי שעה אחרי שעת ההתחלה.");
      return;
    }

    await ActivityService.save({
      ...form,
      capacity: Number(form.capacity),
    });
    setDialogOpen(false);
  };

  return (
    <ActivitiesDesign
      // data
      tab={tab}
      activities={activities}
      holidays={holidays}
      dialogOpen={dialogOpen}
      form={form}
      // actions
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
  );
}
