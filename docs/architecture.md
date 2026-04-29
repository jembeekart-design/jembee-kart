🧠 JembeeKart Architecture (v3.0 – Glass System)

🚀 Overview

JembeeKart is a scalable, mobile-first eCommerce platform built using:

- Next.js (App Router)
- Firebase (Firestore + Auth)
- Tailwind CSS (Glass Morphism UI)
- Vercel (Deployment)

---

🧩 Core Architecture Layers

1. 🖥 Frontend (Next.js App Router)

Structure:

src/
 ├── app/
 │   ├── page.tsx
 │   ├── layout.tsx
 │   ├── products/
 │   ├── cart/
 │   ├── admin/
 │
 ├── components/
 │   ├── ui/
 │   ├── glass/
 │   ├── layout/
 │
 ├── lib/
 │   ├── firebase.ts
 │   ├── theme.ts

---

2. 🎨 Glass Morphism UI System

Design Tokens

:root {
  --primary: #6366f1;
  --glass-bg: rgba(255,255,255,0.08);
  --glass-border: rgba(255,255,255,0.2);
  --blur: 16px;
}

Glass Component (Reusable)

export function GlassCard({ children }) {
  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-4">
      {children}
    </div>
  )
}

---

3. 🎯 Theme System (Admin Controlled)

Firestore Structure

settings/
 └── theme
      ├── primaryColor
      ├── background
      ├── glassIntensity

Theme Loader

import { doc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

export async function loadTheme() {
  const snap = await getDoc(doc(db, "settings", "theme"))
  return snap.data()
}

Apply Theme

export function applyTheme(theme) {
  document.documentElement.style.setProperty("--primary", theme.primaryColor)
}

---

4. 🛠 Admin Panel

Route:

/admin/theme

Features:

- Change Primary Color 🎨
- Adjust Glass Blur 🌫
- Toggle Dark Mode 🌙

Example:

export default function ThemeAdmin() {
  return (
    <div>
      <input type="color" />
      <input type="range" min="5" max="30" />
      <button>Save Theme</button>
    </div>
  )
}

---

5. 🔥 Backend (Firebase)

- Firestore → Products, Orders, Theme
- Auth → Admin Login
- Storage → Images

---

6. 🛒 Cart System

- Firestore आधारित (localStorage नहीं)
- Real-time sync

---

7. 🔐 Security

- Admin routes protected
- Firebase rules enforced

---

8. ⚡ Performance

- Server Components
- Lazy loading
- Image optimization

---

9. 📦 Deployment

- Vercel auto deploy from GitHub
- CI/CD enabled

---

🎯 Future Roadmap

- Affiliate system
- Notification bell 🔔
- WhatsApp auto chat
- AI product suggestions

---

🧠 Conclusion

JembeeKart uses a modern, scalable architecture with a dynamic UI system (Glass Morphism + Theme Engine) controlled by admin.

This ensures:

- 🔥 Premium UI
- ⚡ Fast performance
- 📈 Scalable growth