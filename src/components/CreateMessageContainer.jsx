import { useState, useEffect } from "react";
import CreateMessageDesign from "./CreateMessageDesign";
import MessageService from "../services/MessageService";
import ActivityService from "../services/ActivityService";
import { Snackbar, Alert } from "@mui/material";

export default function CreateMessageContainer() {
  const [activities, setActivities] = useState([]);
  const [values, setValues] = useState({
    title: "",
    body: "",
    activityId: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = ActivityService.subscribe((acts) =>
      setActivities(acts)
    );
    return () => unsubscribe();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async () => {
    const errs = {};
    if (!values.title) errs.title = "יש להזין כותרת";
    if (!values.body) errs.body = "יש להזין תוכן";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    await MessageService.create(values);
    setValues({ title: "", body: "", activityId: "" });
    setErrors({});
    setSuccess(true);
  };

  return (
    <>
      <CreateMessageDesign
        activities={activities}
        values={values}
        errors={errors}
        onChange={onChange}
        onSubmit={onSubmit}
      />
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          ההודעה נשלחה בהצלחה
        </Alert>
      </Snackbar>
    </>
  );
}
