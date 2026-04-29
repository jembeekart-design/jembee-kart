🚀 JembeeKart API Documentation

🌐 Base URL

https://api.jembeekart.com/v1

---

🔐 Authentication

Login

POST /auth/login

Body

{
  "email": "user@gmail.com",
  "password": "123456"
}

Response

{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "role": "admin | seller | user"
  }
}

---

👤 User API

Get Profile

GET /user/profile
Authorization: Bearer TOKEN

Update Profile

PUT /user/update

---

🛍️ Product API

Get Products

GET /products

Add Product (Admin/Seller)

POST /products

Delete Product

DELETE /products/:id

---

🛒 Cart API

Add to Cart

POST /cart/add

Get Cart

GET /cart

---

💳 Order API

Create Order

POST /orders

Get Orders

GET /orders

---

🎨 Theme System API (🔥 Main Feature)

Get Current Theme

GET /theme

Response

{
  "primary": "#6366f1",
  "background": "glass",
  "blur": 12,
  "opacity": 0.1
}

---

Update Theme (Admin Only)

PUT /admin/theme

Body

{
  "primary": "#0ea5e9",
  "glassBlur": 16,
  "glassOpacity": 0.15,
  "mode": "dark"
}

👉 Changes reflect real-time in UI

---

💎 Glass Morphism UI System

UI Config API

GET /ui/config

Response

{
  "glass": true,
  "blur": "12px",
  "borderRadius": "14px",
  "shadow": "0 8px 32px rgba(0,0,0,0.3)"
}

---

Dynamic UI Update

PUT /admin/ui

---

🔔 Notification API

GET /notifications
POST /notifications/send

---

💬 WhatsApp Integration API

POST /whatsapp/send

---

🔗 Affiliate System API

POST /affiliate/generate-link
GET /affiliate/stats

---

⚡ Performance (3M Users Ready)

- CDN Enabled
- Serverless APIs
- Edge Functions
- Lazy Loading
- Cache Layer (Redis)

---

🔐 Security

- JWT Authentication
- Rate Limiting
- Firebase Rules
- Admin Protected Routes

---

📊 Admin Panel APIs

Dashboard Stats

GET /admin/dashboard

Users Management

GET /admin/users
DELETE /admin/user/:id

---

🧠 AI Features (Future)

POST /ai/recommend

---

📦 Deployment

- Vercel Auto Deploy
- GitHub Integration
- CI/CD Enabled

---

🎯 Future Roadmap

- AI product suggestions
- Smart search
- Auto pricing engine
- Advanced analytics

---

❤️ JembeeKart Vision

«Build scalable, modern, glass UI based ecommerce platform with full admin control.»

---