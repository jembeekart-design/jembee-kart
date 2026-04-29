🧠 JembeeKart Database Schema (v3.0 – Glass System)

📦 Database: Firebase Firestore

---

👤 USERS COLLECTION

users/{userId}

{
  "name": "MD Alim Ansari",
  "email": "jembeekart@gmail.com",
  "role": "admin | seller | user",
  "avatar": "url",
  "phone": "9999999999",
  "createdAt": "timestamp",
  "isActive": true
}

---

🛍️ PRODUCTS COLLECTION

products/{productId}

{
  "title": "T-Shirt",
  "description": "Premium cotton",
  "price": 499,
  "discount": 10,
  "images": ["url1", "url2"],
  "category": "fashion",
  "stock": 100,
  "sellerId": "userId",
  "affiliateLink": "url",
  "createdAt": "timestamp",
  "isActive": true
}

---

🛒 CART COLLECTION

cart/{userId}

{
  "items": [
    {
      "productId": "id",
      "quantity": 2,
      "price": 499
    }
  ],
  "updatedAt": "timestamp"
}

---

💳 ORDERS COLLECTION

orders/{orderId}

{
  "userId": "id",
  "items": [],
  "total": 999,
  "status": "pending | shipped | delivered",
  "paymentStatus": "paid | unpaid",
  "address": "full address",
  "createdAt": "timestamp"
}

---

🔔 NOTIFICATIONS COLLECTION

notifications/{id}

{
  "userId": "id",
  "title": "Order placed",
  "message": "Your order is confirmed",
  "read": false,
  "createdAt": "timestamp"
}

---

🔗 AFFILIATE SYSTEM

affiliate/{id}

{
  "userId": "id",
  "productId": "id",
  "clicks": 120,
  "earnings": 350,
  "link": "generated_url"
}

---

🎨 THEME SYSTEM (🔥 ADMIN CONTROL)

theme/global

{
  "primary": "#6366f1",
  "secondary": "#0ea5e9",
  "mode": "dark",
  "glass": true,
  "blur": 12,
  "opacity": 0.1,
  "updatedBy": "adminId",
  "updatedAt": "timestamp"
}

---

💎 UI CONFIG (Glass Morphism Engine)

ui/config

{
  "glass": true,
  "blur": "12px",
  "borderRadius": "14px",
  "shadow": "0 8px 32px rgba(0,0,0,0.3)",
  "border": "1px solid rgba(255,255,255,0.2)",
  "themeSync": true
}

---

🧑‍💻 ADMIN PANEL SETTINGS

admin/settings

{
  "siteName": "JembeeKart",
  "maintenanceMode": false,
  "allowRegistration": true,
  "autoApproveSeller": false
}

---

📊 DASHBOARD STATS (Cached)

admin/stats

{
  "totalUsers": 1000000,
  "totalOrders": 500000,
  "revenue": 25000000,
  "updatedAt": "timestamp"
}

---

💬 WHATSAPP LOG

whatsapp/{id}

{
  "phone": "9999999999",
  "message": "Order confirmed",
  "status": "sent",
  "createdAt": "timestamp"
}

---

⚡ PERFORMANCE DESIGN (3M USERS READY)

- Firestore indexing enabled
- Collection sharding (orders, notifications)
- CDN + caching layer
- Lazy loading data
- Edge functions ready

---

🔐 SECURITY RULES (Concept)

match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

match /products/{id} {
  allow read: if true;
  allow write: if request.auth.token.role == "admin";
}

---

🎯 FUTURE EXTENSIONS

- AI recommendations collection
- Search indexing (Algolia)
- Real-time analytics
- Dynamic pricing engine

---

❤️ Vision

Scalable, admin-controlled, glass UI powered ecommerce backend
with real-time theme switching and affiliate ecosystem.

---