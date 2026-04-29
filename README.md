# 🚀 JembeeKart

> Enterprise Grade E-commerce Platform  
> Glass Morphism UI + Admin Controlled Theme + Qikink Integration

---

## 🧠 Overview

JembeeKart is a **production-level scalable eCommerce platform** built with:

- ⚡ Next.js 14 (App Router)
- 🎨 Glass Morphism UI
- 🎛 Admin Theme Control System
- 🔥 Firebase Backend
- 💳 Cashfree Payment Gateway
- 📦 Qikink Print-on-Demand Integration
- 📡 Real-time Updates (Socket / Firestore)

---

## ✨ Core Features

### 🎨 UI System
- Glass morphism design
- Dynamic theme (admin controlled)
- Light / Dark / Glass modes
- CSS variable based theming

### 🛒 Commerce
- Product catalog
- Cart system (Firestore based)
- Order tracking
- Wishlist

### 👑 Admin Panel
- Theme control (real-time)
- Banner management
- Pricing control
- Feature flags
- Analytics dashboard

### 🏪 Seller Panel
- Product upload
- Affiliate links
- Order management

### 🔔 Communication
- WhatsApp integration
- Email notifications
- SMS alerts

---

## 🎯 Theme System (🔥 Highlight)

Admin → changes theme  
↓  
Stored in Firestore  
↓  
Middleware injects theme  
↓  
Frontend applies CSS variables  

```css
--glass-blur
--glass-opacity
--primary-color