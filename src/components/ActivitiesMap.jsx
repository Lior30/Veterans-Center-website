// src/src/components/ActivitiesMap.jsx
import { getDistance } from "geolib";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export default function ActivitiesMap({ activities, center, radius }) {
  const visible = activities.filter((a) =>
    a.location?.lat
      ? getDistance(
        { latitude: center.lat, longitude: center.lng },
        { latitude: a.location.lat, longitude: a.location.lng }
      ) <= radius
      : false
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      style={{ height: 400, width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Circle
        center={[center.lat, center.lng]}
        radius={radius}
        pathOptions={{ color: "blue", fillOpacity: 0.1 }}
      />
      {visible.map((a) => (
        <Marker key={a.id} position={[a.location.lat, a.location.lng]}>
          <Popup>
            <strong>{a.name}</strong>
            <br />
            {a.location.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
