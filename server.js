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

app.get("/api/stores", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).send("Database not connected.");
    }

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
    console.error(error);
    res.status(500).send("Failed to fetch stores.");
  }
});

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

app.get("/api/stores", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).send("Database not connected.");
    }

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
    console.error(error);
    res.status(500).send("Failed to fetch stores.");
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const snapshot = await db.collection("ebayStores").get();
    let storeCards = "";
    let totalRecentOrders = 0;
    let totalAwaitingShipment = 0;
    let todaySales = 0;
let sevenDaySales = 0;
let thirtyDaySales = 0; 
    let salesByDay = {};

for (let i = 6; i >= 0; i--) {
  const d = new Date();
  d.setDate(now.getDate() - i);
  const key = d.toISOString().split("T")[0];
  salesByDay[key] = 0;
}

const now = new Date();
const todayStart = new Date(now);
todayStart.setHours(0, 0, 0, 0);

const sevenDaysAgo = new Date(now);
sevenDaysAgo.setDate(now.getDate() - 7);

const thirtyDaysAgo = new Date(now);
thirtyDaysAgo.setDate(now.getDate() - 30);
    
    for (const doc of snapshot.docs) {
      const store = doc.data();
      let orderCount = 0;

      try {
        const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

        const ordersResponse = await fetch(
          "https://api.ebay.com/sell/fulfillment/v1/order?limit=50",
          {
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
  totalAwaitingShipment += ordersData.orders.filter(order =>
    order.orderFulfillmentStatus === "NOT_STARTED"
  ).length;

  ordersData.orders.forEach(order => { 
    
    const orderDate = new Date(order.creationDate);
    const orderTotal = Number(order.pricingSummary?.total?.value || 0); 
    const dayKey = orderDate.toISOString().split("T")[0];

if (salesByDay[dayKey] !== undefined) {
  salesByDay[dayKey] += orderTotal;
}

    if (orderDate >= todayStart) {
      todaySales += orderTotal;
    }

    if (orderDate >= sevenDaysAgo) {
      sevenDaySales += orderTotal;
    }

    if (orderDate >= thirtyDaysAgo) {
      thirtyDaySales += orderTotal;
    }
  });
}
        
      } catch (err) {
        console.error("Order count error:", err);
      }

      storeCards += `
        <div style="border:1px solid #ddd; border-radius:12px; padding:16px; margin-bottom:12px;">
          <h2>${store.username || "Unknown Store"}</h2>
          <p><strong>eBay User ID:</strong> ${store.ebayUserId || "Unknown"}</p>
          <p><strong>Status:</strong> Connected ✅</p>
          <p><strong>Recent Orders:</strong> ${orderCount}</p>
          <p>
            <a href="/orders/${doc.id}">
              <button style="padding:10px 14px; border:none; border-radius:8px; background:#111827; color:white; cursor:pointer;">
                View Orders
              </button>
            </a> 
<a href="/delete-store/${doc.id}">
  <button style="
    padding:10px 14px;
    border:none;
    border-radius:8px;
    background:#dc2626;
    color:white;
    cursor:pointer;
    margin-left:10px;
  ">
    Remove Store
  </button>
</a>
            
          </p>
        </div>
      `;
    }

    res.send(`
      <html>
        <body style="font-family: Arial; padding:20px; background:#f5f5f5;">
          <h1>Connected eBay Stores</h1> 
          <div style="display:flex; gap:16px; margin:20px 0; flex-wrap:wrap;">
  <div style="background:white; padding:18px; border-radius:12px; border:1px solid #ddd; min-width:180px;">
    <h3>Total Recent Orders</h3>
    <p style="font-size:28px; font-weight:bold;">${totalRecentOrders}</p>
  </div>

  <div style="background:white; padding:18px; border-radius:12px; border:1px solid #ddd; min-width:180px;">
    <h3>Awaiting Shipment</h3>
    <p style="font-size:28px; font-weight:bold;">${totalAwaitingShipment}</p>
  </div> 
<div style="background:white; padding:18px; border-radius:12px; border:1px solid #ddd; min-width:180px;">
  <h3>Today's Sales</h3>
  <p style="font-size:28px; font-weight:bold;">$${todaySales.toFixed(2)}</p>
</div>

<div style="background:white; padding:18px; border-radius:12px; border:1px solid #ddd; min-width:180px;">
  <h3>7 Day Sales</h3>
  <p style="font-size:28px; font-weight:bold;">$${sevenDaySales.toFixed(2)}</p>
</div>

<div style="background:white; padding:18px; border-radius:12px; border:1px solid #ddd; min-width:180px;">
  <h3>30 Day Sales</h3>
  <p style="font-size:28px; font-weight:bold;">$${thirtyDaySales.toFixed(2)}</p>
</div>
  
</div>
          <a href="/connect/ebay">
            <button style="padding:12px 18px; border-radius:8px; border:none; background:#2563eb; color:white;">
              Connect Another eBay Store
            </button>
          </a> 
<a href="/all-orders">
  <button style="
    padding:12px 18px;
    border-radius:8px;
    border:none;
    background:#111827;
    color:white;
    margin-left:10px;
    cursor:pointer;
  ">
    View All Orders
  </button>
</a>
          
          <div style="margin-top:20px;">
            ${storeCards || "<p>No stores connected yet.</p>"}
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).send("Failed to load dashboard.");
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

app.get("/api/inventory/:storeId", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).send("Database not connected.");
    }

    const storeDoc = await db.collection("ebayStores").doc(req.params.storeId).get();

    if (!storeDoc.exists) {
      return res.status(404).send("Store not found.");
    }

    const store = storeDoc.data();

    // Refresh the eBay access token first
    const refreshedTokenData = await refreshEbayAccessToken(store.refreshToken);

    // Save the new access token back to Firebase
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
    if (!db) {
      return res.status(500).send("Database not connected.");
    }

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

app.get("/orders/:storeId", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).send("Database not connected.");
    }

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
        ordersHtml += `
          <div style="border:1px solid #ddd; border-radius:12px; padding:16px; margin-bottom:16px; background:white;">
            <h2>Order #${order.orderId}</h2>

            <p><strong>Buyer:</strong> ${order.buyer?.username || "Unknown"}</p>

            <p><strong>Total:</strong>
              ${order.pricingSummary?.total?.value || "0.00"}
              ${order.pricingSummary?.total?.currency || ""}
            </p>

            <p><strong>Status:</strong> ${order.orderFulfillmentStatus}</p>

            <p><strong>Created:</strong> ${order.creationDate}</p>
          </div>
        `;
      });
    }

    res.send(`
      <html>
        <head>
          <title>Orders Dashboard</title>
        </head>
<div style="background:white; padding:18px; border-radius:12px; border:1px solid #ddd; margin:20px 0; max-width:900px;">
  <h2>7-Day Sales Chart</h2>
  ${salesChartHtml}
</div>
        <body style="font-family: Arial; padding:20px; background:#f3f4f6;">
          <h1>${store.username} Orders</h1>

          <a href="/dashboard">
            <button style="padding:10px 16px; margin-bottom:20px;">
              Back to Dashboard
            </button>
          </a>

          ${ordersHtml || "<p>No orders found.</p>"}
        </body>
      </html>
    `);

  } catch (error) {
    console.error("Orders page error:", error);
    res.status(500).send("Failed to load orders.");
  }
});

app.get("/delete-store/:storeId", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).send("Database not connected.");
    }

    await db.collection("ebayStores").doc(req.params.storeId).delete();

    res.redirect("/dashboard");

  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).send("Failed to delete store.");
  }
});

app.get("/all-orders", async (req, res) => {
  try {
    if (!db) return res.send("Database not connected.");

    const snapshot = await db.collection("ebayStores").get();
    let allOrders = [];

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
      const statusColor =
        order.orderFulfillmentStatus === "NOT_STARTED"
          ? "#dc2626"
          : order.orderFulfillmentStatus === "IN_PROGRESS"
          ? "#f59e0b"
          : "#16a34a";

      ordersHtml += `
        <div style="border:1px solid #ddd; border-radius:12px; padding:16px; margin-bottom:16px; background:white;">
          <h2>Order #${order.orderId}</h2>
          <p><strong>Store:</strong> ${order.storeName}</p>
          <p><strong>Buyer:</strong> ${order.buyer?.username || "Unknown"}</p>
          <p><strong>Total:</strong> ${order.pricingSummary?.total?.value || "0.00"} ${order.pricingSummary?.total?.currency || ""}</p>

          <p>
            <strong>Status:</strong>
            <span style="
              background:${statusColor};
              color:white;
              padding:4px 8px;
              border-radius:999px;
              font-size:12px;
              font-weight:bold;
            ">
              ${order.orderFulfillmentStatus}
            </span>
          </p>

          <p><strong>Created:</strong> ${order.creationDate}</p>
        </div>
      `;
    });

const maxSales = Math.max(...Object.values(salesByDay), 1);

let salesChartHtml = "";

Object.entries(salesByDay).forEach(([day, amount]) => {
  const barWidth = (amount / maxSales) * 100;

  salesChartHtml += `
    <div style="margin-bottom:12px;">
      <strong>${day}</strong>
      <div style="background:#e5e7eb; border-radius:999px; overflow:hidden; height:24px; margin-top:4px;">
        <div style="
          width:${barWidth}%;
          background:#2563eb;
          color:white;
          height:24px;
          padding-left:8px;
          line-height:24px;
          font-size:12px;
          font-weight:bold;
        ">
          $${amount.toFixed(2)}
        </div>
      </div>
    </div>
  `;
});
    
    res.send(
      <html>
        <body style="font-family: Arial; padding:20px; background:#f3f4f6;">
          <h1>All eBay Store Orders</h1>

          <a href="/dashboard">
            <button style="padding:10px 16px; margin-bottom:20px;">
              Back to Dashboard
            </button>
          </a>

          ${ordersHtml || "<p>No orders found.</p>"}
        </body>
      </html>
    `);

  } catch (error) {
    console.error("All orders error:", error);
    res.status(500).send("Failed to load all orders.");
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
