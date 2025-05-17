import React, { useState } from "react";
import FlyerUploader from "./FlyerUploader";
import FlyerService from "./FlyerService";

export default function FlyerManager() {
  const [viewing, setViewing] = useState(false);
  const [flyers, setFlyers] = useState([]);

  const handleUpload = async (name, file) => {
    await FlyerService.uploadFlyer(name, file);
    alert("הפלאייר נשמר בהצלחה!");
  };

  const fetchFlyers = async () => {
    const result = await FlyerService.getFlyers();
    setFlyers(result);
    setViewing(true);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>ניהול פלאיירים</h2>

      <FlyerUploader onSubmit={handleUpload} />

      <button style={{ marginTop: 20 }} onClick={fetchFlyers}>
        צפה בפלאיירים
      </button>

      {viewing && flyers.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>פלאיירים קיימים:</h3>
          <ul>
            {flyers.map((f) => (
              <li key={f.id}>
                {f.name}{" "}
                <a href={f.url} target="_blank" rel="noopener noreferrer">
                  (הצג)
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {viewing && flyers.length === 0 && (
        <p style={{ marginTop: 30 }}>לא נמצאו פלאיירים.</p>
      )}
    </div>
  );
}
