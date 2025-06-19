// src/components/Analytic/JerusalemMap.jsx
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Expects a prop:
 *   locations = [
 *     { name: 'בית הכרם', count: 42, coords: [31.789, 35.183] },
 *     { name: 'גבעת רם',   count: 18, coords: [31.781, 35.205] },
 *     // …
 *   ]
 */
export default function JerusalemMap({ locations = [] }) {
  // Guard: if there's no data yet, show a loader
  if (locations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        Loading map…
      </div>
    );
  }

  // Find highest count so circles scale proportionally
  const maxCount = Math.max(...locations.map(l => l.count), 1);

  return (
    <MapContainer
      center={[31.7683, 35.2137]}   // מרכז ירושלים
      zoom={12}
      style={{ height: '400px', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map(loc => (
        <CircleMarker
          key={loc.name}
          center={loc.coords}
          radius={10 + (loc.count / maxCount) * 20}
          fillOpacity={0.6}
          stroke={false}
          fillColor="#8e2c88"
        >
          <Popup>
            <strong>{loc.name}</strong>
            <br />
            {loc.count} כניסות בשבוע האחרון
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
