import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("eBay notification server is running ✅");
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("eBay notification server is running");
});

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
    `?client_id=${encodeURIComponent(process.env.EBAY_CLIENT_ID)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(process.env.EBAY_RUNAME)}` +
    `&scope=${encodeURIComponent(scopes)}`;

  res.redirect(authUrl);
});

app.get("/auth/ebay/callback", (req, res) => {
  res.send("Store Connected Successfully ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
