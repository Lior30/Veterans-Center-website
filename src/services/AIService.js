export async function generateSummaryWithCohere(questionText, answers) {
  const apiKey = import.meta.env.VITE_COHERE_API_KEY;
  const messages = [
    {
      role: "USER",
      message: `
שאלה בסקר: "${questionText}"
התשובות:
${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}

אנא כתוב סיכום תמציתי בעברית:
      `
    }
  ];

  const res = await fetch("https://api.cohere.ai/v1/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "command-r-plus",
      temperature: 0.3,
      chat_history: [],
      message: messages[0].message
    })
  });

  const body = await res.json();

  if (!res.ok) {
    console.error("❌ Cohere API error:", body);
    throw new Error(body.message || `HTTP ${res.status}`);
  }

  const text = body.text || "";
  return text.trim() || "המערכת לא הניבה סיכום.";
}
