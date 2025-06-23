import React, { useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function JerusalemMap({ locations = [] }) {
  const maxCount = Math.max(...locations.map(l => l.count), 1)

  return (
    <MapContainer
      center={[31.7683, 35.2137]}
      zoom={12}
      style={{ height: 400, width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map(loc => (
        <InteractiveMarker key={loc.name} location={loc} maxCount={maxCount} />
      ))}
    </MapContainer>
  )
}

function InteractiveMarker({ location, maxCount }) {
  const radius = 10 + (location.count / maxCount) * 20
  const tooltipRef = useRef()

  return (
    <CircleMarker
      center={location.coords}
      radius={radius}
      fillOpacity={0.6}
      stroke={false}
      fillColor="#8e2c88"
      eventHandlers={{
        mouseover: e => {
          e.target.openTooltip()
        },
        mousemove: e => {
          if (tooltipRef.current) {
            tooltipRef.current.setLatLng(e.latlng)
          }
        },
        mouseout: e => {
          e.target.closeTooltip()
        }
      }}
    >
      <Tooltip
        direction="top"
        offset={[0, 0]}
        permanent={false}
        interactive={false}
        ref={tooltipRef}
      >
        <div style={{ textAlign: 'center', direction: 'rtl' }}>
          <strong>{location.name}</strong><br />
          {location.count} משתמשים<br />
          {(location.percent * 100).toFixed(1)}%
        </div>
      </Tooltip>
    </CircleMarker>
  )
}
