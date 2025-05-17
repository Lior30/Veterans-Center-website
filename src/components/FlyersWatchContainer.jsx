// src/components/FlyersWatchContainer.jsx
import React, { useEffect, useState } from "react";
import FlyerService from "./FlyerService";
import FlyersWatchDesign from "./FlyersWatchDesign";

export default function FlyersWatchContainer() {
  const [flyers, setFlyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlyers = async () => {
      try {
        const result = await FlyerService.getFlyers();
        setFlyers(result);
      } catch (err) {
        console.error("Error fetching flyers:", err);
        alert("שגיאה בטעינת הפלאיירים.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlyers();
  }, []);

  return <FlyersWatchDesign flyers={flyers} loading={loading} />;
}
