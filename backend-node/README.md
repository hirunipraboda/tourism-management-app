# Travel Link Backend API — "Your Island Journey" 🇱🇰

Welcome to the backend REST API for the **Travel Link — Your Island Journey** tourism platform.

This backend is built using **Node.js, Express.js, TypeScript, and MongoDB Atlas (via Mongoose)** with JWT Authentication and PickMe transportation partner integration.

---

## 🚀 Quick Start Guide

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/travel_link
JWT_SECRET=travel_link_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Seed Database (Sri Lanka Tourism Data)

Populate realistic Sri Lankan destinations (Sigiriya, Kandy, Ella, Galle, Yala, etc.), tour packages, local guides, PickMe partner config, and demo users:

```bash
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

The API will start at: `http://localhost:5000`

---

## 📚 Interactive API Documentation (Swagger)

Open your browser and navigate to:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 🛠 Implemented Endpoints

| Category | Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | Public | System health and DB status |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new user |
| **Auth** | `POST` | `/api/auth/login` | Public | Login & receive JWT |
| **Auth** | `GET` | `/api/auth/me` | Bearer Token | Get current user profile |
| **Destinations** | `GET` | `/api/destinations` | Public | List & search destinations |
| **Destinations** | `GET` | `/api/destinations/:id` | Public | Get single destination details |
| **Destinations** | `POST` | `/api/destinations` | Admin | Create destination |
| **Destinations** | `PUT` | `/api/destinations/:id` | Admin | Update destination |
| **Destinations** | `DELETE`| `/api/destinations/:id` | Admin | Delete destination |
| **Tours** | `GET` | `/api/tours` | Public | List & filter tour packages |
| **Tours** | `GET` | `/api/tours/:id` | Public | Get single tour package |
| **Tours** | `POST` | `/api/tours` | Admin | Create tour package |
| **Guides** | `GET` | `/api/guides` | Public | List & filter local guides |
| **Transport** | `GET` | `/api/transport` | Public | Get PickMe partner info & 10% discount |
| **Trips** | `GET` | `/api/trips` | Bearer Token | User's travel plans |
| **Trips** | `POST` | `/api/trips` | Bearer Token | Save a new trip plan |
| **Bookings** | `GET` | `/api/bookings` | Bearer Token | View user/admin bookings |
| **Bookings** | `POST` | `/api/bookings` | Bearer Token | Submit tour/guide booking |
| **Reviews** | `GET` | `/api/reviews` | Public | View reviews |
| **Reviews** | `POST` | `/api/reviews` | Bearer Token | Post review |
| **Admin** | `GET` | `/api/admin/dashboard`| Admin | Live MongoDB aggregated stats |
| **Admin** | `GET` | `/api/admin/users` | Admin | User management |
| **Admin** | `GET` | `/api/admin/bookings`| Admin | Booking management |

---

## 🔐 Security Features

- **JWT Authentication** with password hashing using `bcryptjs`.
- **Role-based Access Control (RBAC)** (`user`, `guide`, `admin`).
- **Helmet HTTP headers protection**.
- **CORS restricted** to authorized `CLIENT_URL`.
- **express-rate-limit** protection against DDoS & brute-force requests.
