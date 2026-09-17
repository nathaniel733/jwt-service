import jwt from "jsonwebtoken";

function parseBody(req) {
  if (!req.body) return {};

  if (typeof req.body === "object") {
    return req.body;
  }

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only POST is supported
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const body = parseBody(req);

    console.log("JWT REFRESH:", new Date().toISOString());
    console.log("Request body:", body);

    const { identity, isAnonymous } = body;

    if (!identity) {
      return res.status(400).json({
        error: "identity is required"
      });
    }

    // Vercel server-side environment variables
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("CLIENT_ID or CLIENT_SECRET is missing");

      return res.status(500).json({
        error: "JWT service is not configured"
      });
    }

    const payload = {
      aud: "https://idproxy.kore.ai/authorize",
      iss: CLIENT_ID,
      sub: identity,
      isAnonymous:
        isAnonymous === true ||
        isAnonymous === "true"
    };

    const token = jwt.sign(payload, CLIENT_SECRET, {
      algorithm: "HS256",
      expiresIn: "1d"
    });

    console.log("JWT generated successfully");

    return res.status(200).json({
      jwt: token
    });

  } catch (err) {
    console.error("JWT error:", err);

    return res.status(500).json({
      error: "JWT generation failed"
    });
  }
}
