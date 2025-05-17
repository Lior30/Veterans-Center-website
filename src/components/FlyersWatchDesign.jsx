// src/components/FlyersWatchDesign.jsx

import React from "react";

export default function FlyersWatchDesign({ flyers }) {
  return (
    <div style={{ padding: 40 }}>
      <h2>צפייה בפליירים קיימים</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {flyers.map((f) => (
          <div key={f.id} style={{ width: 200, textAlign: "center" }}>
            <h4>{f.name}</h4>
            <a href={f.fileUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={f.fileUrl}
                alt={f.name}
                style={{ width: "100%", height: "auto", border: "1px solid #ccc" }}
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
