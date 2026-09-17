const jwt = require("jsonwebtoken");
const cors = require("cors");

const corsMiddleware = cors({
  origin: "*",
  methods: ["POST", "OPTIONS"],
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

module.exports = async function handler(req, res) {
  try {
    await runMiddleware(req, res, corsMiddleware);

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed",
      });
    }

    const {
      identity,
      isAnonymous,
    } = req.body || {};

    console.log("JWT REFRESH:", new Date().toISOString());
    console.log("Identity:", identity);

    if (!identity) {
      return res.status(400).json({
        error: "identity is required",
      });
    }

    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error(
        "CLIENT_ID or CLIENT_SECRET is missing"
      );

      return res.status(500).json({
        error: "JWT service is not configured",
      });
    }

    const payload = {
      aud: "https://idproxy.kore.ai/authorize",
      iss: CLIENT_ID,
      sub: identity,
      isAnonymous:
        isAnonymous === true ||
        isAnonymous === "true",
    };

    const token = jwt.sign(
      payload,
      CLIENT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      jwt: token,
    });

  } catch (err) {
    console.error("JWT error:", err);

    return res.status(500).json({
      error: "JWT generation failed",
    });
  }
};
