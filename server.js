import express from "express";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
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
        <div>
          <h1>Command Center</h1>
          <div class="muted">Live eBay operations, sales, orders, and store management.</div>
        </div>
        <div class="muted">Auto-refreshes every 60 seconds</div>
      </div>

      <div class="grid">
        <div class="card"><div class="metric-label">Total Recent Orders</div><div class="metric-value">${totalRecentOrders}</div></div>
        <div class="card"><div class="metric-label">Awaiting Shipment</div><div class="metric-value">${totalAwaitingShipment}</div></div>
        <div class="card"><div class="metric-label">Today's Sales</div><div class="metric-value">$${todaySales.toFixed(2)}</div></div>
        <div class="card"><div class="metric-label">7 Day Sales</div><div class="metric-value">$${sevenDaySales.toFixed(2)}</div></div>
        <div class="card"><div class="metric-label">30 Day Sales</div><div class="metric-value">$${thirtyDaySales.toFixed(2)}</div></div>
      </div>

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
        const previousOrderCount = Number(localStorage.getItem("previousOrderCount") || 0);

        if ("Notification" in window && Notification.permission !== "granted") {
          Notification.requestPermission();
        }

        if (previousOrderCount > 0 && currentOrderCount > previousOrderCount) {
          const newOrders = currentOrderCount - previousOrderCount;

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("New eBay Order!", {
              body: newOrders + " new order(s) received."
            });
          }

          const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
          audio.play().catch(() => {});
        }

        localStorage.setItem("previousOrderCount", currentOrderCount);
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

    allOrders.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

    let ordersHtml = "";

    allOrders.forEach(order => {
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
      <div class="orders-list">${ordersHtml || "<p>No orders found.</p>"}</div>
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
