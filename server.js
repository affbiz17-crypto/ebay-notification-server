import express from "express";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

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

const baseStyles = `
  <style>
    :root {
      --bg: #070b14;
      --panel: #0f172a;
      --panel-2: #111827;
      --card: #101827;
      --border: rgba(148, 163, 184, 0.22);
      --text: #e5e7eb;
      --muted: #94a3b8;
      --blue: #2563eb;
      --green: #16a34a;
      --red: #dc2626;
      --amber: #f59e0b;
      --purple: #7c3aed;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background:
        radial-gradient(circle at top left, rgba(37,99,235,.2), transparent 30%),
        radial-gradient(circle at top right, rgba(124,58,237,.18), transparent 28%),
        var(--bg);
      color: var(--text);
    }

    a { text-decoration: none; }

    .layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: 100vh;
    }

    .sidebar {
      background: rgba(15, 23, 42, 0.92);
      border-right: 1px solid var(--border);
      padding: 24px;
      position: sticky;
      top: 0;
      height: 100vh;
    }

    .brand {
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: .4px;
    }

    .brand span { color: #60a5fa; }

    .subtitle {
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 28px;
      line-height: 1.4;
    }

    .nav a {
      display: block;
      color: var(--text);
      padding: 12px 14px;
      border-radius: 12px;
      margin-bottom: 10px;
      background: rgba(255,255,255,.035);
      border: 1px solid transparent;
    }

    .nav a:hover {
      border-color: var(--border);
      background: rgba(37,99,235,.14);
    }

    .main {
      padding: 28px;
      max-width: 1300px;
      width: 100%;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 32px;
      letter-spacing: -.5px;
    }

    h2 { margin-top: 0; }

    .muted { color: var(--muted); }

    .grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 22px;
    }

    .card {
      background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.025));
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 18px;
      box-shadow: 0 14px 40px rgba(0,0,0,.28);
    }

    .metric-label {
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 10px;
    }

    .metric-value {
      font-size: 28px;
      font-weight: 800;
      line-height: 1;
    }

    .section {
      margin-top: 22px;
    }

    .button-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin: 20px 0;
    }

    button, .btn {
      display: inline-block;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid transparent;
      color: white;
      cursor: pointer;
      font-weight: 700;
      background: var(--blue);
    }

    .btn-dark { background: #1f2937; }
    .btn-red { background: var(--red); }
    .btn-green { background: var(--green); }
    .btn-purple { background: var(--purple); }

    .store-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .store-card, .order-card {
      background: rgba(15, 23, 42, .82);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 14px 40px rgba(0,0,0,.25);
    }

    .status-pill {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      color: white;
    }

    .chart-row {
      margin-bottom: 14px;
    }

    .chart-label {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 6px;
    }

    .track {
      height: 26px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(148, 163, 184, .18);
      border: 1px solid rgba(148, 163, 184, .16);
    }

    .bar {
      min-width: 46px;
      height: 100%;
      line-height: 26px;
      padding-left: 10px;
      color: white;
      font-size: 12px;
      font-weight: 800;
      background: linear-gradient(90deg, #2563eb, #7c3aed);
    }

    .orders-list {
      display: grid;
      gap: 16px;
      margin-top: 18px;
    }

    .login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: rgba(15, 23, 42, .9);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 20px 60px rgba(0,0,0,.35);
    }

    input {
      width: 100%;
      padding: 14px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,.06);
      color: var(--text);
      margin: 14px 0;
    }

    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { position: static; height: auto; }
      .grid { grid-template-columns: repeat(2, minmax(140px, 1fr)); }
      .topbar { flex-direction: column; }
      .main { padding: 18px; }
    }

    @media (max-width: 520px) {
      .grid { grid-template-columns: 1fr; }
      h1 { font-size: 26px; }
      .button-row a, .button-row .btn { width: 100%; }
      .btn, button { width: 100%; text-align: center; }
    }
  </style>
`;

function shell({ title, key, content, metaRefresh = false }) {
  return `
    <html>
      <head>
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"> 
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#111827">
        ${metaRefresh ? '<meta http-equiv="refresh" content="60">' : ''}
        ${baseStyles}
      </head>
      <body>
        <div class="layout">
          <aside class="sidebar">
            <div class="brand">SixJays <span>Seller</span></div>
            <div class="subtitle">Unified eBay store operations dashboard</div>
            <nav class="nav">
              <a href="/dashboard?key=${key || ''}">Dashboard</a>
              <a href="/all-orders?key=${key || ''}">All Orders</a>
              <a href="/shipping?key=${key || ''}">Shipping Center</a>
              <a href="/packing?key=${key || ''}">Packing Queue</a>
              <a href="/packed-orders?key=${key || ''}">Packed Orders</a> 
              <a href="/profit?key=${key || ''}">Profit Center</a> 
              <a href="/costs?key=${key || ''}">SKU Costs</a>
              <a href="/profit-orders?key=${key || ''}">Profit Orders</a>
              <a href="/connect/ebay">Connect Store</a>
              <a href="/login">Login</a>
            </nav>
          </aside>
          <main class="main">
            ${content}
          </main>
        </div>
           </body>
    </html>
  `;
}

function getStatusColor(status) {
  if (status === "NOT_STARTED") return "#dc2626";
  if (status === "IN_PROGRESS") return "#f59e0b";
  return "#16a34a";
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
    "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
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

    if (db) {
      const storeId = userData.userId || userData.username;

      await db.collection("ebayStores").doc(storeId).set(
        {
          connectedAt: new Date(),
          lastConnectedAt: new Date(),
          ebayUserId: userData.userId || null,
          username: userData.username || null,
          email: userData.email || null,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          accessTokenExpiresIn: data.expires_in,
          refreshTokenExpiresIn: data.refresh_token_expires_in
        },
        { merge: true }
      );
    }

    res.send(`
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          ${baseStyles}
        </head>
        <body>
          <div class="login-wrap">
            <div class="login-card">
              <h1>Store connected ✅</h1>
              <p class="muted">Username: ${userData.username || "Unknown"}</p>
              <p class="muted">eBay User ID: ${userData.userId || "Unknown"}</p>
              <a class="btn" href="/login">Go to Login</a>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).send("Server error during eBay connection.");
  }
});

async function refreshEbayAccessToken(refreshToken) {
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
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: [
        "https://api.ebay.com/oauth/api_scope",
        "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
        "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.account.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
        "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
        "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly"
      ].join(" ")
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

app.get("/login", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${baseStyles}
      </head>
      <body>
        <div class="login-wrap">
          <div class="login-card">
            <h1>Seller Dashboard Login</h1>
            <p class="muted">Enter your admin password to continue.</p>
            <form method="POST" action="/login">
              <input name="password" type="password" placeholder="Admin password">
              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </body>
    </html>
  `);
});

app.post("/login", (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    res.redirect(`/dashboard?key=${process.env.ADMIN_PASSWORD}`);
  } else {
    res.send(`
      <html>
        <head>${baseStyles}</head>
        <body>
          <div class="login-wrap">
            <div class="login-card">
              <h1>Wrong password</h1>
              <a class="btn" href="/login">Try Again</a>
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

function requireLogin(req, res, next) {
  if (req.query.key === process.env.ADMIN_PASSWORD) {
    return next();
  }

  res.redirect("/login");
}

app.get("/api/stores", async (req, res) => {
  try {
    if (!db) return res.status(500).send("Database not connected.");

    const snapshot = await db.collection("ebayStores").get();
    const stores = [];

    snapshot.forEach(doc => {
      const store = doc.data();

      stores.push({
        id: doc.id,
        username: store.username,
        ebayUserId: store.ebayUserId,
        email: store.email,
        connectedAt: store.connectedAt,
        connected: true
      });
    });

    res.json(stores);
  } catch (error) {
    console.error("Stores error:", error);
    res.status(500).send("Failed to fetch stores.");
  }
});

app.get("/dashboard", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const snapshot = await db.collection("ebayStores").get();

    let storeCards = "";
    let totalRecentOrders = 0;
    let totalAwaitingShipment = 0;
    let todaySales = 0;
    let sevenDaySales = 0;
    let thirtyDaySales = 0;

    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const salesByDay = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      salesByDay[key] = 0;
    }

    for (const doc of snapshot.docs) {
      const store = doc.data();
      let orderCount = 0;

      try {
        const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

        await db.collection("ebayStores").doc(doc.id).update({
          accessToken: refreshedTokenData.access_token,
          accessTokenExpiresIn: refreshedTokenData.expires_in,
          lastTokenRefresh: new Date()
        });

        const ordersResponse = await fetch(
          "https://api.ebay.com/sell/fulfillment/v1/order?limit=50",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${refreshedTokenData.access_token}`,
              "Content-Type": "application/json",
              "Accept-Language": "en-US"
            }
          }
        );

        const ordersData = await ordersResponse.json();

        orderCount = ordersData.total || 0;
        totalRecentOrders += orderCount;

        if (ordersData.orders) {
          totalAwaitingShipment += ordersData.orders.filter(
            order => order.orderFulfillmentStatus === "NOT_STARTED"
          ).length;

          ordersData.orders.forEach(order => {
            const orderDate = new Date(order.creationDate);
            const orderTotal = Number(order.pricingSummary?.total?.value || 0);
            const dayKey = orderDate.toISOString().split("T")[0];

            if (salesByDay[dayKey] !== undefined) {
              salesByDay[dayKey] += orderTotal;
            }

            if (orderDate >= todayStart) todaySales += orderTotal;
            if (orderDate >= sevenDaysAgo) sevenDaySales += orderTotal;
            if (orderDate >= thirtyDaysAgo) thirtyDaySales += orderTotal;
          });
        }
      } catch (err) {
        console.error("Dashboard order count error:", err);
      }

      storeCards += `
        <div class="store-card">
          <h2>${store.username || "Unknown Store"}</h2>
          <p class="muted"><strong>eBay User ID:</strong> ${store.ebayUserId || "Unknown"}</p>
          <p><span class="status-pill" style="background:#16a34a;">CONNECTED</span></p>
          <p><strong>Recent Orders:</strong> ${orderCount}</p>
          <div class="button-row">
            <a class="btn btn-dark" href="/orders/${doc.id}?key=${req.query.key}">View Orders</a> 
            <a class="btn btn-purple" href="/inventory/${doc.id}?key=${req.query.key}">Inventory</a>
            <a class="btn btn-red" href="/delete-store/${doc.id}?key=${req.query.key}">Remove</a>
          </div>
        </div>
      `;
    }

    const maxSales = Math.max(...Object.values(salesByDay), 1);
    let salesChartHtml = "";

    Object.entries(salesByDay).forEach(([day, amount]) => {
      const barWidth = (amount / maxSales) * 100;

      salesChartHtml += `
        <div class="chart-row">
          <div class="chart-label"><span>${day}</span><span>$${amount.toFixed(2)}</span></div>
          <div class="track"><div class="bar" style="width:${barWidth}%">$${amount.toFixed(2)}</div></div>
        </div>
      `;
    });

    const content = `
      <div class="topbar"> 
<form method="GET" action="/all-orders" class="card" style="margin-bottom:20px;">
  <input type="hidden" name="key" value="${req.query.key}">

  <label>Search buyer, order #, or store</label>
  <input name="search" value="${req.query.search || ""}" placeholder="Search orders...">

  <label>Status</label>
  <select name="status" style="width:100%; padding:14px; border-radius:14px; margin:14px 0; background:#111827; color:white; border:1px solid rgba(148,163,184,.22);">
    <option value="">All Statuses</option>
    <option value="NOT_STARTED" ${req.query.status === "NOT_STARTED" ? "selected" : ""}>Not Started</option>
    <option value="IN_PROGRESS" ${req.query.status === "IN_PROGRESS" ? "selected" : ""}>In Progress</option>
    <option value="FULFILLED" ${req.query.status === "FULFILLED" ? "selected" : ""}>Fulfilled</option>
  </select>

  <button type="submit">Apply Filters</button>

  <a class="btn btn-dark" href="/all-orders?key=${req.query.key}" style="margin-left:10px;">
    Clear
  </a>
</form>
      
        <div>
          <h1>Command Center</h1>
          <div class="muted">Live eBay operations, sales, orders, and store management.</div>
        </div>
        <div class="muted">Auto-refreshes every 60 seconds</div>
      </div>

      <div class="grid">
  <div class="card"><div class="metric-label">Total Recent Orders</div><div id="totalOrders" class="metric-value">${totalRecentOrders}</div></div>
  <div class="card"><div class="metric-label">Awaiting Shipment</div><div id="awaitingShipment" class="metric-value">${totalAwaitingShipment}</div></div>
  <div class="card"><div class="metric-label">Today's Sales</div><div id="todaySales" class="metric-value">$${todaySales.toFixed(2)}</div></div>
  <div class="card"><div class="metric-label">7 Day Sales</div><div id="sevenDaySales" class="metric-value">$${sevenDaySales.toFixed(2)}</div></div>
  <div class="card"><div class="metric-label">30 Day Sales</div><div id="thirtyDaySales" class="metric-value">$${thirtyDaySales.toFixed(2)}</div></div>
</div>

<p id="lastUpdated" class="muted">Live updates enabled</p>

      <div class="button-row">
        <a class="btn" href="/connect/ebay">Connect Another eBay Store</a>
        <a class="btn btn-dark" href="/all-orders?key=${req.query.key}">View All Orders</a>
      </div>

      <div class="card section">
        <h2>7-Day Sales Chart</h2>
        ${salesChartHtml}
      </div>

      <div class="section">
        <h2>Connected Stores</h2>
        <div class="store-grid">
          ${storeCards || "<p>No stores connected yet.</p>"}
        </div>
      </div>

     <script>
  const currentOrderCount = ${totalRecentOrders};
  ...
  localStorage.setItem("previousOrderCount", currentOrderCount); 
  <script>
async function refreshDashboardStats() {
  try {
    const response = await fetch("/api/dashboard-stats?key=${req.query.key}");
    const stats = await response.json();

    document.getElementById("totalOrders").innerText =
      stats.totalRecentOrders;

    document.getElementById("awaitingShipment").innerText =
      stats.totalAwaitingShipment;

    document.getElementById("todaySales").innerText =
      "$" + stats.todaySales;

    document.getElementById("sevenDaySales").innerText =
      "$" + stats.sevenDaySales;

    document.getElementById("thirtyDaySales").innerText =
      "$" + stats.thirtyDaySales;

    document.getElementById("lastUpdated").innerText =
      "Updated: " + stats.updatedAt;

  } catch (error) {
    console.error("Live refresh error:", error);
  }
}

setInterval(refreshDashboardStats, 30000);
</script>
</script>


`;

    res.send(shell({ title: "eBay Store Dashboard", key: req.query.key, content, metaRefresh: true }));
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).send("Failed to load dashboard.");
  }
});

app.get("/api/inventory/:storeId", async (req, res) => {
  try {
    if (!db) return res.status(500).send("Database not connected.");

    const storeDoc = await db.collection("ebayStores").doc(req.params.storeId).get();

    if (!storeDoc.exists) {
      return res.status(404).send("Store not found.");
    }

    const store = storeDoc.data();
    const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

    await db.collection("ebayStores").doc(req.params.storeId).update({
      accessToken: refreshedTokenData.access_token,
      accessTokenExpiresIn: refreshedTokenData.expires_in,
      lastTokenRefresh: new Date()
    });

    const response = await fetch(
      "https://api.ebay.com/sell/inventory/v1/inventory_item",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshedTokenData.access_token}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US"
        }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Inventory error:", error);
    res.status(500).send("Failed to fetch inventory.");
  }
});

app.get("/api/orders/:storeId", async (req, res) => {
  try {
    if (!db) return res.status(500).send("Database not connected.");

    const storeDoc = await db.collection("ebayStores").doc(req.params.storeId).get();

    if (!storeDoc.exists) {
      return res.status(404).send("Store not found.");
    }

    const store = storeDoc.data();
    const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

    await db.collection("ebayStores").doc(req.params.storeId).update({
      accessToken: refreshedTokenData.access_token,
      accessTokenExpiresIn: refreshedTokenData.expires_in,
      lastTokenRefresh: new Date()
    });

    const response = await fetch(
      "https://api.ebay.com/sell/fulfillment/v1/order?limit=10",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshedTokenData.access_token}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US"
        }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Orders error:", error);
    res.status(500).send("Failed to fetch orders.");
  }
});

app.get("/orders/:storeId", requireLogin, async (req, res) => {
  try {
    if (!db) return res.status(500).send("Database not connected.");

    const storeDoc = await db.collection("ebayStores").doc(req.params.storeId).get();

    if (!storeDoc.exists) {
      return res.status(404).send("Store not found.");
    }

    const store = storeDoc.data();
    const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

    await db.collection("ebayStores").doc(req.params.storeId).update({
      accessToken: refreshedTokenData.access_token,
      accessTokenExpiresIn: refreshedTokenData.expires_in,
      lastTokenRefresh: new Date()
    });

    const response = await fetch(
      "https://api.ebay.com/sell/fulfillment/v1/order?limit=10",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshedTokenData.access_token}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US"
        }
      }
    );

    const data = await response.json();
    let ordersHtml = "";

    if (data.orders && data.orders.length > 0) {
      data.orders.forEach(order => {
        const statusColor = getStatusColor(order.orderFulfillmentStatus);

        ordersHtml += `
          <div class="order-card">
            <h2>Order #${order.orderId}</h2>
            <p class="muted"><strong>Buyer:</strong> ${order.buyer?.username || "Unknown"}</p>
            <p><strong>Total:</strong> ${order.pricingSummary?.total?.value || "0.00"} ${order.pricingSummary?.total?.currency || ""}</p>
            <p><strong>Status:</strong> <span class="status-pill" style="background:${statusColor};">${order.orderFulfillmentStatus}</span></p>
            <p class="muted"><strong>Created:</strong> ${order.creationDate}</p>
          </div>
        `;
      });
    }

    const content = `
      <div class="topbar">
        <div>
          <h1>${store.username || "Store"} Orders</h1>
          <div class="muted">Individual store order feed.</div>
        </div>
        <a class="btn btn-dark" href="/dashboard?key=${req.query.key}">Back to Dashboard</a>
      </div>
      <div class="orders-list">${ordersHtml || "<p>No orders found.</p>"}</div>
    `;

    res.send(shell({ title: "Store Orders", key: req.query.key, content }));
  } catch (error) {
    console.error("Orders page error:", error);
    res.status(500).send("Failed to load orders.");
  }
});

app.get("/delete-store/:storeId", requireLogin, async (req, res) => {
  try {
    if (!db) return res.status(500).send("Database not connected.");

    await db.collection("ebayStores").doc(req.params.storeId).delete();

    res.redirect(`/dashboard?key=${req.query.key}`);
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).send("Failed to delete store.");
  }
});

app.get("/all-orders", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const snapshot = await db.collection("ebayStores").get();
    const allOrders = [];
    const search = (req.query.search || "").toLowerCase();
    const statusFilter = req.query.status || "";
    for (const doc of snapshot.docs) {
      const store = doc.data();
      const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

      await db.collection("ebayStores").doc(doc.id).update({
        accessToken: refreshedTokenData.access_token,
        accessTokenExpiresIn: refreshedTokenData.expires_in,
        lastTokenRefresh: new Date()
      });

      const response = await fetch(
        "https://api.ebay.com/sell/fulfillment/v1/order?limit=10",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${refreshedTokenData.access_token}`,
            "Content-Type": "application/json",
            "Accept-Language": "en-US"
          }
        }
      );

      const data = await response.json();

      if (data.orders) {
        data.orders.forEach(order => {
          allOrders.push({
            storeName: store.username,
            ...order
          });
        });
      }
    }

   let filteredOrders = allOrders;

if (search) {
  filteredOrders = filteredOrders.filter(order =>
    order.orderId?.toLowerCase().includes(search) ||
    order.buyer?.username?.toLowerCase().includes(search) ||
    order.storeName?.toLowerCase().includes(search)
  );
}

if (statusFilter) {
  filteredOrders = filteredOrders.filter(order =>
    order.orderFulfillmentStatus === statusFilter
  );
}

filteredOrders.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

let ordersHtml = "";

   filteredOrders.forEach(order => {
      const statusColor = getStatusColor(order.orderFulfillmentStatus);

      ordersHtml += `
        <div class="order-card">
          <h2>Order #${order.orderId}</h2>
          <p class="muted"><strong>Store:</strong> ${order.storeName || "Unknown Store"}</p>
          <p class="muted"><strong>Buyer:</strong> ${order.buyer?.username || "Unknown"}</p>
          <p><strong>Total:</strong> ${order.pricingSummary?.total?.value || "0.00"} ${order.pricingSummary?.total?.currency || ""}</p>
          <p><strong>Status:</strong> <span class="status-pill" style="background:${statusColor};">${order.orderFulfillmentStatus}</span></p>
          <p class="muted"><strong>Created:</strong> ${order.creationDate}</p>
        </div>
      `;
    });

    const content = `
      <div class="topbar">
        <div>
          <h1>All eBay Store Orders</h1>
          <div class="muted">Unified newest-first order feed across connected stores.</div>
        </div>
        <a class="btn btn-dark" href="/dashboard?key=${req.query.key}">Back to Dashboard</a>
      </div>
     <p class="muted">Showing ${filteredOrders.length} of ${allOrders.length} orders</p>
<div class="orders-list">${ordersHtml || "<p>No matching orders found.</p>"}</div>
    `;

    res.send(shell({ title: "All eBay Store Orders", key: req.query.key, content, metaRefresh: true }));
  } catch (error) {
    console.error("All orders error:", error);
    res.status(500).send("Failed to load all orders.");
  }
}); 

app.get("/inventory/:storeId", requireLogin, async (req, res) => {
  try {
    if (!db) return res.status(500).send("Database not connected.");

    const storeDoc = await db.collection("ebayStores").doc(req.params.storeId).get();

    if (!storeDoc.exists) {
      return res.status(404).send("Store not found.");
    }

    const store = storeDoc.data();
    const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

    await db.collection("ebayStores").doc(req.params.storeId).update({
      accessToken: refreshedTokenData.access_token,
      accessTokenExpiresIn: refreshedTokenData.expires_in,
      lastTokenRefresh: new Date()
    });

    const response = await fetch(
      "https://api.ebay.com/sell/inventory/v1/inventory_item?limit=50",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshedTokenData.access_token}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US"
        }
      }
    );

    const data = await response.json();

    let inventoryHtml = "";

    if (data.inventoryItems && data.inventoryItems.length > 0) {
      data.inventoryItems.forEach(item => {
        inventoryHtml += `
          <div class="order-card">
            <h2>${item.sku || "No SKU"}</h2>
            <p class="muted"><strong>Condition:</strong> ${item.condition || "Unknown"}</p>
            <p><strong>Quantity:</strong> ${item.availability?.shipToLocationAvailability?.quantity ?? "Unknown"}</p>
          </div>
        `;
      });
    }

    const content = `
      <div class="topbar">
        <div>
          <h1>${store.username || "Store"} Inventory</h1>
          <div class="muted">Inventory items pulled from eBay Inventory API.</div>
        </div>
        <a class="btn btn-dark" href="/dashboard?key=${req.query.key}">Back to Dashboard</a>
      </div>

      <div class="card">
        <div class="metric-label">Inventory Items</div>
        <div class="metric-value">${data.total || 0}</div>
      </div>

      <div class="orders-list">
        ${inventoryHtml || "<p>No inventory items found through this API.</p>"}
      </div>
    `;

    res.send(shell({ title: "Inventory Center", key: req.query.key, content }));
  } catch (error) {
    console.error("Inventory page error:", error);
    res.status(500).send("Failed to load inventory.");
  }
});

app.get("/shipping", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const snapshot = await db.collection("ebayStores").get();
    const shippingOrders = [];

    for (const doc of snapshot.docs) {
      const store = doc.data();
      const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

      await db.collection("ebayStores").doc(doc.id).update({
        accessToken: refreshedTokenData.access_token,
        accessTokenExpiresIn: refreshedTokenData.expires_in,
        lastTokenRefresh: new Date()
      });

      const response = await fetch(
        "https://api.ebay.com/sell/fulfillment/v1/order?limit=50",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${refreshedTokenData.access_token}`,
            "Content-Type": "application/json",
            "Accept-Language": "en-US"
          }
        }
      );

      const data = await response.json();

      if (data.orders) {
        data.orders
          .filter(order => order.orderFulfillmentStatus !== "FULFILLED")
          .forEach(order => {
           shippingOrders.push({
  storeId: doc.id,
  storeName: store.username,
  ...order
});
          });
      }
    }

    shippingOrders.sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));

    let shippingHtml = "";

    shippingOrders.forEach(order => {
      const statusColor = getStatusColor(order.orderFulfillmentStatus);

      shippingHtml += `
        <div class="order-card">
          <h2>Order #${order.orderId}</h2>
          <p class="muted"><strong>Store:</strong> ${order.storeName || "Unknown Store"}</p>
          <p class="muted"><strong>Buyer:</strong> ${order.buyer?.username || "Unknown"}</p>
          <p><strong>Total:</strong> ${order.pricingSummary?.total?.value || "0.00"} ${order.pricingSummary?.total?.currency || ""}</p>
          <p><strong>Status:</strong> <span class="status-pill" style="background:${statusColor};">${order.orderFulfillmentStatus}</span></p> 
          <a class="btn btn-green" href="/ship/${order.storeId}/${order.orderId}?key=${req.query.key}">
  Add Tracking
</a>
          <p class="muted"><strong>Created:</strong> ${order.creationDate}</p>
        </div>
      `;
    });

    const content = `
      <div class="topbar">
        <div>
          <h1>Shipping Center</h1>
          <div class="muted">Orders that still need fulfillment across all connected stores.</div>
        </div>
        <a class="btn btn-dark" href="/dashboard?key=${req.query.key}">Back to Dashboard</a>
      </div>

      <div class="grid">
        <div class="card">
          <div class="metric-label">Orders Needing Shipment</div>
          <div class="metric-value">${shippingOrders.length}</div>
        </div>
      </div>

      <div class="orders-list">
        ${shippingHtml || "<p>No orders currently need shipment.</p>"}
      </div>
    `;

    res.send(shell({ title: "Shipping Center", key: req.query.key, content, metaRefresh: true }));
  } catch (error) {
    console.error("Shipping center error:", error);
    res.status(500).send("Failed to load shipping center.");
  }
});

app.get("/ship/:storeId/:orderId", requireLogin, async (req, res) => {
  const content = `
    <div class="topbar">
      <div>
        <h1>Mark Order Shipped</h1>
        <div class="muted">Order #${req.params.orderId}</div>
      </div>
      <a class="btn btn-dark" href="/shipping?key=${req.query.key}">Back to Shipping</a>
    </div>

    <div class="card" style="max-width:600px;">
      <form method="POST" action="/ship/${req.params.storeId}/${req.params.orderId}?key=${req.query.key}">
        <label>Carrier</label>
        <input name="carrier" placeholder="USPS, UPS, FedEx" required>

        <label>Tracking Number</label>
        <input name="trackingNumber" placeholder="Enter tracking number" required>

        <button type="submit">Submit Tracking to eBay</button>
      </form>
    </div>
  `;

  res.send(shell({ title: "Mark Shipped", key: req.query.key, content }));
}); 
app.post("/ship/:storeId/:orderId", requireLogin, async (req, res) => {
  try {
    if (!db) return res.status(500).send("Database not connected.");

const { carrier, trackingNumber } = req.body;

    const storeDoc = await db.collection("ebayStores").doc(req.params.storeId).get();

    if (!storeDoc.exists) {
      return res.status(404).send("Store not found.");
    }

    const store = storeDoc.data();
    const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

    const response = await fetch(
      `https://api.ebay.com/sell/fulfillment/v1/order/${req.params.orderId}/shipping_fulfillment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshedTokenData.access_token}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US"
        },
        body: JSON.stringify({
          trackingNumber,
          shippingCarrierCode: carrier
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Ship error:", errorData);
      return res.status(400).json(errorData);
    }

    res.send(`
      <html>
        <head>${baseStyles}</head>
        <body>
          <div class="login-wrap">
            <div class="login-card">
              <h1>Tracking Submitted ✅</h1>
              <p class="muted">Order #${req.params.orderId}</p>
              <a class="btn" href="/shipping?key=${req.query.key}">Back to Shipping Center</a>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Submit tracking error:", error);
    res.status(500).send("Failed to submit tracking.");
  }
});

app.get("/packing", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const snapshot = await db.collection("ebayStores").get();
    const packingOrders = [];

    for (const doc of snapshot.docs) {
      const store = doc.data();
      const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

      const response = await fetch(
        "https://api.ebay.com/sell/fulfillment/v1/order?limit=50",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${refreshedTokenData.access_token}`,
            "Content-Type": "application/json",
            "Accept-Language": "en-US"
          }
        }
      );

      const data = await response.json();

      if (data.orders) {
        data.orders
          .filter(order => order.orderFulfillmentStatus !== "FULFILLED")
          .forEach(order => {
            packingOrders.push({
              storeId: doc.id,
              storeName: store.username,
              ...order
            });
          });
      }
    }

    let packingHtml = `
  <form method="POST" action="/bulk-packing-slips?key=${req.query.key}">
    <button class="btn btn-purple" type="submit">
      Print Selected Packing Slips
    </button>
`;

    for (const order of packingOrders) {
      const packDoc = await db.collection("packingQueue").doc(order.orderId).get();
      const packStatus = packDoc.exists ? packDoc.data().status : "Ready to Pack";

      packingHtml += `
        <div class="order-card">
          <h2>Order #${order.orderId}</h2> 

          <label>
  <input type="checkbox" name="orders" value="${order.storeId}|${order.orderId}" style="width:auto; margin-right:8px;">
  Select for bulk print
</label>
          <p class="muted"><strong>Store:</strong> ${order.storeName || "Unknown Store"}</p>
          <p class="muted"><strong>Buyer:</strong> ${order.buyer?.username || "Unknown"}</p>
          <p><strong>Total:</strong> ${order.pricingSummary?.total?.value || "0.00"} ${order.pricingSummary?.total?.currency || ""}</p>
          <p><strong>Packing Status:</strong> <span class="status-pill" style="background:#7c3aed;">${packStatus}</span></p>

          <a class="btn btn-green" href="/mark-packed/${order.orderId}?key=${req.query.key}">
            Mark Packed
          </a>
          <a class="btn btn-purple" href="/packing-slip/${order.storeId}/${order.orderId}?key=${req.query.key}">
          Packing Slip
          </a>
          <a class="btn btn-dark" href="/ship/${order.storeId}/${order.orderId}?key=${req.query.key}">
            Add Tracking
          </a>
        </div>
      `;
    }
packingHtml += `</form>`;
    const content = `
      <div class="topbar">
        <div>
          <h1>Packing Queue</h1>
          <div class="muted">Internal workflow before uploading tracking to eBay.</div>
        </div>
        
        <a class="btn btn-dark" href="/dashboard?key=${req.query.key}">Back to Dashboard</a> 
        <a class="btn btn-purple" href="/packed-orders?key=${req.query.key}">
  View Packed Orders
</a>
      </div>

      <div class="grid">
        <div class="card">
          <div class="metric-label">Orders in Packing Queue</div>
          <div class="metric-value">${packingOrders.length}</div>
        </div>
      </div>

      <div class="orders-list">
        ${packingHtml || "<p>No orders currently need packing.</p>"}
      </div>
    `;

    res.send(shell({ title: "Packing Queue", key: req.query.key, content, metaRefresh: true }));
  } catch (error) {
    console.error("Packing queue error:", error);
    res.status(500).send("Failed to load packing queue.");
  }
});

app.get("/mark-packed/:orderId", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    await db.collection("packingQueue").doc(req.params.orderId).set(
      {
        orderId: req.params.orderId,
        status: "Packed",
        packedAt: new Date()
      },
      { merge: true }
    );

    res.redirect(`/packing?key=${req.query.key}`);
  } catch (error) {
    console.error("Mark packed error:", error);
    res.status(500).send("Failed to mark packed.");
  }
});

app.get("/packed-orders", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const snapshot = await db.collection("packingQueue")
      .where("status", "==", "Packed")
      .get();

    let packedHtml = "";

    snapshot.forEach(doc => {
      const packed = doc.data();

      packedHtml += `
        <div class="order-card">
          <h2>Order #${packed.orderId}</h2>
          <p><strong>Status:</strong> <span class="status-pill" style="background:#16a34a;">Packed</span></p>
          <p class="muted"><strong>Packed At:</strong> ${packed.packedAt?.toDate ? packed.packedAt.toDate().toLocaleString() : "Unknown"}</p>
        </div>
      `;
    });

    const content = `
      <div class="topbar">
        <div>
          <h1>Packed Orders</h1>
          <div class="muted">Orders packed and waiting for tracking upload.</div>
        </div>
        <a class="btn btn-dark" href="/packing?key=${req.query.key}">Back to Packing Queue</a>
      </div>

      <div class="grid">
        <div class="card">
          <div class="metric-label">Packed Orders</div>
          <div class="metric-value">${snapshot.size}</div>
        </div>
      </div>

      <div class="orders-list">
        ${packedHtml || "<p>No packed orders yet.</p>"}
      </div>
    `;

    res.send(shell({ title: "Packed Orders", key: req.query.key, content }));
  } catch (error) {
    console.error("Packed orders error:", error);
    res.status(500).send("Failed to load packed orders.");
  }
});

app.get("/packing-slip/:storeId/:orderId", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const storeDoc = await db.collection("ebayStores").doc(req.params.storeId).get();

    if (!storeDoc.exists) {
      return res.status(404).send("Store not found.");
    }

    const store = storeDoc.data();
    const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

    const response = await fetch(
      `https://api.ebay.com/sell/fulfillment/v1/order/${req.params.orderId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshedTokenData.access_token}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US"
        }
      }
    );

    const order = await response.json();

    if (!response.ok) {
      return res.status(400).json(order);
    }

    let itemsHtml = "";

    if (order.lineItems) {
      order.lineItems.forEach(item => {
        itemsHtml += `
          <tr>
            <td>${item.title || "Unknown Item"}</td>
            <td>${item.sku || "No SKU"}</td>
            <td>${item.quantity || 1}</td>
            <td>${item.total?.value || "0.00"} ${item.total?.currency || ""}</td>
          </tr>
        `;
      });
    }

    const shipTo = order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo || {};

    res.send(`
      <html>
        <head>
          <title>Packing Slip</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #111;
              background: white;
            }

            .top {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }

            h1 {
              margin: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #f3f4f6;
            }

            .print-btn {
              padding: 12px 18px;
              border: none;
              background: #111827;
              color: white;
              border-radius: 8px;
              cursor: pointer;
            }

            @media print {
              .no-print {
                display: none;
              }

              body {
                padding: 0;
              }
            }
          </style>
        </head>

        <body>
          <div class="top">
            <div>
              <h1>Packing Slip</h1>
              <p><strong>Store:</strong> ${store.username || "Unknown Store"}</p>
              <p><strong>Order:</strong> ${order.orderId}</p>
              <p><strong>Created:</strong> ${order.creationDate}</p>
            </div>

            <div class="no-print">
              <button class="print-btn" onclick="window.print()">Print Packing Slip</button>
              <br><br>
              <a href="/packing?key=${req.query.key}">Back to Packing Queue</a>
            </div>
          </div>

          <hr>

          <h2>Ship To</h2>
          <p>
            ${shipTo.fullName || ""}<br>
            ${shipTo.contactAddress?.addressLine1 || ""}<br>
            ${shipTo.contactAddress?.addressLine2 || ""}<br>
            ${shipTo.contactAddress?.city || ""}, 
            ${shipTo.contactAddress?.stateOrProvince || ""} 
            ${shipTo.contactAddress?.postalCode || ""}<br>
            ${shipTo.contactAddress?.countryCode || ""}
          </p>

          <h2>Items</h2>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              ${itemsHtml || "<tr><td colspan='4'>No line items found.</td></tr>"}
            </tbody>
          </table>

          <h2>Total</h2>
          <p>
            <strong>
              ${order.pricingSummary?.total?.value || "0.00"}
              ${order.pricingSummary?.total?.currency || ""}
            </strong>
          </p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Packing slip error:", error);
    res.status(500).send("Failed to load packing slip.");
  }
});

app.post("/bulk-packing-slips", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    let selectedOrders = req.body.orders || [];

    if (!Array.isArray(selectedOrders)) {
      selectedOrders = [selectedOrders];
    }

    if (selectedOrders.length === 0) {
      return res.send("No orders selected.");
    }

    let slipsHtml = "";

    for (const value of selectedOrders) {
      const [storeId, orderId] = value.split("|");

      const storeDoc = await db.collection("ebayStores").doc(storeId).get();

      if (!storeDoc.exists) continue;

      const store = storeDoc.data();
      const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

      const response = await fetch(
        `https://api.ebay.com/sell/fulfillment/v1/order/${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${refreshedTokenData.access_token}`,
            "Content-Type": "application/json",
            "Accept-Language": "en-US"
          }
        }
      );

      const order = await response.json();

      if (!response.ok) continue;

      const shipTo = order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo || {};

      let itemsHtml = "";

      if (order.lineItems) {
        order.lineItems.forEach(item => {
          itemsHtml += `
            <tr>
              <td>${item.title || "Unknown Item"}</td>
              <td>${item.sku || "No SKU"}</td>
              <td>${item.quantity || 1}</td>
              <td>${item.total?.value || "0.00"} ${item.total?.currency || ""}</td>
            </tr>
          `;
        });
      }

      slipsHtml += `
        <section class="slip">
          <div class="top">
            <div>
              <h1>Packing Slip</h1>
              <p><strong>Store:</strong> ${store.username || "Unknown Store"}</p>
              <p><strong>Order:</strong> ${order.orderId}</p>
              <p><strong>Created:</strong> ${order.creationDate}</p>
            </div>
          </div>

          <hr>

          <h2>Ship To</h2>
          <p>
            ${shipTo.fullName || ""}<br>
            ${shipTo.contactAddress?.addressLine1 || ""}<br>
            ${shipTo.contactAddress?.addressLine2 || ""}<br>
            ${shipTo.contactAddress?.city || ""}, 
            ${shipTo.contactAddress?.stateOrProvince || ""} 
            ${shipTo.contactAddress?.postalCode || ""}<br>
            ${shipTo.contactAddress?.countryCode || ""}
          </p>

          <h2>Items</h2>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || "<tr><td colspan='4'>No line items found.</td></tr>"}
            </tbody>
          </table>

          <h2>Total</h2>
          <p><strong>${order.pricingSummary?.total?.value || "0.00"} ${order.pricingSummary?.total?.currency || ""}</strong></p>
        </section>
      `;
    }

    res.send(`
      <html>
        <head>
          <title>Bulk Packing Slips</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #111;
              background: white;
              padding: 30px;
            }

            .no-print {
              margin-bottom: 30px;
            }

            button {
              padding: 12px 18px;
              border: none;
              background: #111827;
              color: white;
              border-radius: 8px;
              cursor: pointer;
            }

            .slip {
              page-break-after: always;
              margin-bottom: 40px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #f3f4f6;
            }

            @media print {
              .no-print {
                display: none;
              }

              body {
                padding: 0;
              }
            }
          </style>
        </head>

        <body>
          <div class="no-print">
            <button onclick="window.print()">Print All Packing Slips</button>
            <a href="/packing?key=${req.query.key}" style="margin-left:20px;">Back to Packing Queue</a>
          </div>

          ${slipsHtml}
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Bulk packing slips error:", error);
    res.status(500).send("Failed to generate bulk packing slips.");
  }
});

app.get("/api/dashboard-stats", requireLogin, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected." });

    const snapshot = await db.collection("ebayStores").get();

    let totalRecentOrders = 0;
    let totalAwaitingShipment = 0;
    let todaySales = 0;
    let sevenDaySales = 0;
    let thirtyDaySales = 0;

    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    for (const doc of snapshot.docs) {
      const store = doc.data();

      const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

      const ordersResponse = await fetch(
        "https://api.ebay.com/sell/fulfillment/v1/order?limit=50",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${refreshedTokenData.access_token}`,
            "Content-Type": "application/json",
            "Accept-Language": "en-US"
          }
        }
      );

      const ordersData = await ordersResponse.json();

      totalRecentOrders += ordersData.total || 0;

      if (ordersData.orders) {
        totalAwaitingShipment += ordersData.orders.filter(
          order => order.orderFulfillmentStatus === "NOT_STARTED"
        ).length;

        ordersData.orders.forEach(order => {
          const orderDate = new Date(order.creationDate);
          const orderTotal = Number(order.pricingSummary?.total?.value || 0);

          if (orderDate >= todayStart) todaySales += orderTotal;
          if (orderDate >= sevenDaysAgo) sevenDaySales += orderTotal;
          if (orderDate >= thirtyDaysAgo) thirtyDaySales += orderTotal;
        });
      }
    }

    res.json({
      totalRecentOrders,
      totalAwaitingShipment,
      todaySales: todaySales.toFixed(2),
      sevenDaySales: sevenDaySales.toFixed(2),
      thirtyDaySales: thirtyDaySales.toFixed(2),
      updatedAt: new Date().toLocaleTimeString()
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to load dashboard stats." });
  }
});

app.get("/profit", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const feeRate = Number(req.query.feeRate || 13.25) / 100;
    const shippingPerOrder = Number(req.query.shipping || 8);

    const snapshot = await db.collection("ebayStores").get();

    let totalOrders = 0;
    let grossSales = 0;

    for (const doc of snapshot.docs) {
      const store = doc.data();
      const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

      const response = await fetch(
        "https://api.ebay.com/sell/fulfillment/v1/order?limit=50",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${refreshedTokenData.access_token}`,
            "Content-Type": "application/json",
            "Accept-Language": "en-US"
          }
        }
      );

      const data = await response.json();

      if (data.orders) {
        data.orders.forEach(order => {
          totalOrders += 1;
          grossSales += Number(order.pricingSummary?.total?.value || 0);
        });
      }
    }

    const estimatedFees = grossSales * feeRate;
    const estimatedShipping = totalOrders * shippingPerOrder;
    const estimatedNetProfit = grossSales - estimatedFees - estimatedShipping;
    const profitMargin =
      grossSales > 0 ? (estimatedNetProfit / grossSales) * 100 : 0;

    const content = `
      <div class="topbar">
        <div>
          <h1>Profit Center</h1>
          <div class="muted">Estimated profit using fee and shipping assumptions.</div>
        </div>
        <a class="btn btn-dark" href="/dashboard?key=${req.query.key}">Back to Dashboard</a>
      </div>

      <form method="GET" action="/profit" class="card" style="margin-bottom:20px;">
        <input type="hidden" name="key" value="${req.query.key}">

        <label>Estimated eBay Fee %</label>
        <input name="feeRate" value="${req.query.feeRate || 13.25}" placeholder="13.25">

        <label>Estimated Shipping Cost Per Order</label>
        <input name="shipping" value="${req.query.shipping || 8}" placeholder="8">

        <button type="submit">Recalculate</button>
      </form>

      <div class="grid">
        <div class="card">
          <div class="metric-label">Orders Analyzed</div>
          <div class="metric-value">${totalOrders}</div>
        </div>

        <div class="card">
          <div class="metric-label">Gross Sales</div>
          <div class="metric-value">$${grossSales.toFixed(2)}</div>
        </div>

        <div class="card">
          <div class="metric-label">Estimated Fees</div>
          <div class="metric-value">$${estimatedFees.toFixed(2)}</div>
        </div>

        <div class="card">
          <div class="metric-label">Estimated Shipping</div>
          <div class="metric-value">$${estimatedShipping.toFixed(2)}</div>
        </div>

        <div class="card">
          <div class="metric-label">Estimated Net</div>
          <div class="metric-value">$${estimatedNetProfit.toFixed(2)}</div>
        </div>
      </div>

      <div class="card section">
        <h2>Profit Margin</h2>
        <div class="metric-value">${profitMargin.toFixed(1)}%</div>
        <p class="muted">
          Formula: Gross Sales - Estimated Fees - Estimated Shipping.
          Product cost tracking can be added next by SKU.
        </p>
      </div>
    `;

    res.send(shell({ title: "Profit Center", key: req.query.key, content }));
  } catch (error) {
    console.error("Profit center error:", error);
    res.status(500).send("Failed to load profit center.");
  }
});

app.get("/costs", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const snapshot = await db.collection("productCosts").orderBy("sku").get();

    let rowsHtml = "";

    snapshot.forEach(doc => {
      const item = doc.data();

      rowsHtml += `
        <tr>
          <td>${item.sku || ""}</td>
          <td>$${Number(item.productCost || 0).toFixed(2)}</td>
          <td>$${Number(item.shippingCost || 0).toFixed(2)}</td>
<td>${item.matchType || "sku"}</td>
<td>${item.supplier || ""}</td>
          <td>${item.notes || ""}</td>
        </tr>
      `;
    });

    const content = `
      <div class="topbar">
        <div>
          <h1>SKU Cost Database</h1>
          <div class="muted">Track product cost, shipping cost, supplier, and notes by SKU.</div>
        </div>
        <a class="btn btn-dark" href="/profit?key=${req.query.key}">Back to Profit Center</a>
      </div>

      <form method="POST" action="/costs?key=${req.query.key}" class="card" style="margin-bottom:20px;">
        <label>SKU</label>
        <input name="sku" placeholder="Example: ABC-123" required>

        <label>Product Cost</label>
        <input name="productCost" type="number" step="0.01" placeholder="25.00">

        <label>Shipping Cost</label>
        <input name="shippingCost" type="number" step="0.01" placeholder="8.00">

<label>Match Type</label>

<select name="matchType" style="
  width:100%;
  padding:14px;
  border-radius:14px;
  margin:14px 0;
  background:#111827;
  color:white;
  border:1px solid rgba(148,163,184,.22);
">
  <option value="sku">SKU Match</option>
  <option value="title">Title Match</option>
</select>

        <label>Supplier</label>
        <input name="supplier" placeholder="Motor State, Summit, etc.">

        <label>Notes</label>
        <input name="notes" placeholder="Optional notes">

        <button type="submit">Save SKU Cost</button>
      </form>

      <div class="card">
        <h2>Saved SKU Costs</h2>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left; padding:10px; border-bottom:1px solid rgba(148,163,184,.22);">SKU</th>
                <th style="text-align:left; padding:10px; border-bottom:1px solid rgba(148,163,184,.22);">Product Cost</th>
                <th style="text-align:left; padding:10px; border-bottom:1px solid rgba(148,163,184,.22);">Shipping Cost</th>
                  <th style="text-align:left; padding:10px; border-bottom:1px solid rgba(148,163,184,.22);">Match Type</th>
                <th style="text-align:left; padding:10px; border-bottom:1px solid rgba(148,163,184,.22);">Supplier</th>
                <th style="text-align:left; padding:10px; border-bottom:1px solid rgba(148,163,184,.22);">Notes</th>
              </tr>
            </thead>

            <tbody>
              ${rowsHtml || "<tr><td colspan='6' style='padding:10px;'>No SKU costs saved yet.</td></tr>"}
            </tbody>
          </table>
        </div>
      </div>
    `;

    res.send(shell({ title: "SKU Cost Database", key: req.query.key, content }));
  } catch (error) {
    console.error("Costs page error:", error);
    res.status(500).send("Failed to load costs page.");
  }
}); 

app.post("/costs", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const {
      sku,
      productCost,
      shippingCost,
      supplier,
      notes,
      matchType
    } = req.body;

    const cleanSku = sku.trim().toUpperCase();

    await db.collection("productCosts").doc(cleanSku).set(
      {
        sku: cleanSku,
        productCost: Number(productCost || 0),
        shippingCost: Number(shippingCost || 0),
        matchType: matchType || "sku",
        supplier: supplier || "",
        notes: notes || "",
        updatedAt: new Date()
      },
      { merge: true }
    );

    res.redirect(`/costs?key=${req.query.key}`);
  } catch (error) {
    console.error("Save cost error:", error);
    res.status(500).send("Failed to save SKU cost.");
  }
}); 

app.get("/profit-orders", requireLogin, async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const feeRate = 0.1325;

    const snapshot = await db.collection("ebayStores").get();

    let profitCards = [];
    let totalNetProfit = 0;

    for (const doc of snapshot.docs) {
      const store = doc.data();

      const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

      const response = await fetch(
        "https://api.ebay.com/sell/fulfillment/v1/order?limit=25",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${refreshedTokenData.access_token}`,
            "Content-Type": "application/json",
            "Accept-Language": "en-US"
          }
        }
      );

      const data = await response.json();

      if (!data.orders) continue;

      for (const order of data.orders) {
        const saleAmount = Number(
          order.pricingSummary?.total?.value || 0
        );

        const ebayFee = saleAmount * feeRate;

        let productCost = 0;
        let shippingCost = 0;
        let matchedBy = "No Match";

        if (order.lineItems) {
          for (const item of order.lineItems) {
            const sku = item.sku?.trim().toUpperCase();
            const title = item.title?.trim().toUpperCase();

            let costDoc = null;

            if (sku) {
              const skuDoc = await db
                .collection("productCosts")
                .doc(sku)
                .get();

              if (skuDoc.exists) {
                costDoc = skuDoc.data();
                matchedBy = "SKU";
              }
            }

            if (!costDoc && title) {
              const titleSnapshot = await db
                .collection("productCosts")
                .where("matchType", "==", "title")
                .get();

              titleSnapshot.forEach(doc => {
                const data = doc.data();

                if (
                  title.includes(data.sku?.toUpperCase())
                ) {
                  costDoc = data;
                  matchedBy = "Title";
                }
              });
            }

            if (costDoc) {
              productCost += Number(costDoc.productCost || 0);
              shippingCost += Number(costDoc.shippingCost || 0);
            }
          }
        }

        const netProfit =
          saleAmount - ebayFee - productCost - shippingCost;

        totalNetProfit += netProfit;

        const margin =
          saleAmount > 0
            ? ((netProfit / saleAmount) * 100).toFixed(1)
            : "0";

        const marginColor =
          netProfit > 0
            ? "#16a34a"
            : "#dc2626";

        profitCards.push(`
          <div class="card section">
            <div class="topbar">
              <div>
                <h2>Order #${order.orderId}</h2>
                <div class="muted">
                  ${store.username || "Unknown Store"}
                </div>
              </div>

              <div style="
                background:${marginColor};
                color:white;
                padding:10px 14px;
                border-radius:999px;
                font-weight:bold;
              ">
                ${margin}%
              </div>
            </div>

            <p><strong>Buyer:</strong>
              ${order.buyer?.username || "Unknown"}
            </p>

            <p><strong>Sale Amount:</strong>
              $${saleAmount.toFixed(2)}
            </p>

            <p><strong>Estimated eBay Fee:</strong>
              $${ebayFee.toFixed(2)}
            </p>

            <p><strong>Product Cost:</strong>
              $${productCost.toFixed(2)}
            </p>

            <p><strong>Shipping Cost:</strong>
              $${shippingCost.toFixed(2)}
            </p>

            <p><strong>Net Profit:</strong>
              <span style="color:${marginColor}; font-weight:bold;">
                $${netProfit.toFixed(2)}
              </span>
            </p>

            <p><strong>Matched By:</strong>
              ${matchedBy}
            </p>
          </div>
        `);
      }
    }

    profitCards.sort((a, b) => b.netProfit - a.netProfit);

    const content = `
      <div class="topbar">
        <div>
          <h1>Profit Orders</h1>
          <div class="muted">
            Real estimated profit by order.
          </div>
        </div>

        <a class="btn btn-dark"
           href="/dashboard?key=${req.query.key}">
           Back to Dashboard
        </a>
      </div>

      <div class="grid">
        <div class="card">
          <div class="metric-label">Estimated Total Net Profit</div>
          <div class="metric-value">
            $${totalNetProfit.toFixed(2)}
          </div>
        </div>

        <div class="card">
          <div class="metric-label">Orders Analyzed</div>
          <div class="metric-value">
            ${profitCards.length}
          </div>
        </div>
      </div>

      <div class="orders-list">
        ${profitCards.join("") || "<p>No orders found.</p>"}
      </div>
    `;

    res.send(
      shell({
        title: "Profit Orders",
        key: req.query.key,
        content
      })
    );

  } catch (error) {
    console.error("Profit orders error:", error);
    res.status(500).send("Failed to load profit orders.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
