**# Project Instructions**



**You are working inside an existing Next.js dashboard starter based on:**



**- Next.js**

**- TypeScript**

**- Tailwind CSS**

**- shadcn/ui**

**- App Router**

**- Existing dashboard layout, sidebar, tables, forms, cards, and UI primitives**



**## Main goal**



**Do not build the dashboard from scratch.**



**Reuse the existing template structure and components as much as possible. The goal is to replace the demo content with my real application features while keeping the existing design system, spacing, layout, sidebar, and component style.**



**## Important rules**



**1. Do not redesign the whole application.**

**2. Do not create a new sidebar unless absolutely necessary.**

**3. Do not create new UI primitives if an existing component already exists.**

**4. Reuse existing shadcn/ui components.**

**5. Reuse existing cards, tables, dialogs, dropdowns, forms, badges, tabs, and layouts.**

**6. Keep the current file/folder structure unless there is a strong reason to change it.**

**7. Keep the UI clean, professional, and dashboard-like.**

**8. Prefer simple, maintainable code over clever abstractions.**

**9. Use TypeScript properly.**

**10. Do not add unnecessary dependencies.**

**11. Do not change unrelated files.**

**12. When creating a feature, first use mock data.**

**13. Keep backend/API calls isolated so they can be replaced later.**

**14. Use server components where reasonable, but client components when interactivity is needed.**

**15. Do not break existing routing, layout, or auth flow.**



**## Design direction**



**The app should feel like a real internal admin tool / SaaS dashboard:**



**- clean**

**- fast**

**- readable**

**- not over-designed**

**- no gradients unless already used by the template**

**- no glassmorphism**

**- no decorative AI-looking blobs**

**- strong tables and forms**

**- compact but not cramped**

**- good empty states**

**- good loading states**



**## Development approach**



**When I ask for a new feature:**



**1. Inspect the existing project structure first.**

**2. Find existing pages/components that can be reused.**

**3. Create the minimum required files.**

**4. Use mock data first.**

**5. Add types/interfaces.**

**6. Build the page using existing dashboard layout patterns.**

**7. Make sure it is responsive.**

**8. Make sure the code passes TypeScript.**

**9. Explain briefly what files were changed.**



**## Preferred feature structure**



**Use a structure similar to this when appropriate:**



**- feature page**

**- feature components**

**- feature data/mock data**

**- feature types**

**- feature actions/API wrapper later**



**Example:**



**src/features/reports/**

&#x20; **components/**

&#x20; **data/**

&#x20; **types.ts**



**But if the starter already uses a different pattern, follow the starter.**



**## Backend integration rule**



**For now, do not fully connect to a backend unless I explicitly ask.**



**Instead, create functions like:**



**- getReports()**

**- createReport()**

**- updateReport()**

**- deleteReport()**



**These should use mock data first, but be written in a way that can later be replaced with real fetch/API/database logic.**



**## First task**



**Inspect the project and tell me:**



**1. What routing structure it uses.**

**2. Where dashboard pages live.**

**3. Where sidebar/navigation items are defined.**

**4. Where reusable UI components live.**

**5. Where I should add new dashboard features.**

**6. What files I should avoid touching.**

**7. A short recommended plan for converting this starter into my own app.**

