const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const verificationToken = "rulz17-delete-token-secure-2026-render";
const endpoint = "https://ebay-notification-server.onrender.com/api/ebay/account-deletion";

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/api/ebay/account-deletion", (req, res) => {
  const challengeCode = req.query.challenge_code;

  if (!challengeCode) {
    return res.status(400).json({ error: "Missing challenge_code" });
  }

  const challengeResponse = crypto
    .createHash("sha256")
    .update(challengeCode + verificationToken + endpoint)
    .digest("hex");

  res.status(200).json({
    challengeResponse
  });
});

app.post("/api/ebay/account-deletion", (req, res) => {
  console.log("Deletion notification:", req.body);
  res.status(200).json({ received: true });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
