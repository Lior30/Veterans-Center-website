import { useState, useEffect } from "react";

/**
 * Fetch Jewish holidays from Hebcal for years [currentYear - 1] to 2030,
 * and return them in FullCalendar format with Hebrew titles.
 */
export default function usePublicHolidays() {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let y = currentYear - 1; y <= 2030; y++) {
      years.push(y);
    }

    Promise.all(
      years.map((year) =>
        fetch(
          `https://www.hebcal.com/hebcal?v=1&cfg=json&year=${year}` +
            `&month=all&geo=IL&maj=on&min=on&mod=on&nx=on&locale=he`
        ).then((res) => res.json())
      )
    )
      .then((results) => {
        const combined = results.flatMap((data) =>
          (data.items || [])
            .filter((item) => item.category === "holiday")
            .map((item) => ({
              title: item.hebrew || item.title,
              start: item.date,
              allDay: true,
              backgroundColor: "#F48FB1",
            }))
        );
        setHolidays(combined);
      })
      .catch(console.error);
  }, []);

  return holidays;
}
