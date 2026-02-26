# BeautyStock - Project Context

> **Last Updated:** 2026-02-26
> **Status:** Active Development (PWA Implementation, User Authentication, & Pro Features Refinement)

## 📌 Project Overview
**BeautyStock** is a mobile-first SaaS tailored for cosmetics and perfume resellers. It provides an intuitive, visually appealing, and "Soft & Premium" interface for inventory control, sales management, and customer relationship management, purposefully moving away from complex and sterile ERP software.

## 🛠 Tech Stack & Architecture
- **Frontend Framework:** React 18 + Vite
- **Styling:** Tailwind CSS v4 (using `@theme` variables for centralized design tokens)
- **Icons:** Lucide React
- **Backend/Database:** Supabase (PostgreSQL, Edge Functions, Auth, Storage)
- **Routing:** React Router DOM (v6)
- **State Management:** React Context API (AuthContext) + Custom Hooks (`useDashboard`, `useProducts`, etc.) + Local State
- **PWA Integration:** `vite-plugin-pwa` (Full offline support, Add to Home Screen, Custom Icons)
- **Service Layer Pattern:** API calls abstracted into a dedicated service layer for maintainability.

## 🎨 Design System & UI ("Soft & Premium")
- **Core Palette:**
    - **Primary:** Pink (`#ec4899` - `text-pink-500`, `bg-pink-500`)
    - **Secondary/Accent:** Lilac (`#d8b4fe`)
    - **Background:** Pastel Pink (`#fdf2f8` - `bg-pink-50`)
    - **Text:** Dark Gray (`#1f2937`) to Soft Gray (`#6b7280`)
- **Key UI/UX Principles:**
    - **Mobile-First:** Core navigation uses a fixed Bottom Navigation bar.
    - **Soft Edges:** Extensive use of `rounded-2xl` and `rounded-3xl` for a friendly, app-like feel.
    - **Depth:** Custom `shadow-soft` class applied uniformly across cards and modals.
    - **Action-Oriented:** Floating Action Buttons (FAB) for primary actions (e.g., "Nova Venda").
    - **Micro-interactions:** Smooth transitions, active states, and premium checkout experiences.
    - **New Brand Identity:** Vibrant pink logo with a bold white "B", adapted for all PWA and Favicon sizes.

## 📂 Project Structure
- `src/components/`
    - `Layout.jsx`: Main interface wrapper with mobile Bottom Navigation.
    - `Dashboard/`: Widgets like Header, StatCards, ProfitChart, ClientsChart, TopDebtors.
    - `ui/`: Reusable primitive components (BibiButton, Inputs, Modals).
    - `Onboarding/`: Feature highlight overlays (`SpotlightOverlay.jsx`).
- `src/pages/`
    - `Auth/`: Multi-step signup, Login, OTP Confirmation.
    - `Dashboard.jsx`: Main telemetry and quick actions.
    - `Products/`: Product listing, Form (`ProductForm.jsx`), Bulk Excel Import.
    - `Movements/`: `MovementsList.jsx` (feed) and `MovementForm.jsx` (sales/entries).
    - `Customers/`: Customer management, debt tracking, WhatsApp billing.
    - `Account.jsx`: Profile settings, plan details, support links.
- `src/services/` & `src/hooks/`: Data fetching abstractions and state logic.
- `src/lib/supabase.js`: Supabase client configuration.
- `supabase/functions/`: Edge functions (e.g., `import-products`).

## 🚀 Core Features & Modules

### 1. Authentication & Onboarding
- **Multi-step Signup:** Collects Name, Email, Password with client-side validation.
- **OTP Verification:** 6-digit in-app email confirmation flow using Supabase `verifyOtp`.
- **Profile Auto-creation:** Automatically generates a `profiles` record with a default 'free' plan upon signup.
- **Sync:** Profile updates (like Name) instantly reflect across the app (Dashboard greeting).

### 2. Dashboard Hub
- **Telemetry:** Calculates total products, low stock alerts, monthly profit, and debt.
- **ProfitChart:** Responsive Area Chart tracking daily profit margins (Sales vs. Costs) over 7, 30, or 90 days.
- **ClientsChart (PRO):** Line chart visualizing customer acquisition over time.
- **Top Debtors:** Quick-access card highlighting the top 3 customers owing money, with 1-click WhatsApp billing.

### 3. Inventory & Products (Stock Management)
- **Product Catalog:** Image, Category, Price, Cost, SKU, and Stock level.
- **Variations:** Support for sizes and colors per product.
- **Bulk Import:** Excel (`.xlsx`) upload with data mapping, preview, and backend Edge Function for upserts.

### 4. Point of Sale (Movements & Checkout)
- **"Nova Venda" (New Sale):** Clean, premium interface for registering sales or stock entries.
- **Smart Cart:** Add items, adjust quantities with pill-shaped custom inputs.
- **Discounts:** Apply Fixed Amount or Percentage discounts, automatically distributed proportionally across cart items.
- **Checkout UI:** Premium design for final total calculation and confirmation.
- **Automation:** SQL Triggers (`triggers.sql`) automatically update product stock upon sale/entry confirmation.

### 5. Customer Relationship Management (CRM)
- **Customer List:** Track names, contact info, and total debt (`fiado`).
- **Smart WhatsApp Billing (PRO):**
    - Modal to send automated charge messages.
    - 5 selectable tones: 💖 Soft, 💼 Professional, ⚡ Direct, 🔥 Urgent, 😊 Friendly.
    - Ensures device compatibility using native `api.whatsapp.com/send`.

### 6. "Bot Zapzap" Integration 
- **Automated Support:** Built-in automated messages for account support (e.g., "Olá! Estou com Problemas.. Pode me ajudar?").
- **Backend Infrastructure:** `WhatsappModule` and `FlowsModule` set up for future Chatbot Builder expansions.

## 💎 Freemium Business Model
- **FREE Tier:** 
  - Limit: 10 Products maximum.
  - Basic dashboard analytics.
  - Locked sections (e.g., Customers CRM, Smart WhatsApp Billing).
  - Prompts to upgrade when interacting with locked features.
- **PRO Tier:**
  - Unlimited products.
  - Full access to CRM and Customer Debt Tracking.
  - Advanced Analytics (ClientsChart, Top Debtors).
  - VIP WhatsApp Support.
  - Smart Tone selection for WhatsApp billing.

## 🔄 Recent Major Updates (Late Feb 2026)
- **PWA Transformation:** Added `vite-plugin-pwa`, generated custom app icons, and implemented installation prompts for mobile devices.
- **Security & Flow:** Replaced magic link emails with direct OTP (One-Time Password) confirmation screen.
- **Freemium Tweaks:** Increased Free tier product limit from 5 to 10 to improve user onboarding experience.
- **Checkout Refactor:** Upgraded the visual hierarchy of the shopping cart, integrating proportional discounts seamlessly.
- **Branding:** Replaced the generic Vite logo with a custom-designed, high-quality pink "B" logo across the app and HTML headers.
- **Code Quality:** Migrated loose Supabase calls into a structured Service Layer and extracted logic into custom hooks.

## � Next Steps & Roadmap
- Implement Push Notifications via Service Workers.
- Finalize the visual Chatbot Builder UI in the web application.
- Expand reporting (PDF Exports for sales/inventory).
- Continue refining the visual consistency of older modals to match the "Soft & Premium" V2 standard.
