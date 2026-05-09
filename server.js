import express from "express";

const app = express();
app.use(express.json());

const {
  EBAY_CLIENT_ID,
  EBAY_CLIENT_SECRET,
  EBAY_RUNAME,
  EBAY_REDIRECT_URI
} = process.env;

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "eBay Command Center backend running"
  });
});

// STEP 1: Start eBay login
app.get("/connect/ebay", (req, res) => {
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
    `?client_id=${encodeURIComponent(EBAY_CLIENT_ID)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(EBAY_RUNAME)}` +
    `&scope=${encodeURIComponent(scopes)}`;

  res.redirect(authUrl);
});

// STEP 2: eBay sends user back here
app.get("https://ebay-notifcation-server.onrender.com/auth/ebay/callback", async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`
      <h2>eBay Login Error</h2>
      <p>${error}</p>
      <p>${error_description || ""}</p>
    `);
  }

  if (!code) {
    return res.status(400).send("Missing authorization code from eBay.");
  }

  try {
    const credentials = Buffer.from(
      `${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`
    ).toString("base64");

    const tokenResponse = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: EBAY_RUNAME
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.log("eBay token error:", tokenData);
      return res.status(400).json(tokenData);
    }

    console.log("eBay token success:", tokenData);

    res.send(`
      <h1>Store Connected Successfully ✅</h1>
      <p>Your eBay account authorized the app.</p>
      <p>Next step: save this token to the database.</p>
    `);
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).send("Server error during eBay OAuth.");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
