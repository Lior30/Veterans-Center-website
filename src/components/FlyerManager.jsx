// src/components/FlyerManager.jsx
import React, { useState, useEffect } from "react";
import FlyerUploader from "./FlyerUploaderArea.jsx";
import FlyerService from "./FlyerService.jsx";

export default function FlyerManager() {
  const [flyers, setFlyers] = useState([]);

  
  useEffect(() => {
    fetchFlyers();
  }, []);

  const fetchFlyers = async () => {
    const fetched = await FlyerService.getFlyers();
    setFlyers(fetched);
  };

  const handleUpload = async (name, file) => {
    await FlyerService.uploadFlyer(name, file);
    await fetchFlyers();
  };

  const handleDelete = async (flyer) => {
    if (window.confirm(`האם למחוק את הפלאייר "${flyer.name}"?`)) {
      try {
        await FlyerService.deleteFlyer(flyer);
        setFlyers((prev) => prev.filter((f) => f.id !== flyer.id));
      } catch (err) {
        alert("מחיקת הפלאייר נכשלה.");
        console.error(err);
      }
    }
  };

  return (
    <div style={{ padding: 40, direction: "rtl", textAlign: "right" }}>
      <h2>ניהול פלאיירים</h2>
      <FlyerUploader onSubmit={handleUpload} />

      <hr style={{ margin: "40px 0", width: "21.75%", marginRight: 0}} />

      <h3>פלאיירים קיימים:</h3>
      {flyers.length === 0 ? (
        <p>אין עדיין פלאיירים.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {flyers.map((flyer) => (
            <div
              key={flyer.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 6,
                padding: 10,
                width: 200,
                textAlign: "right",
                direction: "rtl",
              }}
            >
              <strong>{flyer.name}</strong>
              <br />
              <a href={flyer.fileUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={flyer.fileUrl}
                  alt={flyer.name}
                  style={{ maxWidth: "100%", marginTop: 10 }}
                />
              </a>
              <br />
              <button
                onClick={() => handleDelete(flyer)}
                style={{
                  marginTop: 10,
                  backgroundColor: "crimson",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                מחק
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
