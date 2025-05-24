import React from "react";

export default function CreateSurveyDesign({
  headline,
  questions,
  onHeadlineChange,
  onAddQuestion,
  onQuestionChange,
  onQuestionTypeChange,
  onAddOption,
  onOptionChange,
  onMandatoryChange,
  onRemoveQuestion,
  onSubmit,
  onCancel,
}) {
  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <h2>יצירת סקר חדש</h2>

      {/* Headline */}
      <div style={{ margin: "20px 0" }}>
        <label>
          <strong>כותרת:</strong>
          <input
            type="text"
            value={headline}
            onChange={onHeadlineChange}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
      </div>

      {/* Questions */}
      {questions.map((q, idx) => (
        <div
          key={q.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 16,
            borderRadius: 4,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>
              שאלה מספר  {idx + 1} {q.mandatory && <span style={{ color: "red" }}>*</span>}
            </strong>
            {!q.fixed && (
              <button onClick={() => onRemoveQuestion(q.id)}>הסר</button>
            )}
          </div>

          {/* Text */}
          <div style={{ margin: "10px 0" }}>
            <input
              type="text"
              placeholder="הקלד שאלה כאן"
              value={q.text}
              onChange={(e) => onQuestionChange(q.id, e.target.value)}
              style={{ width: "100%", padding: 6 }}
            />
          </div>

          {/* Type & Mandatory */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            <label style={{ marginRight: 20 }}>
              סוג שאלה:{" "}
              <select
                value={q.type}
                onChange={(e) => onQuestionTypeChange(q.id, e.target.value)}
              >
                <option value="open">שאלה פתוחה</option>
                <option value="multiple">שאלה אמריקאית</option>
              </select>
            </label>

            <label>
              <input
                type="checkbox"
                checked={q.mandatory}
                onChange={() => onMandatoryChange(q.id)}
                disabled={q.fixed}
              />{" "}
              שאלת חובה
            </label>
          </div>

          {/* Options */}
          {q.type === "multiple" && (
            <div style={{ marginLeft: 20 }}>
              {q.options.map((opt, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <input
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => onOptionChange(q.id, i, e.target.value)}
                    style={{ padding: 4, width: "80%" }}
                  />
                </div>
              ))}
              <button onClick={() => onAddOption(q.id)}>+ Add Option</button>
            </div>
          )}
        </div>
      ))}

      {/* Actions */}
      <div style={{ marginTop: 20 }}>
        <button onClick={onAddQuestion} style={{ marginRight: 12 }}>
          + הוסף שאלה
        </button>
        <button onClick={onSubmit} style={{ marginRight: 8 }}>
          ✅ פרסם סקר
        </button>
        <button onClick={onCancel}>← ביטול</button>
      </div>
    </div>
  );
}
