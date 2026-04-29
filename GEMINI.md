# IDEAL Sales Control System - Gemini Guidelines

This project is a Next.js application for sales management and inventory control.

## 🚀 Quick Start / Agent Usage
Para activar a Gemini CLI en este proyecto, ejecuta desde la raíz:
```powershell
gemini
```
O si no está global: `npx @google/gemini-cli`.

## 🛠 Foundational Mandates

### ⚠️ Next.js 16 & React 19 (Experimental/Future)
- **Breaking Changes:** This project uses Next.js 16.2.x and React 19. Standard conventions from earlier versions may be deprecated.
- **Reference Docs:** Always prioritize documentation found in `node_modules/next/dist/docs/` or `AGENTS.md`.
- **Server Components:** Default to Server Components for data fetching. Use `'use client'` only when interactivity or hooks (e.g., `useSWR`, `useState`) are required.

### 🎨 Styling & UI
- **Tailwind CSS 4:** Use Tailwind CSS 4 features. Check `postcss.config.mjs` and `@tailwindcss/postcss` for configuration.
- **Icons:** Use `lucide-react`.
- **Aesthetics:** Maintain the "IDEAL" branding—professional, clean, and accessible.

## 📦 Tech Stack & Database
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL).
- **State Management:** Custom stores in `lib/store.ts` utilizando el cliente de Supabase.
- **Data Fetching:** SWR para el cliente, `fetch` nativo para el servidor.
- **Formatting:** ESLint para linting.

## 📁 Project Structure
- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable React components.
- `lib/`: Business logic, types, utilities, and shared state (`store.ts`).
- `legacy/`: Historical static assets and previous version (DO NOT MODIFY unless migrating).
- `public/`: Static assets for the current application.

## 📝 Conventions & Logic
- **Language:** Code is in English (variables, functions), but business-specific types and comments may be in Spanish (e.g., `vendedor`, `ventas`).
- **Types:** Always define interfaces in `lib/types.ts` before implementing new features.
- **Statistics:** All statistics calculations are centralized in `lib/store.ts` (`getSalesStats` and `getProductSalesStats`).
- **Surgical Updates:** When modifying `lib/store.ts`, ensure compatibility with the existing Supabase schema defined in `supabase_migration.sql`.

## 🧪 Verification Workflow
1. **Lint:** `npm run lint`
2. **Build:** `npm run build`
3. **Manual Check:** Verify new routes in the dashboard (`/dashboard/...`).
