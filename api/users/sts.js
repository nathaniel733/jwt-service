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
  // Allow the React site to call this endpoint.
  // Update this to your deployed React URL for production.
  res.setHeader(
    "Access-Control-Allow-Origin",
    "http://localhost:5173"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // Handle CORS preflight request
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

    const identity = body.identity;
    const isAnonymous = body.isAnonymous ?? true;
    const aud =
      body.aud || "https://idproxy.kore.com/authorize";

    if (!identity) {
      return res.status(400).json({
        error: "identity is required"
      });
    }

    // IMPORTANT:
    // Vercel Node.js functions use process.env
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error(
        "CLIENT_ID or CLIENT_SECRET is missing."
      );

      return res.status(500).json({
        error: "JWT service is not configured"
      });
    }

    // JWT NumericDate values must be in seconds
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iat: now,
      exp: now + 24 * 60 * 60,
      aud,
      iss: clientId,
      sub: identity,
      isAnonymous: Boolean(isAnonymous)
    };

    const token = jwt.sign(
      payload,
      clientSecret,
      {
        algorithm: "HS256"
      }
    );

    return res.status(200).json({
      jwt: token
    });

  } catch (error) {
    console.error("JWT generation failed:", error);

    return res.status(500).json({
      error: "Failed to generate JWT"
    });
  }
}
