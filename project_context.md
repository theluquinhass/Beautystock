# BeautyStock - Project Context

> **Last Updated:** 2026-02-23
> **Status:** Active Development (Dashboard & Pro Features Refinement)

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
    - **Rounded-2xl** cards for a modern, app-like feel.
    - **Soft Shadow** (`shadow-soft`) for depth.
    - **Bottom Navigation** (Mobile style, fixed).
    - **FAB (Floating Action Button)** for primary actions.

## 📂 Project Structure
- `src/components/Layout.jsx`: Main mobile-first layout wrapper with Bottom Navigation.
- `src/components/Dashboard/`: Dashboard-specific widgets (Header, StatCard, BestSellers).
- `src/components/ui/`: Reusable primitive components.
- `src/pages/`:
    - `Account.jsx`: User profile, plan status, security, and PRO support.
    - `Movements/MovementForm.jsx`: New clean UI for entries/sales.
    - `Customers/`: Customer management and debt tracking.
- `src/lib/supabase.js`: Supabase client configuration.

## 🔄 Recent Changes Log (Feb 2026)
- **[Feature] Account Module**:
    - Created `Account.jsx` with Profile editing (syncs with Dashboard greetings).
    - Added "Plan" section (Free vs Pro).
    - Added "Security" (Password Reset).
    - Added **WhatsApp Support** button (Exclusive to PRO users).
- **[Refactor] Movements Module**:
    - Completely redesigned `MovementForm.jsx` (New UI, Validation, Stock preview).
    - Fixed navigation bugs (redirect loops).
    - Added automatic stock updates via SQL Triggers (`triggers.sql`).
    - **[UX] Terminology Update**:
        - Renamed "Nova Movimentação" to "Nova Venda" in Movements FAB.
        - Made Movement Form header dynamic ("Nova Venda" vs "Nova Entrada").
        - Fixed route consistency to `/movimentacoes/nova`.
- **[Database] Schema Hardening**:
    - Added `products` and `variations` tables via `initial_schema.sql`.
    - Added `customers` and `payments` tables via `complete_schema.sql`.
    - Added `updated_at` column to `profiles` to fix update errors.
    - Implemented RLS policies for all new tables.

- **[Feature] Dashboard Refinements (Late Feb 2026)**:
    - Replaced generic "Clients Chart" with a dynamic **"Profit Growth"** area chart (`ProfitChart.jsx`).
    - Calculates daily profit automatically by joining `movements` (sales price) and `products` (cost price).
    - Added **"Top Devedores"** (`TopDebtorsCard.jsx`) card displaying the top 3 customers in debt with a quick "Cobrar" integration.
- **[Feature] Smart WhatsApp Charges (PRO)**:
    - Added a `ChargeModal.jsx` to `CustomerView` and `CustomerCard` lists.
    - PRO users can choose between 5 message tones (💖 Soft, 💼 Professional, ⚡ Direct, 🔥 Urgent, 😊 Friendly).
    - FREE users see an upgrade prompt and a generic message.
    - Uses native `<a>` tags targeting `api.whatsapp.com/send` to guarantee Emoji delivery on all mobile devices.
- **[Refactor] MovementForm UX (Quantity Input)**:
    - Overhauled the quantity input inside `MovementForm.jsx` to mask native browser arrows.
    - Adopted a premium, unified pill design with distinct +/- buttons preventing mobile layout clipping.

## 📝 Current Features
1.  **Dashboard**:
    - "Commercial" focus: Profit, Debt, Low Stock.
    - Profit Growth Area Chart (7, 30, 90 days).
    - Personalized greeting (Syncs with Profile).
    - Feed of recent sales.
2.  **Products**:
    - Grid of cards with stock badges.
    - Variation support (Sizes, Colors).
3.  **Customers** (PRO):
    - Sorted by Debt.
    - "Cobrar" via WhatsApp.
4.  **Movements**:
    - Daily Feed style.
    - "Nova Venda": Entry/Sale toggle, Credit Sale (Fiado) support.
5.  **Account**:
    - Profile management.
    - Link to Upgrade.
    - Exclusive PRO Support.

## 🚀 Next Steps
- Verify visual consistency on inner pages.
- Monitor user feedback on the new Movement form.
