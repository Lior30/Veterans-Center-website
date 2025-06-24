//src/components/CreateMessageContainer.jsx
import { useState, useEffect } from "react";
import CreateMessageDesign   from "./CreateMessageDesign.jsx";
import MessageService        from "../services/MessageService.js";
import ActivityService       from "../services/ActivityService.js";
import { Snackbar, Alert }   from "@mui/material";

export default function CreateMessageContainer() {
  const [activities, setActivities] = useState([]);

  const [values, setValues] = useState({
    title     : "",
    body      : "",
    activityId: "",
    startDate : "",   
    endDate   : "",
  });

  const [errors,  setErrors]  = useState({});
  const [success, setSuccess] = useState(false);

  
  useEffect(() => {
    const unsub = ActivityService.subscribe(setActivities);
    return () => unsub();   // cleanup בהחלפת דף
  }, []);

  
  const onChange = (e) =>
    setValues({ ...values, [e.target.name]: e.target.value });

  
  const onSubmit = async () => {
    const errs = {};
    if (!values.title.trim()) errs.title = "יש להזין כותרת";
    if (!values.body.trim())  errs.body  = "יש להזין תוכן";
    if (values.endDate && values.startDate && values.endDate < values.startDate)
      errs.endDate = "תאריך סיום חייב להיות אחרי תאריך התחלה";

    if (Object.keys(errs).length) return setErrors(errs);

    try {
      await MessageService.create(values);
      setValues({
        title     : "",
        body      : "",
        activityId: "",
        startDate : "",
        endDate   : "",
      });
      setSuccess(true);
    } catch (err) {
      alert("שמירת הודעה נכשלה: " + err.code);
    }
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
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          ההודעה נשמרה בהצלחה!
        </Alert>
      </Snackbar>
    </>
  );
}
