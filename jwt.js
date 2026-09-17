require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

app.use(
  cors({
    origin: "*",
    methods: ["POST", "OPTIONS"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/jwt", (req, res) => {
  try {
    const { identity, isAnonymous } = req.body;

    console.log("JWT REQUEST:", new Date().toISOString());
    console.log("Identity:", identity);

    if (!identity) {
      return res.status(400).json({
        error: "identity is required",
      });
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
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

    const token = jwt.sign(payload, CLIENT_SECRET, {
      algorithm: "HS256",
      expiresIn: "1d",
    });

    res.json({ jwt: token });
  } catch (err) {
    console.error("JWT error:", err);

    res.status(500).json({
      error: "JWT generation failed",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`JWT backend running on port ${PORT}`);
});
