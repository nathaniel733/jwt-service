import jwt from "jsonwebtoken";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

export default function handler(req, res) {
  // Allow the React site to call this endpoint from another Vercel domain.
  // For production, replace "*" with your exact frontend origin if desired.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);

    const identity = body.identity;
    const isAnonymous = body.isAnonymous ?? true;
    const aud = body.aud || "https://idproxy.kore.com/authorize";

    if (!identity) {
      return res.status(400).json({
        error: "identity is required"
      });
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("CLIENT_ID or CLIENT_SECRET is missing.");
      return res.status(500).json({
        error: "JWT service is not configured"
      });
    }

    // Kore.ai's Web SDK JWT flow expects these claims.
    // The Client Secret stays exclusively on the server.
    const now = Date.now();

    const payload = {
      iat: now,
      exp: now + 24 * 60 * 60 * 1000,
      aud,
      iss: clientId,
      sub: identity,
      isAnonymous: Boolean(isAnonymous)
    };

    // HS256 is the signing algorithm configured for this JWT app in Kore.ai.
    const token = jwt.sign(payload, clientSecret, {
      algorithm: "HS256"
    });

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
