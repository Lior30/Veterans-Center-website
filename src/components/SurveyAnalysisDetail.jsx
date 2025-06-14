// src/components/SurveyAnalysisDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import DownloadIcon from "@mui/icons-material/Download";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend
} from "recharts";
import {
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#aa00ff",
  "#ff4081",
  "#4caf50",
  "#f44336",
];

export default function SurveyAnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [chartTypes, setChartTypes] = useState({});
  const chartRefs = useRef({});

  useEffect(() => {
    async function load() {
      const sSnap = await getDoc(doc(db, "surveys", id));
      if (sSnap.exists()) setSurvey({ id: sSnap.id, ...sSnap.data() });

      const rSnap = await getDocs(collection(db, "surveys", id, "responses"));
      setResponses(rSnap.docs.map((doc) => doc.data()));
    }
    load();
  }, [id]);

  if (!survey) return <p>טוען ניתוח…</p>;

  const multipleChoiceQuestions = survey.questions.filter(q => q.type === "multiple");

  const makeChartData = (question) => {
    const counts = {};
    question.options.forEach(opt => counts[opt] = 0);
    responses.forEach(r => {
      const answer = r.answers?.[question.id];
      if (answer && counts.hasOwnProperty(answer)) counts[answer]++;
    });
    return question.options.map(opt => ({ name: opt, value: counts[opt] }));
  };

  const toggleChartType = (qid) => {
    setChartTypes(prev => ({
      ...prev,
      [qid]: prev[qid] === "bar" ? "pie" : "bar",
    }));
  };

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto", direction: "rtl" }}>
      <Typography variant="h4" gutterBottom>
        ניתוח סקר: {survey.headline}
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4 }}>
        כמות אנשים שענו על הסקר: {responses.length}
      </Typography>

      {multipleChoiceQuestions.length === 0 ? (
        <Typography>אין בסקר שאלות אמריקאיות</Typography>
      ) : (
        multipleChoiceQuestions.map((q, index) => {
          const chartData = makeChartData(q);
          const totalAnswers = chartData.reduce((sum, entry) => sum + entry.value, 0);
          const isBar = chartTypes[q.id] === "bar";

          return (
            <Box
              key={q.id}
              ref={(el) => (chartRefs.current[q.id] = el)}
              sx={{
                mb: 6,
                p: 3,
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {index + 1}. {q.text} ({totalAnswers} נשאלו)
                </Typography>
                <Box>
                  <IconButton onClick={() => toggleChartType(q.id)}>
                    <BarChartIcon />
                  </IconButton>
                  <IconButton onClick={() => toggleChartType(q.id)}>
                    <PieChartIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box display="flex" flexDirection="row-reverse" justifyContent="space-between" flexWrap="wrap" sx={{ gap: 4, mt: 2 }}>
                <Box sx={{ flex: 1, minWidth: 300, height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {isBar ? (
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={() => null} />
                        <Bar dataKey="value">
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          outerRadius={140}
                          labelLine={false}
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                            return percent > 0.05 ? (
                              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 16 }}>
                                {`${Math.round(percent * 100)}%`}
                              </text>
                            ) : null;
                          }}
                        >
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </Box>

                <Box sx={{ flex: 1, minWidth: 300 }}>
                  {chartData.map((entry, idx) => (
                    <Typography key={idx} sx={{ fontSize: 18, mb: 1 }}>
                      <span style={{
                        display: "inline-block",
                        width: 16,
                        height: 16,
                        backgroundColor: COLORS[idx % COLORS.length],
                        borderRadius: "50%",
                        marginLeft: 8
                      }} />
                      {entry.name} — {entry.value} תגובות
                    </Typography>
                  ))}
                </Box>
              </Box>

              <Box sx={{ textAlign: "left", mt: 1 }}>
                <IconButton
                  onClick={() => {
                    const container = chartRefs.current[q.id];
                    if (container) {
                      toPng(container, { backgroundColor: "#ffffff" })
                        .then((dataUrl) => {
                          const link = document.createElement("a");
                          link.download = `${survey.headline}_שאלה_${index + 1}.png`;
                          link.href = dataUrl;
                          link.click();
                        })
                        .catch((err) => {
                          console.error("⚠️ Failed to export chart:", err);
                        });
                    }
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Box>
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
