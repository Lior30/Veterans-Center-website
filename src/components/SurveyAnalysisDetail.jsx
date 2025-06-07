// src/components/SurveyAnalysisDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Box, Typography, Button } from "@mui/material";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF4081"];

export default function SurveyAnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    async function load() {
      const sSnap = await getDoc(doc(db, "surveys", id));
      if (sSnap.exists()) {
        setSurvey({ id: sSnap.id, ...sSnap.data() });
      }
      const rSnap = await getDocs(collection(db, "surveys", id, "responses"));
      setResponses(rSnap.docs.map((doc) => doc.data()));
    }
    load();
  }, [id]);

  if (!survey) {
    return <p>טוען ניתוח…</p>;
  }

  const multipleChoiceQuestions = survey.questions.filter(q => q.type === "multiple");

  const makeChartData = (question) => {
    const counts = {};
    question.options.forEach(option => {
      counts[option] = 0;
    });
    responses.forEach(response => {
      const answer = response.answers?.[question.id];
      if (answer && counts.hasOwnProperty(answer)) {
        counts[answer]++;
      }
    });
    return question.options.map(option => ({
      name: option,
      value: counts[option]
    }));
  };

  return (
    <Box sx={{ padding: 4, maxWidth: "900px", margin: "0 auto", direction: "rtl" }}>
      <Typography variant="h4" gutterBottom>
        ניתוח סקר: {survey.headline}
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        כמות אנשים שענו על הסקר: {responses.length}
      </Typography>

      {multipleChoiceQuestions.length === 0 ? (
        <Typography sx={{ mt: 4 }}>
          אין בסקר שאלות אמריקאיות
        </Typography>
      ) : (
        multipleChoiceQuestions.map((q, index) => {
          const chartData = makeChartData(q);
          const totalAnswers = chartData.reduce((sum, entry) => sum + entry.value, 0);

          return (
            <Box
              key={q.id}
              sx={{
                mb: 6,
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {index + 1}. {q.text}{" "}
                  {q.required ? "(שאלת חובה)" : `(נשאלו: ${totalAnswers})`}
                </Typography>
              </Box>
              <PieChart width={400} height={300}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </Box>
          );
        })
      )}

      <Button variant="outlined" onClick={() => navigate(-1)}>
        ← חזרה
      </Button>
    </Box>
  );
}
