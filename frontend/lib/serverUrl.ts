export const serverUrl = (
  process.env.BACKEND_API_URL || "http://localhost:5000"
).replace(/\/$/, "");