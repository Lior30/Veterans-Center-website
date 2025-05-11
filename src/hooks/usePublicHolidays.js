import { useState, useEffect } from "react";

/**
 * Fetch Israeli public holidays (Hebrew titles) from Hebcal
 * and return them in FullCalendar event format.
 */
export default function usePublicHolidays() {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const year = new Date().getFullYear();
    fetch(
      `https://www.hebcal.com/hebcal?v=1&cfg=json&year=${year}` +
      `&month=All&geo=IL&maj=on&min=on&mod=on&nx=on&locale=he`
    )
      .then((r) => r.json())
      .then((data) => {
        const evts = (data.items || [])
          .filter((i) => i.category === "holiday")
          .map((i) => ({
            title: i.title,      // Hebrew title now
            start: i.date,
            allDay: true,
            backgroundColor: "#F48FB1",
          }));
        setHolidays(evts);
      })
      .catch(console.error);
  }, []);

  return holidays;
}
