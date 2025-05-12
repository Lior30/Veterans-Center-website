import React from "react";

export default function ManageUsersDesign({ users, filter, onFilterChange }) {
  return (
    <div style={{ padding: 40 }}>
      <h1>Manage Users</h1>

      {/* Filter selector */}
      <div style={{ margin: "16px 0" }}>
        <label>
          Show:&nbsp;
          <select value={filter} onChange={e => onFilterChange(e.target.value)}>
            <option value="all">All Users</option>
            <option value="activity">Activity Only</option>
            <option value="survey">Survey Only</option>
            <option value="replies">Replies Only</option>
            <option value="both">Activity + Survey</option>
          </select>
        </label>
      </div>

      {/* Users table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Full Name</th>
            <th style={th}>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td style={td}>{u.fullName || "—"}</td>
              <td style={td}>{u.phone}</td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={2} style={{ textAlign: "center", padding: 8 }}>
                No users match this filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  border: "1px solid #ccc",
  padding: "8px",
  background: "#f5f5f5",
  textAlign: "left",
};
const td = {
  border: "1px solid #eee",
  padding: "8px",
};
