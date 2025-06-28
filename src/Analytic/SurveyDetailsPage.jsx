// src/components/SurveyDetailsPage.jsx
import React, { useEffect, useState } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { useNavigate, useLocation } from 'react-router-dom'
import { db } from '../firebase' 
import { doc, getDoc } from 'firebase/firestore'

export default function SurveyDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const baseSurveys = location.state?.surveyDetails || []    /* + */

  /* state עם סקרים “מעושרים” בשם-פעילות */
  const [surveys, setSurveys] = useState(baseSurveys)        /* + */

  /* ── מביאים שמות-פעילות לפעם אחת ── */
  useEffect(() => {                                          /* + */
    async function enrich() {
      /* מזהים כל activity-id שאינו "כללי" */
      const ids = [
        ...new Set(
          baseSurveys
            .filter(s => s.of_activity && s.of_activity !== 'כללי')
            .map(s => s.of_activity)
        ),
      ]

      /* מביאים name מכל activity */
      const id2name = {}
      await Promise.all(
        ids.map(async id => {
          const snap = await getDoc(doc(db, 'activities', id))
          if (snap.exists()) id2name[id] = snap.data().name || '—'
        })
      )

      /* מוסיפים activityName לכל סקר */
      setSurveys(
        baseSurveys.map(s => ({
          ...s,
          activityName:
            s.of_activity && s.of_activity !== 'כללי'
              ? id2name[s.of_activity]
              : null,
        }))
      )
    }
    enrich()
  }, [baseSurveys]) 

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f8f9fa' }}>
      {/* return button*/}
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

          
          const data = [
            {
              metric: 'ענו',
              ענו:   answered,
              נותרו: remaining,
            },
          ]

          
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
              {/* headline*/}
               <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>
                {survey.activityName || 'סקר כללי'}         
                <span style={{ fontSize: 14, fontWeight: 400, color: '#555' }}>
                  {' '}({survey.name})
                </span>
               </h2>

              <div style={{ height: 80 }}>
                <ResponsiveBar
                  data={data}
                  keys={['ענו', 'נותרו']}    
                  indexBy="id"
                  layout="horizontal"
                  groupMode="stacked"
                  margin={{ top: 10, right: 20, bottom: 30, left: 80 }}
                  padding={0.3}
                  borderRadius={3}
                  
                  colors={({ id }) => (id === 'ענו' ? '#7e64e0' : '#e0e0e0')}
                  colorBy="id"

                  
                  valueScale={{ type: 'linear', min: 0, max: registered, reverse: true }}
                  

                  
                  enableLabel
                  label={({ id, value }) => (id === 'ענו' ? value : '')}
                  valueFormat=">-.0f"
                  labelTextColor="#212529"

                  
                  enableGridX={false}
                  enableGridY={false}
                  
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

                  tooltip={({ id, value }) => (
                    <div style={{ direction:'rtl',
                                  background:'#fff',
                                  padding:'6px 8px',
                                  border:'1px solid #ddd',
                                  borderRadius:4,
                                  fontSize:13,
                                  fontWeight:600 }}>
                      <span style={{ fontWeight:700 }}>{value}</span> {id}
                    </div>
                  )}

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
