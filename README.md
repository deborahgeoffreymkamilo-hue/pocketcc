# Pocket - Smart Personal Finance & Wealth Management

A Tanzania-first modern personal finance application built with **React + Vite**, **Supabase (PostgreSQL & Auth)**, and inspired by the **Helios Neon Fintech Dashboard** aesthetic.

![Helios Neon Fintech Design](./Helios%20Neon%20Fintech%20Dashboard%20Showcase.png)

---

## 🌟 Key Features

### 1. 💼 Multi-Account & Tanzania-First Mobile Money
- Track balances across **M-Pesa**, **Airtel Money**, **Tigo Pesa**, **HaloPesa**, Commercial Banks (**CRDB**, **NMB**), and Physical Cash.
- Real-time balance updates via PostgreSQL triggers upon every transaction or transfer.
- Explicit account-to-account transfer support that doesn't artificially distort income or expense metrics.

### 2. 📊 High-Performance Neon Dashboard & Portfolios
- **Dark Neon Aesthetic**: Glassmorphism cards with vibrant neon purple, magenta, and cyan glows.
- **Dynamic Performance Curves**: Interactive Recharts visualizing cashflow velocity across 1D, 1W, 1M, 6M, and 1Y periods.
- **Top Financial Indicators**: Instant views of Total Balance, Monthly Inflows, Outflows, Net Savings, and Savings Rate.

### 3. 🎯 Savings Goals & Emergency Fund Planner
- Set up target goals for **Emergency Funds**, **Laptops**, **Tuition**, or **Business Capital**.
- Automated monthly deposit recommendations based on target dates.
- Interactive deposit and progress tracking with dynamic gradient progress bars.

### 4. 🏷️ Category-Based Monthly Budgets
- Set monthly limits for Food, Transport, Rent, Airtime/Data, Utilities, Entertainment, and Shopping.
- Threshold alerts (80% warning and 100% breach notifications) with color-coded badges.

### 5. 🤖 Helios.ai Financial Intelligence Companion
- Integrated conversational assistant trained on your financial data.
- Answers questions like *"Can I afford this purchase?"*, *"Where did my money go?"*, and *"How is my savings rate doing?"*.
- Computes an aggregate **Financial Health Score** (out of 100) based on savings discipline, debt burden, and budget adherence.

### 6. 📅 Financial Calendar & Subscriptions
- Visual monthly calendar displaying salary dates, bill due dates, and past transactions.
- Automated tracker for recurring expenses (Rent, Internet, Spotify, Netflix, Memberships).

### 7. 💳 Debt & Loan Manager
- Track money borrowed (liabilities) and money lent to friends/clients (receivables).
- One-click debt settlement and repayment tracking.

### 8. 📄 Data Export & Security
- Export complete transaction histories to CSV (compatible with Excel & Sheets).
- **Zero-knowledge principle**: Bank passwords, ATM PINs, and M-Pesa PINs are never requested or stored.
- Row-Level Security (RLS) on all Supabase PostgreSQL tables.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide Icons, Recharts, Date-fns
- **Backend & Database**: Supabase (PostgreSQL 15 + Row Level Security + Triggers)
- **Authentication**: Supabase Auth (Email/Password, OAuth)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/deborahgeoffreymkamilo-hue/pocketcc.git
cd pocketcc/pocket-app
npm install
```

### 2. Configure Supabase Backend
1. Create a free project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run the provided SQL script:
   ```bash
   pocket-app/supabase/schema.sql
   ```
3. Copy your project URL and anon public key into `pocket-app/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
