import React, { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet'

// function to process user data and group by address
async function processUserData(userData) {
  // group users by address
  const locationGroups = {}
  
  userData.forEach(user => {
    const address = user.address
    if (address && address.trim()) {
      if (!locationGroups[address]) {
        locationGroups[address] = {
          name: address,
          users: [],
          count: 0
        }
      }
      locationGroups[address].users.push(user)
      locationGroups[address].count += 1
    }
  })
  
  const totalUsers = userData.length
  
  // the structure for the final locations
  const locations = []
  for (const location of Object.values(locationGroups)) {
    const coords = await getCoordinatesForAddress(location.name)
    if (coords) {
      locations.push({
        name: location.name,
        count: location.count,
        percent: location.count / totalUsers,
        coords: coords
      })
    }
  }
  
  return locations
}

// Nominatim API 
async function getCoordinatesForAddress(address) {
  
  const knownLocations = {
    'מלחה': [31.7234, 35.1956],
    'בית הכרם': [31.7859, 35.1964],
    'רמות בני': [31.7532, 35.1875],
    'נחלת שלמה': [31.7821, 35.2195],
    'קרית היובל': [31.7234, 35.1456],
    'עיר גנים': [31.7456, 35.2234],
    'נווה יעקב': [31.8234, 35.2456],
    'חומת שמואל': [31.8123, 35.2134],
    'גבעת זאב': [31.8456, 35.1623],
    'רמות אלון': [31.7823, 35.1734],
    'מעלה אדומים': [31.7723, 35.2934],
    'גילה': [31.7145, 35.1889],
    'תלפיות': [31.7423, 35.2234],
    'קטמונים': [31.7534, 35.2089],
    'ארנונה': [31.7389, 35.2234],
    'עין כרם': [31.7623, 35.1567],
    'גבעת שאול': [31.8012, 35.1923],
    'רמת רחל': [31.7034, 35.2178],
    'הר נוף': [31.7923, 35.1734],
    'בית זית': [31.8145, 35.2289],
    'שועפat': [31.7845, 35.2356],
    'סנהדריה': [31.8023, 35.2189],
    'רמת דניה': [31.8234, 35.2123],
    'פסגת זאב': [31.8456, 35.2234]
  }
  
  if (knownLocations[address]) {
    return knownLocations[address]
  }
  
  // looks for API
  try {
    const searchQuery = `${address}, ירושלים, ישראל`
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&bounded=1&viewbox=35.1,31.9,35.3,31.6`
    )
    const data = await response.json()
    
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    }
  } catch (error) {
    console.warn(`לא ניתן למצוא קואורדינטות עבור: ${address}`)
  }
  
  return null
}

// data for example usage
const sampleUserData = [
  { address: 'מלחה', first_name: 'בדיקה', last_name: 'אפס', phone: '0500534560' },
  { address: 'בית הכרם', first_name: 'יוסי', last_name: 'כהן', phone: '0501234567' },
  { address: 'מלחה', first_name: 'שרה', last_name: 'לוי', phone: '0502345678' },
  { address: 'נחלת שלמה', first_name: 'דוד', last_name: 'ישראל', phone: '0503456789' },
  { address: 'בית הכרם', first_name: 'רחל', last_name: 'אברהם', phone: '0504567890' },
  { address: 'מעלה אדומים', first_name: 'משה', last_name: 'יעקב', phone: '0505678901' },
  { address: 'מעלה אדומים', first_name: 'אברהם', last_name: 'לוי', phone: '0506789012' }
]

export default function JerusalemMap({ userData = sampleUserData }) {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  
  useState(() => {
    async function loadLocations() {
      setLoading(true)
      const processedLocations = await processUserData(userData)
      setLocations(processedLocations)
      setLoading(false)
    }
    loadLocations()
  }, [userData])
  
  const [tooltip, setTooltip] = useState(null)
  const maxCount = Math.max(...locations.map(l => l.count), 1)
  
  if (loading) {
    return (
      <div style={{ 
        height: 500, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        color: '#666'
      }}>
        טוען מיקומים...
      </div>
    )
  }
  
  if (locations.length === 0) {
    return (
      <div style={{ 
        height: 500, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        color: '#666'
      }}>
        אין נתונים להצגה או שלא נמצאו קואורדינטות למיקומים
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', height: 500, width: '100%' }}>
      <MapContainer
        center={[31.7683, 35.2137]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEventHandler setTooltip={setTooltip} />

        {locations.map(loc => (
          <InteractiveMarker 
            key={loc.name} 
            location={loc} 
            maxCount={maxCount}
            setTooltip={setTooltip}
          />
        ))}
      </MapContainer>

      {/* Custom tooltip that follows the mouse */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 15,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#333',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            textAlign: 'center',
            direction: 'rtl',
            pointerEvents: 'none',
            zIndex: 10000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
            {tooltip.name}
          </div>
          <div style={{ marginBottom: '2px' }}>{tooltip.count} משתמשים</div>
          <div style={{ opacity: 0.7 }}>{(tooltip.percent * 100).toFixed(1)}%</div>
        </div>
      )}
    </div>
  )
}

function MapEventHandler({ setTooltip }) {
  useMapEvents({
    mousemove: () => {
      // This will help clear tooltip when mouse moves away from markers
    }
  })
  return null
}

function InteractiveMarker({ location, maxCount, setTooltip }) {
  const radius = 10 + (location.count / maxCount) * 20

  const handleMouseEnter = (e) => {
    const containerPoint = e.containerPoint
    const mapPane = e.target._map.getPane('mapPane')
    const mapContainer = e.target._map.getContainer()
    const rect = mapContainer.getBoundingClientRect()
    
    setTooltip({
      x: rect.left + containerPoint.x,
      y: rect.top + containerPoint.y,
      name: location.name,
      count: location.count,
      percent: location.percent
    })
  }

  const handleMouseMove = (e) => {
    if (e.containerPoint) {
      const containerPoint = e.containerPoint
      const mapContainer = e.target._map.getContainer()
      const rect = mapContainer.getBoundingClientRect()
      
      setTooltip(prev => prev ? {
        ...prev,
        x: rect.left + containerPoint.x,
        y: rect.top + containerPoint.y
      } : null)
    }
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  return (
    <CircleMarker
      center={location.coords}
      radius={radius}
      fillOpacity={0.7}
      stroke={true}
      strokeColor="#fff"
      strokeWidth={2}
      fillColor="#8e2c88"
      eventHandlers={{
        mouseover: handleMouseEnter,
        mousemove: handleMouseMove,
        mouseout: handleMouseLeave
      }}
    />
  )
}