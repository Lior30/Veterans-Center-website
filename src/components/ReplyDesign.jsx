import React from "react";

export default function ReplyDesign({
  message,
  fullname,
  phone,
  replyText,
  onFullnameChange,
  onPhoneChange,
  onReplyChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <h2>Reply to: {message.title}</h2>
      <p>{message.body}</p>
      <hr />

      <div style={{ margin: "20px 0" }}>
        <label>
          <strong>Full Name*:</strong>
          <input
            type="text"
            value={fullname}
            onChange={onFullnameChange}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
      </div>

      <div style={{ margin: "20px 0" }}>
        <label>
          <strong>Phone Number*:</strong>
          <input
            type="text"
            value={phone}
            onChange={onPhoneChange}
            placeholder="05XXXXXXXX"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
      </div>

      <div style={{ margin: "20px 0" }}>
        <label>
          <strong>Your Message:</strong>
          <textarea
            value={replyText}
            onChange={onReplyChange}
            style={{ width: "100%", height: 120, padding: 8, marginTop: 4 }}
          />
        </label>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={onSubmit} style={{ marginRight: 12 }}>
          ✅ Send Reply
        </button>
        <button onClick={onCancel}>← Cancel</button>
      </div>
    </div>
  );
}
