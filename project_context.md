# BeautyStock - Project Context

> **Last Updated:** 2026-02-10
> **Status:** Active Development (UI Redesign Phase Completed)

## 📌 Project Overview
**BeautyStock** is a mobile-first SaaS for cosmetics resellers (Perfumes, Makeup). It is designed to be simple, feminine, and visually appealing, moving away from complex ERP interfaces.

## 🛠 Tech Stack
- **Frontend:** React + Vite
- **Styling:** Tailwind CSS v4 (with `@theme` variables)
- **Icons:** Lucide React
- **Backend/DB:** Supabase
- **Routing:** React Router DOM
- **State Management:** React Context (Auth) + Local State

## 🎨 Design System & UI
- **Theme:** "Soft & Premium"
    - **Primary Color:** Pink (`#ec4899`)
    - **Secondary Color:** Lilac (`#d8b4fe`)
    - **Background:** Pastel Pink (`#fdf2f8`)
- **Key UI Elements:**
    - **Rounded-2xl** cards.
    - **Soft Shadow** (`shadow-soft`).
    - **Bottom Navigation** (Mobile style, fixed).
    - **FAB (Floating Action Button)** for new actions.

## 📂 Project Structure
- `src/components/Layout.jsx`: Main mobile-first layout wrapper with Bottom Navigation.
- `src/components/Dashboard/`: Dashboard-specific widgets (Header, StatCard, BestSellers).
- `src/components/ui/`: Reusable primitive components (Card).
- `src/index.css`: Global styles, Tailwind `@theme` config, and legacy compatibility layer.
- `src/lib/supabase.js`: Supabase client configuration.

## 🔄 Recent Changes Log
- **[New Feature]** Customers Module:
    - Added `customers` and `payments` tables.
    - Added "Credit Sales" (Fiado) support in Movements.
    - Added Customer List, Statistics, and Detail pages.
- **[Redesign]** Transformed dashboard to mobile-first vertical layout.
- **[Redesign]** Replaced Sidebar with Bottom Navigation.
- **[Tech]** Migrated to Tailwind CSS v4 (replaced `tailwind.config.js` with CSS variables).
- **[Fix]** Restored legacy styles (`.btn`, `.input`) to fix Login/Products pages.
- **[UX]** Complete UI/UX Overhaul to "Premium Mobile App" style.
- **[Feature]** Dashboard: Added "Total a Receber" (Fiado) and "Vendas Hoje" metrics.
- **[Feature]** Customers: Debt sorting, High Debt indicators, WhatsApp integration.
- **[Refactor]** Converted all tables (Products, Movements) to Mobile-First Cards/Feeds.

## 📝 Current Features
1.  **Dashboard**:
    - "Commercial" focus: Profit, Debt, Low Stock.
    - Emotional greeting.
    - Feed of recent sales.
2.  **Products**: Grid of cards with stock badges (Red/Gray).
3.  **Customers**:
    - Sorted by Debt.
    - "Cobrar" via WhatsApp.
4.  **Movements**:
    - Daily Feed style.
    - Sales vs Entries.
    - Dedicated "New Movement" page.
5.  **Auth**: Login/Signup via Supabase.

## 🚀 Next Steps
- Verify visual consistency on inner pages.
- Refactor inner pages (Products, Movements) to fully utilize new UI components instead of compatibility layer.
