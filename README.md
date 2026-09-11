# Welth — AI-Powered Expense Handler

An AI-assisted personal finance tracker. Users sign up, create one or more accounts (Cash, Bank, etc.), log income and expenses against them (manually or by scanning a receipt), set a monthly budget, and get automated email alerts and AI-generated spending insights.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Styling / UI | Tailwind CSS, shadcn/ui (Radix primitives), Recharts |
| Auth | Clerk |
| Database / ORM | PostgreSQL + Prisma |
| AI | Google Gemini (`gemini-2.5-flash`) — receipt OCR + monthly insights |
| Background jobs / cron | Inngest |
| Email | Resend + React Email |
| Security | Arcjet (bot detection, shield, rate limiting) |
| Forms / validation | React Hook Form + Zod |

## Architecture Note

There is no separate REST API layer. All data mutations and reads go through **Next.js Server Actions** (`"use server"` functions under `/action`), called directly from client components — e.g. `createTransaction`, `getUserAccounts`, `scanReceipt`, `updateBudget`.

## Authentication & Account Creation

- Login/signup UI is Clerk's `<SignIn/>` / `<SignUp/>` components — no custom auth logic.
- `middleware.js` protects `/dashboard`, `/account`, and `/transaction`. Arcjet (bot detection + shield) runs first in the middleware chain, then Clerk checks the session and redirects unauthenticated users to sign-in.
- On first login, `checkUser()` (`lib/checkUser.js`) looks up the Clerk user by `clerkUserId` in our own Postgres `User` table and creates a row (name, email, image synced from Clerk) if one doesn't exist yet — this is what links Clerk's identity to our app data.

## User Flow

1. Sign up / log in via Clerk → redirected to `/dashboard`.
2. Create a financial account (name, type — Current/Savings, opening balance, optionally set as default) via a drawer form.
3. Add transactions (income/expense) manually, or scan a receipt with the camera — Gemini reads the image and auto-fills amount, date, merchant, description, and category.
4. Set a monthly budget once a default account exists.
5. Dashboard shows budget usage, recent transactions, and a spending-by-category pie chart.
6. Recurring transactions (e.g. monthly rent) auto-regenerate on schedule without manual re-entry.
7. Budget alert emails and AI-generated monthly report emails arrive automatically in the background.

## Database Schema (Prisma)

Models: `User`, `Account`, `Transaction`, `Budget`.

- A `User` has many `Account`s and `Transaction`s.
- An `Account` has many `Transaction`s, with `onDelete: Cascade` — deleting an account deletes its transactions automatically at the DB level.
- Money fields (`balance`, `amount`) are stored as `Decimal` and converted to plain numbers before being sent to the client, since Decimal isn't JSON-serializable.

## Major Features

- **Account cards** — balance, income/expense indicators, toggle default account, delete account (cascades transactions).
- **Budget progress** — amount spent vs. budget, percentage used, color-coded status.
- **Recent transactions + expense breakdown pie chart** per account.
- **Transaction table** — search, filter by type/recurring status, sortable columns, bulk delete.
- **AI receipt scanning** — image → Gemini extracts structured JSON → pre-fills the transaction form.
- **Recurring transactions** — daily/weekly/monthly/yearly intervals, processed by an Inngest cron job.
- **Budget alert emails** — an Inngest cron job runs every 6 hours, checks budget usage against the default account's monthly expenses, and emails the user via Resend once a threshold is crossed (once per month).
- **Monthly AI reports** — a monthly cron job aggregates each user's spending and asks Gemini to generate 3 concise, actionable insights, emailed as a report.

## Validation & Error Handling

- Zod schemas validate account/transaction forms client-side through `react-hook-form`'s resolver (required fields, positive numeric amounts, conditional validation — e.g. a recurring interval is required only when "is recurring" is checked).
- Server actions independently re-verify ownership (`userId` match) and business rules (e.g. blocking an expense that would push a balance negative) before writing to the database, so validation isn't purely client-side.
- Errors are caught with `try/catch`, returned as `{ success: false, error }` or thrown, and surfaced to the user as toast notifications (`sonner`).

## Notable Technical Decisions

- **Decimal serialization** — Prisma's `Decimal` type can't cross the server/client boundary as JSON, so every action explicitly converts `amount`/`balance` to numbers before returning.
- **Balance consistency** — every transaction create/update/delete recalculates the account balance inside a Prisma `$transaction`, so the transaction record and account balance never drift apart.
- **Rate limiting** — Arcjet's token-bucket limiter guards transaction creation against abuse.
- **AI output reliability** — Gemini is prompted to return strict JSON; the response is stripped of markdown code fences and parsed defensively, with a fallback if parsing fails.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

Required environment variables include Clerk keys, `DATABASE_URL`/`DIRECT_URL` (Postgres), `ARCJET_KEY`, `GEMINI_API_KEY`, and `RESEND_API_KEY`.
