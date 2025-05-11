import React from "react";

export default function SurveyDetailDesign({
  survey,
  answers,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <h2>
        {survey.headline}{" "}
        <small style={{ color: "red" }}>* Mandatory questions</small>
      </h2>

      {survey.questions.map((q, idx) => (
        <div key={q.id} style={{ margin: "20px 0" }}>
          <p>
            <strong>
              {idx + 1}. {q.text}
              {q.mandatory && <span style={{ color: "red" }}> *</span>}
            </strong>
          </p>

          {q.type === "open" ? (
            <textarea
              style={{ width: "100%", height: 80 }}
              value={answers[q.id] || ""}
              onChange={(e) => onChange(q.id, e.target.value)}
            />
          ) : (
            q.options.map((opt, i) => (
              <div key={i}>
                <label>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={(e) => onChange(q.id, e.target.value)}
                  />{" "}
                  {opt}
                </label>
              </div>
            ))
          )}
        </div>
      ))}

      <button onClick={onSubmit} style={{ marginRight: 12 }}>
        Submit Answers
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
