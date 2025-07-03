import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase.js";

export default function SurveyResultsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);

  // load survey + responses
  useEffect(() => {
    async function load() {
      const sSnap = await getDoc(doc(db, "surveys", id));
      if (sSnap.exists()) setSurvey({ id: sSnap.id, ...sSnap.data() });

      const rSnap = await getDocs(
        collection(db, "surveys", id, "responses")
      );
      setResponses(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    load();
  }, [id]);

  // delete one response
  const handleDeleteResponse = async (respId) => {
    await deleteDoc(
      doc(db, "surveys", id, "responses", respId)
    );
    // reload
    const rSnap = await getDocs(
      collection(db, "surveys", id, "responses")
    );
    setResponses(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  if (!survey) return <p>Loading…</p>;

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <h2>Survey: {survey.headline}</h2>

      {responses.length === 0 ? (
        <p>No responses yet.</p>
      ) : (
        responses.map((resp) => {
          const name = `${resp.answers.firstName || ""} ${resp.answers.lastName || ""}`.trim();
          const phone = resp.answers.phone || "";

          return (
            <div
              key={resp.id}
              style={{
                border: "1px solid #ddd",
                padding: 16,
                marginBottom: 24,
                borderRadius: 4,
                background: "#fafafa",
              }}
            >
              {/* headline for this response */}
              <h3>
                {name} {phone && `(${phone})`}
              </h3>

              {/* show the other questions/answers */}
              {survey.questions.map((q) => (
                <p key={q.id}>
                  <strong>{q.text}</strong>
                  <br />
                  {resp.answers[q.id]}
                </p>
              ))}

              <button onClick={() => handleDeleteResponse(resp.id)}>
                Delete This Response
              </button>
            </div>
          );
        })
      )}

      <button onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
}
