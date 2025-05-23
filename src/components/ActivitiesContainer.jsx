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

  /** Ask for confirmation and delete */
  const handleDelete = async (row) => {
    if (
      window.confirm(
        `אתה בטוח שברצונך למחוק את הפעילות "${row.name}"?`
      )
    ) {
      await ActivityService.delete(row.id);
    }
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
