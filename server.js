import admin from "firebase-admin";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();

const EBAY_TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Home route
app.get("/", (req, res) => {
  res.send("eBay notification server is running ✅");
});

app.get("/connect/ebay", (req, res) => {
  res.redirect("/auth/ebay/login");
});
// eBay login route
app.get("/auth/ebay/login", (req, res) => {
  const scopes = [
    "https://api.ebay.com/oauth/api_scope",
    "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
    "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
    "https://api.ebay.com/oauth/api_scope/sell.account.readonly",
    "https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
    "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
    "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly"
  ].join(" ");

  const authUrl =
    "https://auth.ebay.com/oauth2/authorize" +
    `?client_id=${encodeURIComponent(process.env.EBAY_CLIENT_ID)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(process.env.EBAY_RUNAME)}` +
    `&scope=${encodeURIComponent(scopes)}`;

  res.redirect(authUrl);
});

// eBay callback route
app.get("/auth/ebay/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("No authorization code received.");
  }

  const credentials = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(EBAY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.EBAY_RUNAME
    })
  });

  const data = await response.json(); 

  await db.collection("ebayStores").add({
  connectedAt: new Date(),
  accessToken: data.access_token,
  refreshToken: data.refresh_token,
  expiresIn: data.expires_in,
  refreshTokenExpiresIn: data.refresh_token_expires_in
});

  console.log("eBay token response:", data);

  if (!response.ok) {
    return res.status(400).json(data);
  }

  res.send("Store connected and token received successfully ✅");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
