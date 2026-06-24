# Mitchell's Fruit Farms — E-Commerce Web App

> Farm Fresh Since 1933 🌿

A full-stack food e-commerce web application for Mitchell's Fruit Farms, Pakistan's premium food brand. Built with React.js, Node.js, Express, and MongoDB.

---

## 🚀 Live Features

### Customer Features
- 🔐 **Auth** — Signup with OTP email verification, Login, Forgot Password (OTP-based reset)
- 🛒 **Cart** — Add/remove/update items, persistent across sessions
- ❤️ **Wishlist** — Save favourite products, manage from navbar drawer
- 📦 **Orders** — Place orders, track status in real-time (Pending → Confirmed → Preparing → Ready → Delivered)
- 🎟️ **Coupons** — Get 30% discount code via email (one-time, 48hr expiry)
- 📋 **Bulk Orders** — Submit vendor/business order requests
- ⭐ **Reviews** — Rate and review products (1-5 stars)
- 🤖 **AI Chatbot** — Powered by Groq (Llama 3.1) — answers queries, shows order status, product info

### Admin Features
- 📊 **Dashboard** — Sales stats, order charts, recent activity
- 📦 **Order Management** — Update order status through pipeline
- 🛍️ **Product Management** — Add/edit/delete products with ingredient tokens
- 👥 **User Management** — View and manage all users
- 🤝 **Vendor Requests** — Accept/decline bulk order agreements with admin notes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcryptjs |
| Email | EmailJS (OTP, coupons, contact) |
| AI | Groq API (Llama 3.1-8b-instant) |
| HTTP | Axios with interceptors |
| Charts | Recharts |

---

## 📁 Project Structure

```
final project/
├── backend/
│   ├── config/         # DB + Email config
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   └── server.js
├── frontend/
│   └── frontend/
│       └── src/
│           ├── components/   # Reusable UI
│           ├── context/      # Auth, Cart, Wishlist
│           ├── pages/        # All pages
│           └── services/     # API calls
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API key (free at console.groq.com)

### Backend Setup
```bash
cd "final project/backend"
npm install
```

Create `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
GROQ_API_KEY=your_groq_key
```

```bash
npm run dev
```

### Frontend Setup
```bash
cd "final project/frontend/frontend"
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 🔑 Default Admin

```
Email:    admin@food.com
Password: admin123
```

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/send-otp | Send signup OTP |
| POST | /api/auth/verify-otp | Verify OTP |
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/auth/forgot-password | Send reset OTP |
| POST | /api/auth/reset-password | Reset password |
| GET | /api/products | Get all products |
| POST | /api/products/:id/comment | Add review |
| GET | /api/orders | Get orders |
| POST | /api/orders | Place order |
| POST | /api/coupons/generate | Generate coupon |
| POST | /api/coupons/validate | Validate coupon |
| POST | /api/vendor | Submit bulk request |
| POST | /api/chat | AI chatbot |

---

## 👤 Developer

**Zubair Abbas**
- 📧 za314944@gmail.com
- 📞 03262448200

---

## 📜 License

This project is for educational purposes.

© 2026 Mitchell's Fruit Farms. Farm Fresh Since 1933.
