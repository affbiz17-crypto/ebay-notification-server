import express from "express";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EBAY_TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";

let db = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  db = admin.firestore();
  console.log("Firebase connected ✅");
} else {
  console.log("Firebase not configured yet.");
}

app.get("/", (req, res) => {
  res.send("eBay notification server is running ✅");
});

app.get("/connect/ebay", (req, res) => {
  res.redirect("/auth/ebay/login");
});

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

app.get("/auth/ebay/callback", async (req, res) => {
  try {
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

    console.log("eBay token response:", data);

    if (!response.ok) {
      return res.status(400).json(data);
    }

    const userResponse = await fetch(
      "https://apiz.ebay.com/commerce/identity/v1/user/",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.access_token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const userData = await userResponse.json();

    console.log("eBay user info:", userData);

    if (db) {
      await db.collection("ebayStores").add({
        connectedAt: new Date(),

        ebayUserId: userData.userId || null,
        username: userData.username || null,
        email: userData.email || null,

        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        accessTokenExpiresIn: data.expires_in,
        refreshTokenExpiresIn: data.refresh_token_expires_in
      });
    }

    res.send(`
      Store connected successfully ✅<br><br>
      Username: ${userData.username || "Unknown"}<br>
      eBay User ID: ${userData.userId || "Unknown"}
    `);
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).send("Server error during eBay connection.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
