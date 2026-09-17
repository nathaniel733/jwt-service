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
    methods: ["POST"],
  }),
);
 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.post("/jwt", (req, res) => {
  try {
    const { identity, isAnonymous } = req.body;
    console.log("JWT REFRESH:", new Date().toISOString());
    console.log("Identity:", req.body.identity);
 
    if (!identity) {
      return res.status(400).json({ error: "identity is required" });
    }
 
    const payload = {
      aud: "https://idproxy.kore.ai/authorize",
      iss: CLIENT_ID,
      sub: identity,
      isAnonymous: isAnonymous === true || isAnonymous === "true",
    };
 
    const token = jwt.sign(payload, CLIENT_SECRET, {
      algorithm: "HS256",
      expiresIn: "1d",
    });
 
    res.json({ jwt: token });
  } catch (err) {
    console.error("JWT error:", err);
    res.status(500).json({ error: "JWT generation failed" });
  }
});
 
app.listen(3000, () => {
  console.log("JWT backend running at http://localhost:3000");
});