import React from "react";

export default function CreateMessageDesign({
  title,
  body,
  location,
  onTitleChange,
  onBodyChange,
  onLocationChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <h2>Create New Message</h2>

      {/* Title */}
      <div style={{ margin: "20px 0" }}>
        <label>
          <strong>Title:</strong>
          <input
            type="text"
            value={title}
            onChange={onTitleChange}
            placeholder="Enter message title"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
      </div>

      {/* Body */}
      <div style={{ margin: "20px 0" }}>
        <label>
          <strong>Body:</strong>
          <textarea
            value={body}
            onChange={onBodyChange}
            placeholder="Enter message body"
            style={{ width: "100%", height: 120, padding: 8, marginTop: 4 }}
          />
        </label>
      </div>

      {/* Location dropdown */}
      <div style={{ margin: "20px 0" }}>
        <label>
          <strong>Display On:</strong>
          <select
            value={location}
            onChange={onLocationChange}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          >
            <option value="">— select where to show —</option>
            <option value="home">Home Page</option>
            <option value="fullActivity">When Activity Is Full</option>
            <option value="surveysView">When Viewing Surveys</option>
          </select>
        </label>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 20 }}>
        <button onClick={onSubmit} style={{ marginRight: 12 }}>
          ✅ Publish Message
        </button>
        <button onClick={onCancel}>← Cancel</button>
      </div>
    </div>
  );
}
