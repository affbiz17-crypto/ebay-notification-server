const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/api/ebay/account-deletion", (req, res) => {
  res.send("eBay account deletion endpoint active");
});

app.post("/api/ebay/account-deletion", (req, res) => {
  console.log("Deletion notification:", req.body);

  res.status(200).json({
    received: true
  });
});

const PORT = process.env.PORT || 10000; 
const verificationToken =
  "rulz17-delete-token-secure-2026-render";

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
