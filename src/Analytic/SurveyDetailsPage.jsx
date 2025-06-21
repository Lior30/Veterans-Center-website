import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SurveyDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const surveys = location.state?.surveyDetails || [];

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f8f9fa' }}>
      {/* כפתור חזרה – עכשיו אחרי padding עליון ועם מרווח תחתון */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            background: '#7e64e0',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← חזרה
        </button>
      </div>

      {/* כותרת ראשית */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#212529', marginBottom: 24 }}>
        פירוט היענות לסקרים
      </h1>

      {surveys.length === 0 ? (
        <p style={{ color: '#666' }}>אין נתונים להצגה בסקרים.</p>
      ) : (
        surveys.map((survey, index) => {
          const answered = survey.answered || 0;
          const notAnswered = (survey.registered || 0) - answered;
          // נתונים לפירוש גרף – שני ברים בלבד
          const data = [
            { metric: 'ענו', value: answered },
            { metric: 'לא ענו', value: notAnswered }
          ];

          return (
            <div
              key={index}
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              {/* כותרת משנה: שם הסקר + שם הפעילות בסוגריים */}
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>
                {survey.headline || 'סקר ללא שם'}{' '}
                <span style={{ fontSize: 14, fontWeight: 400, color: '#555' }}>
                  ({survey.activityName || survey.of_activity || 'ללא פעילות'})
                </span>
              </h2>

              {/* הגרף – בר אנכי עם תוויות שלמות */}
              <div style={{ height: 200 }}>
                <ResponsiveBar
                  data={data}
                  keys={['value']}
                  indexBy="metric"
                  margin={{ top: 20, right: 40, bottom: 30, left: 60 }}
                  padding={0.5}
                  layout="vertical"
                  // צבע לפי אינדקס: ראשון סגול, שני צהוב
                  colors={['#7e64e0', '#ffd400']}
                  colorBy="index"
                  // תצוגת ערכים ללא עשרונים
                  valueFormat=".0f"
                  enableLabel={true}
                  label={(d) => d.value}
                  labelTextColor="#212529"
                  // ציר Y עם סיומת
                  axisLeft={{
                    tickSize: 0,
                    tickPadding: 6,
                    tickRotation: 0,
                    legend: 'מספר אנשים',
                    legendPosition: 'middle',
                    legendOffset: -40
                  }}
                  axisBottom={{
                    tickSize: 0,
                    tickPadding: 6,
                    tickRotation: 0
                  }}
                  axisRight={null}
                  axisTop={null}
                  animate={true}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
