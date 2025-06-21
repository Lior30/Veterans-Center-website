// src/components/SurveyAnalysisDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import DownloadIcon from "@mui/icons-material/Download";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { generateSummaryWithCohere } from "../services/AIService";
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
  useMediaQuery
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#aa00ff", "#ff4081", "#4caf50", "#f44336",
];

const sparkleUrl = "/assets/sparkle.svg";

export default function SurveyAnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [chartTypes, setChartTypes] = useState({});
  const [summaries, setSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState({});
  const chartRefs = useRef({});
  const isMobile = useMediaQuery("(max-width: 768px)");

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
  const openQuestions = survey.questions.filter(q => q.type === "open");

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

  const getValidOpenAnswers = (questionId) => {
    return responses
      .map(r => r.answers?.[questionId])
      .filter(ans => typeof ans === "string" && ans.trim().length > 0);
  };

  const summarizeAnswers = async (questionId, questionText) => {
  const validAnswers = getValidOpenAnswers(questionId);
  setLoadingSummaries(prev => ({ ...prev, [questionId]: true }));

  try {
    const summary = await generateSummaryWithCohere(questionText, validAnswers);
    setSummaries(prev => ({ ...prev, [questionId]: summary }));
  } catch (e) {
    console.error("❌ Cohere error:", e);
    setSummaries(prev => ({ ...prev, [questionId]: "שגיאה בסיכום התשובות." }));
  } finally {
    setLoadingSummaries(prev => ({ ...prev, [questionId]: false }));
  }
};

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto", direction: "rtl" }}>
      <Typography variant="h4" gutterBottom>
        ניתוח סקר: {survey.headline}
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4 }}>
        כמות אנשים שענו על הסקר: {responses.length}
      </Typography>

      <Box display={isMobile ? "block" : "flex"} gap={6} alignItems="flex-start">
        <Box flex={1}>
          {multipleChoiceQuestions.map((q, index) => {
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
                    <IconButton onClick={() => toggleChartType(q.id)}><BarChartIcon /></IconButton>
                    <IconButton onClick={() => toggleChartType(q.id)}><PieChartIcon /></IconButton>
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
                          <Legend layout="vertical" align="right" verticalAlign="middle" />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </Box>
                </Box>

                <Box sx={{ textAlign: "left", mt: 1 }}>
                  <IconButton onClick={() => {
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
                  }}>
                    <DownloadIcon />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box flex={1}>
          {openQuestions.map((q, i) => {
            const answers = getValidOpenAnswers(q.id);
            const isLoading = loadingSummaries[q.id];
            const summary = summaries[q.id];

            return (
              <Box
                key={q.id}
                sx={{
                  mb: 4,
                  p: 3,
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              >
                <Typography variant="h6">
                  {i + 1}. {q.text} ({answers.length} תשובות תקפות)
                </Typography>

                {answers.length < 5 ? (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    דרושות לפחות 5 תשובות כדי לאפשר סיכום אוטומטי
                  </Typography>
                ) : summary ? (
                  <>
                    <Typography sx={{ mt: 2 }}>{summary}</Typography>
                    <Button sx={{ mt: 1 }} onClick={() => summarizeAnswers(q.id, q.text)}>
                      צור סיכום חדש
                    </Button>
                  </>
                ) : isLoading ? (
                  <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                    <img src={sparkleUrl} alt="טוען..." style={{
                      width: "48px",
                      animation: "spin 2s linear infinite"
                    }} />
                    <Typography sx={{ ml: 2 }}>המערכת מסכמת תשובות…</Typography>
                  </Box>
                ) : (
                  <Button sx={{ mt: 2 }} onClick={() => summarizeAnswers(q.id, q.text)}>
                    סכם תשובות לשאלה זו
                  </Button>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 4 }}>
        ← חזרה
      </Button>
    </Box>
  );
}
