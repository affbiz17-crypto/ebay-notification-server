import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("eBay notification server is running");
});

app.get("/connect/ebay", (req, res) => {
  res.send("eBay login route is working");
});

app.get("/auth/ebay/callback", (req, res) => {
  res.send("Store Connected Successfully ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
