# SpendWise 💳📊

> **Cross-Platform Expense Tracker**: Mobile App (Expo React Native) + Web Dashboard (React & Vite) + Shared Node.js REST API backed by MongoDB Atlas.

SpendWise is a personal expense-tracking product that enables users to sign up once, record and manage expenses from either their phone or the web dashboard, and see real-time synchronised data and analytics on both platforms.

---

## 🌟 Key Features

| Requirement | Description | Status |
| :--- | :--- | :---: |
| **FR-1: Auth Flow** | User signup and login with email/password; bcrypt password hashing; JWT token generation. | ✅ Complete |
| **FR-2: Expense CRUD** | Add, edit, and delete expenses (amount, category, date, optional note). | ✅ Complete |
| **FR-3: Filters & Search** | List expenses filtered by category (Food, Transport, Rent, Bills, Shopping, Health, Entertainment, Other), month (`YYYY-MM`), and note search with pagination. | ✅ Complete |
| **FR-4: Monthly Summary** | Monthly totals, spending progress, and breakdown by category with percentages. | ✅ Complete |
| **FR-5: Cross-Platform Sync** | The same account works on mobile and web; expenses logged on one appear on the other. | ✅ Complete |
| **FR-6: Visual Charts** | Interactive Pie/Donut chart by category + 6-month historical Bar chart. | ✅ Complete |
| **FR-7: Budget Alerts** | Set a monthly budget with visual warning alerts at **80%** and **100% (Exceeded)**. | ✅ Complete |
| **FR-8: Mobile Usability** | One-handed friendly UI, pull-to-refresh (`RefreshControl`), loading spinners, and error alerts. | ✅ Complete |
| **FR-9: CSV Export** | Export filtered or monthly transactions directly to `.csv` from the web dashboard. | ✅ Complete |
| **FR-10: Offline Caching** | Local offline caching on mobile with `AsyncStorage` fallback when disconnected. | ✅ Complete |
| **FR-11: Dark Mode** | Persistent Light / Dark theme toggle on the web dashboard. | ✅ Complete |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Clients["Clients Layer"]
        Mobile["📱 React Native Mobile App (Expo Go)"]
        Web["💻 React Web Dashboard (Vite + Tailwind + Recharts)"]
    end

    subgraph Hosting["Public Hosting"]
        Vercel["⚡ Vercel (Web Dashboard)"]
        Render["🚀 Render (Node.js REST API)"]
    end

    subgraph Database["Data Layer"]
        Mongo["🍃 MongoDB Atlas (Mongoose ODM)"]
    end

    Web -->|Hosted On| Vercel
    Mobile -->|JSON over HTTPS / JWT| Render
    Web -->|JSON over HTTPS / JWT| Render
    Render -->|CRUD Operations| Mongo
```

---

## 📂 Repository Structure

```
spendwise/
├── .github/workflows/
│   └── ci.yml                   # GitHub Actions automated test & build pipeline
├── backend/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── config/db.js         # MongoDB connection & error handling
│   │   ├── controllers/         # authController, expenseController, summaryController
│   │   ├── middleware/          # JWT auth & error handler
│   │   ├── models/              # User & Expense Mongoose schemas
│   │   ├── routes/              # authRoutes, expenseRoutes, summaryRoutes
│   │   ├── app.js               # Express application config & CORS
│   │   └── server.js            # Server entrypoint
│   ├── tests/                   # 12 automated Jest & Supertest integration tests
│   ├── render.yaml              # Render Blueprint deployment config
│   ├── .env.example
│   └── package.json
├── web/                         # React + Vite Web Dashboard
│   ├── src/
│   │   ├── api/client.js        # Axios instance with JWT interceptor
│   │   ├── components/          # Navbar, SummaryCards, BudgetAlert, Charts, Table, Modals
│   │   ├── context/             # AuthContext, ThemeContext (Dark Mode)
│   │   ├── pages/               # LoginPage, SignupPage, DashboardPage
│   │   └── App.jsx
│   ├── vercel.json              # Vercel SPA routing rewrites
│   ├── .env.example
│   └── package.json
├── mobile/                      # Expo React Native App
│   ├── src/
│   │   ├── api/client.js        # Axios instance with AsyncStorage token persistence
│   │   ├── context/AuthContext.js
│   │   ├── components/          # ExpenseCard, CategoryBadge, BudgetWarningBanner
│   │   ├── screens/             # Login, Signup, ExpenseList, AddEditExpense, Summary, Budget
│   │   └── navigation/          # React Navigation (Bottom Tabs + Stack)
│   ├── app.json
│   ├── .env.example
│   └── package.json
├── render.yaml                  # Root Blueprint
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints Reference

Base URL: `https://<your-render-app>.onrender.com` (or `http://localhost:5000` locally)

| Method | Endpoint | Purpose | Auth Required | Request Body / Query Params |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/signup` | Create an account | No | `{ name, email, password, monthlyBudget? }` |
| `POST` | `/api/auth/login` | Log in and receive JWT | No | `{ email, password }` |
| `GET` | `/api/auth/me` | Fetch authenticated user | Yes | Header: `Authorization: Bearer <token>` |
| `GET` | `/api/expenses` | List expenses with filters | Yes | Query: `?month=YYYY-MM&category=...&page=1&limit=20&search=...` |
| `POST` | `/api/expenses` | Add a new expense | Yes | `{ amount, category, date?, note? }` |
| `GET` | `/api/expenses/:id` | Get single expense | Yes | None |
| `PUT` | `/api/expenses/:id` | Update expense | Yes | `{ amount?, category?, date?, note? }` |
| `DELETE`| `/api/expenses/:id`| Delete expense | Yes | None |
| `GET` | `/api/summary` | Totals, category breakdown, budget analysis | Yes | Query: `?month=YYYY-MM` |
| `PUT` | `/api/budget` | Set monthly budget | Yes | `{ monthlyBudget: 1500 }` |
| `GET` | `/api/health` | Service health status | No | None |

---

## 🚀 Deployment Guide

### 1. Backend Deployment to Render

1. **Create MongoDB Atlas Database**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free M0 cluster.
   - Under **Database Access**, create a user with a password.
   - Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere).
   - Click **Connect** -> **Drivers** to copy your connection string (e.g., `mongodb+srv://user:pass@cluster0.mongodb.net/spendwise?retryWrites=true&w=majority`).

2. **Deploy on Render**:
   - Go to [Render](https://render.com) and create an account or log in with GitHub.
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository: `https://github.com/Eshanfadil123/spendwise`.
   - Set configuration:
     - **Name**: `spendwise-backend`
     - **Root Directory**: `backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - In **Environment Variables**, add:
     - `NODE_ENV` = `production`
     - `PORT` = `10000`
     - `MONGODB_URI` = `<Your MongoDB Atlas Connection String>`
     - `JWT_SECRET` = `<Generate a secure random string>`
   - Click **Create Web Service**. Render will deploy your REST API and generate a public URL (e.g. `https://spendwise-backend.onrender.com`).

---

### 2. Frontend Deployment to Vercel

1. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import the `spendwise` repository.
4. In the configuration screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://spendwise-backend.onrender.com` (your deployed Render URL)
6. Click **Deploy**. Vercel will build and deploy the React web dashboard with global CDN hosting and SPA routing (configured via `web/vercel.json`).

---

### 3. Running the Mobile App (Expo Go)

1. Navigate to the `mobile` folder:
   ```bash
   cd mobile
   npm install
   ```
2. Configure the API endpoint in `mobile/.env`:
   ```env
   EXPO_PUBLIC_API_URL=https://spendwise-backend.onrender.com
   ```
   *(For testing against a local backend on your computer while running on a physical phone on the same Wi-Fi, set `EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_LOCAL_IP>:5000`)*.
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. **Run on your device**:
   - Install **Expo Go** from the iOS App Store or Android Google Play Store.
   - Scan the QR code displayed in the terminal with the Expo Go app (Android) or the default Camera app (iOS).
   - Alternatively, press `a` for Android Emulator, `i` for iOS Simulator, or `w` to open the web version.

---

## 💻 Local Development Setup

To run all components locally:

### 1. Backend
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5000
```
Run automated test suite:
```bash
npm test
```

### 2. Web Dashboard
```bash
cd web
npm install
npm run dev
# Dashboard available at http://localhost:5173
```

### 3. Mobile App
```bash
cd mobile
npm install
npx expo start
```

---

## 🧪 Automated Testing

SpendWise comes equipped with an end-to-end integration test suite using **Jest**, **Supertest**, and an in-memory MongoDB runner.

To execute tests:
```bash
cd backend
npm test
```
**Results**:
- ✅ `tests/auth.test.js` (User registration, password hashing, JWT generation, duplicate email rejection, profile fetch, budget updating)
- ✅ `tests/expense.test.js` (Expense CRUD, monthly and category filters, user data isolation, budget calculation with 80% & 100% warning flags)
- Total: 12 passing tests across 2 suites.
