// src/components/SurveyDetailsPage.jsx
import React from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { useNavigate, useLocation } from 'react-router-dom'

export default function SurveyDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const surveys = location.state?.surveyDetails || []

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f8f9fa' }}>
      {/* כפתור חזרה */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            background: '#7e64e0',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← חזרה
        </button>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#212529', marginBottom: 24 }}>
        פירוט היענות לסקרים
      </h1>

      {surveys.length === 0 ? (
        <p style={{ color: '#666' }}>אין נתונים להצגה בסקרים.</p>
      ) : (
        surveys.map((survey, idx) => {
          const answered   = survey.answered   || 0
          const registered = survey.registered || 0
          const remaining  = Math.max(registered - answered, 0)

          // נתונים עם שני קטעים: קטע answered (סגול) וקטע remaining (אפור)
          const data = [
            {
              metric: 'ענו',
              answered,
              remaining,
            },
          ]

          // ticks מ־0 עד registered כולל
          const ticks = Array.from({ length: registered + 1 }, (_, i) => i)

          return (
            <div
              key={survey.id || idx}
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: '16px',
                marginBottom: '20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              {/* כותרת: סקר + פעילות */}
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>
                {survey.name}
                <span style={{ fontSize: 14, fontWeight: 400, color: '#555' }}>
                  {' '}({survey.activityName})
                </span>
              </h2>

              <div style={{ height: 80 }}>
                <ResponsiveBar
                  data={data}
                  keys={['answered', 'remaining']}    // שימו לב: remaining תחילה כדי שתצבעו רק answered
                  indexBy="metric"
                  layout="horizontal"
                  groupMode="stacked"
                  margin={{ top: 10, right: 20, bottom: 30, left: 80 }}
                  padding={0.3}
                  borderRadius={3}
                  // צבעים לפי id של המקטע
                  colors={({ id }) => (id === 'answered' ? '#7e64e0' : '#e0e0e0')}
                  colorBy="id"

                  // תחום X מלא מ־0 עד registered
                  xScale={{ type: 'linear', min: 0, max: registered, reverse: true }}
                  

                  // תוויות רק על answered
                  enableLabel
                  label={({ id, value }) => (id === 'answered' ? value : '')}
                  valueFormat=">-.0f"
                  labelTextColor="#212529"

                  // כבה רשת
                  enableGridX={false}
                  enableGridY={false}

                  // מציג שמות ב־axisLeft
                  axisLeft={{
                    tickSize: 0,
                    tickPadding: 8,
                    tickRotation: 0,
                  }}

                  // ציר תחתון מ־0 עד registered
                  axisBottom={{
                    tickSize: 0,
                    tickPadding: 8,
                    tickRotation: 0,
                    legend: 'מספר נרשמים',
                    legendPosition: 'middle',
                    legendOffset: 25,
                    tickValues: ticks,
                    tickFormat: v => v,
                  }}
                  axisTop={null}
                  axisRight={null}

                  animate
                />
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
