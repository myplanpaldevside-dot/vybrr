# Vybrr — Functional Requirements Document (FRD)

**Version:** 1.0  
**Date:** 26 May 2026  
**Status:** Active  
**Related:** PRD v1.0

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│         React 18 + Vite + TypeScript + Tailwind CSS          │
│         shadcn/ui · Framer Motion · React Query              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS / WSS
┌────────────────────────▼────────────────────────────────────┐
│                     Supabase                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Postgres   │  │   Realtime   │  │  Storage (files)  │  │
│  │  + RLS      │  │  (channels)  │  │                   │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Edge Functions (Deno)                   │    │
│  │  paystack-webhook · paystack-transfer                │    │
│  │  paystack-resolve-account                            │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │ REST / Webhook
┌────────────────────────▼────────────────────────────────────┐
│                     Paystack API                             │
│  Inline.js (payment) · Transfer API · Bank Resolve API       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite 5 + TypeScript |
| Styling | Tailwind CSS 3, shadcn/ui, CSS custom properties |
| Animations | Framer Motion |
| State / data fetching | React Query (TanStack Query v5) |
| Routing | React Router v6 |
| Backend / DB | Supabase (PostgreSQL 15, PostgREST, RLS) |
| Real-time | Supabase Realtime (websockets) |
| File storage | Supabase Storage |
| Serverless | Supabase Edge Functions (Deno) |
| Payments | Paystack (Inline.js + REST API) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Theme | CSS variables + `darkMode: ["class"]`, localStorage |

---

## 3. User Roles & Permissions

| Role | Description | Key Permissions |
|---|---|---|
| **Guest** | Unauthenticated visitor | Browse landing page, Explore (view only), public creator profiles |
| **Client** | Authenticated user who buys services | Place orders, pay, message creators, leave reviews, mark complete |
| **Creator** | Authenticated user who sells services | Publish Vybs, accept orders, deliver work, withdraw earnings |
| **Both** | User registered as both roles | All client + creator permissions; single account |
| **Platform Admin** | Vybrr team (Supabase admin) | Full DB access, dispute resolution, payout management |

A user selects their role during onboarding. The `profiles.role` field stores `client`, `creator`, or `both`. Role-based UI branches are rendered based on this value.

---

## 4. Data Models

### 4.1 `profiles`
```sql
id           uuid PRIMARY KEY REFERENCES auth.users(id)
username     text UNIQUE NOT NULL
display_name text
bio          text
avatar_url   text
location     text
role         text CHECK (role IN ('client','creator','both'))
skills       text[]
is_pro       boolean DEFAULT false
rating       numeric(3,2) DEFAULT 0
review_count integer DEFAULT 0
created_at   timestamptz DEFAULT now()
```

### 4.2 `categories`
```sql
id    uuid PRIMARY KEY
name  text NOT NULL
slug  text UNIQUE NOT NULL
icon  text
```

### 4.3 `vybs`
```sql
id            uuid PRIMARY KEY
creator_id    uuid REFERENCES profiles(id)
category_id   uuid REFERENCES categories(id)
title         text NOT NULL
description   text
tags          text[]
status        text DEFAULT 'draft' CHECK (status IN ('draft','published','paused'))
basic_price      numeric(10,2)
basic_delivery   integer        -- days
basic_revisions  integer
basic_features   text[]
standard_price      numeric(10,2)
standard_delivery   integer
standard_revisions  integer
standard_features   text[]
premium_price      numeric(10,2)
premium_delivery   integer
premium_revisions  integer
premium_features   text[]
media_url     text
created_at    timestamptz DEFAULT now()
updated_at    timestamptz DEFAULT now()
```

### 4.4 `orders`
```sql
id               uuid PRIMARY KEY
vyb_id           uuid REFERENCES vybs(id)
client_id        uuid REFERENCES profiles(id)
creator_id       uuid REFERENCES profiles(id)
tier             text CHECK (tier IN ('basic','standard','premium'))
amount           numeric(10,2) NOT NULL       -- full client payment
platform_fee     numeric(10,2) NOT NULL       -- 10% retained by Vybrr
creator_earnings numeric(10,2) NOT NULL       -- 90% credited to creator
status           text DEFAULT 'pending'
  CHECK (status IN ('pending','in_progress','delivered','completed','cancelled','disputed'))
brief            text
delivery_note    text
paystack_ref     text UNIQUE
delivery_date    date
revision_count   integer DEFAULT 0
created_at       timestamptz DEFAULT now()
completed_at     timestamptz
```

### 4.5 `order_messages`
```sql
id         uuid PRIMARY KEY
order_id   uuid REFERENCES orders(id)
sender_id  uuid REFERENCES profiles(id)
content    text
file_url   text
file_name  text
is_read    boolean DEFAULT false
created_at timestamptz DEFAULT now()
```

### 4.6 `reviews`
```sql
id         uuid PRIMARY KEY
order_id   uuid REFERENCES orders(id) UNIQUE
reviewer_id uuid REFERENCES profiles(id)
creator_id  uuid REFERENCES profiles(id)
rating     integer CHECK (rating BETWEEN 1 AND 5)
comment    text
created_at timestamptz DEFAULT now()
```

### 4.7 `withdrawals`
```sql
id              uuid PRIMARY KEY
creator_id      uuid REFERENCES profiles(id)
amount          numeric(10,2) NOT NULL
bank_name       text NOT NULL
bank_code       text NOT NULL
account_number  text NOT NULL
account_name    text NOT NULL
status          text DEFAULT 'processing'
  CHECK (status IN ('processing','pending','completed','failed'))
paystack_transfer_code text
paystack_recipient_code text
failure_reason  text
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

### 4.8 `notifications`
```sql
id         uuid PRIMARY KEY
user_id    uuid REFERENCES profiles(id)
type       text NOT NULL
title      text NOT NULL
body       text
link       text
is_read    boolean DEFAULT false
created_at timestamptz DEFAULT now()
```

### 4.9 `contact_messages`
```sql
id         uuid PRIMARY KEY
name       text NOT NULL
email      text NOT NULL
subject    text NOT NULL
message    text NOT NULL
created_at timestamptz DEFAULT now()
```

---

## 5. Row-Level Security (RLS) Policies

| Table | Policy | Rule |
|---|---|---|
| `profiles` | SELECT | Anyone can read public profiles |
| `profiles` | UPDATE | Only own profile |
| `vybs` | SELECT | Anyone can read published vybs; creator can read own drafts |
| `vybs` | INSERT/UPDATE/DELETE | Creator only, on own vybs |
| `orders` | SELECT | client_id = auth.uid() OR creator_id = auth.uid() |
| `orders` | INSERT | client_id = auth.uid() |
| `orders` | UPDATE | client_id or creator_id depending on field |
| `order_messages` | SELECT | order participants only |
| `order_messages` | INSERT | order participants only |
| `reviews` | SELECT | Public |
| `reviews` | INSERT | client_id on completed order only |
| `withdrawals` | SELECT/INSERT | creator_id = auth.uid() |
| `notifications` | SELECT/UPDATE | user_id = auth.uid() |

---

## 6. Authentication Module

### 6.1 Email / Password Registration
- **Input:** email, password (≥8 chars), role (client/creator/both)
- **Flow:** `supabase.auth.signUp()` → email confirmation → redirect to `/onboarding`
- **Validation:** email format, password strength, duplicate email check
- **Error states:** "Email already in use", "Password too short", server error

### 6.2 Google OAuth
- **Flow:** `supabase.auth.signInWithOAuth({ provider: 'google' })` → Google consent screen → callback → check if profile exists → redirect to `/onboarding` (new) or `/dashboard` (returning)
- **Scopes required:** email, profile

### 6.3 Login
- **Input:** email, password
- **Flow:** `supabase.auth.signInWithPassword()` → on success, redirect to `/dashboard`
- **Error states:** "Invalid credentials", "Email not confirmed"
- **Show/hide password toggle**

### 6.4 Forgot Password
- `supabase.auth.resetPasswordForEmail()` → email sent → user clicks link → `/reset-password` page → `supabase.auth.updateUser({ password })`

### 6.5 Session Management
- `AuthProvider` wraps entire app, subscribes to `supabase.auth.onAuthStateChange`
- Session persisted via Supabase's built-in localStorage mechanism
- Unauthenticated users accessing protected routes → redirect to `/login`

---

## 7. Onboarding Module

**Route:** `/onboarding`  
**Access:** Authenticated users without a completed profile  

### Steps (multi-step form):
1. **Role selection** — Client / Creator / Both (stored to `profiles.role`)
2. **Basic info** — Display name, username (unique, validated real-time), location
3. **Profile photo** — Upload to Supabase Storage at `avatars/{user_id}`; public URL stored in `profiles.avatar_url`
4. **Creator-only:** Bio, skills (multi-select tag input), category preferences
5. **Completion** — `profiles.onboarded = true`; redirect to `/dashboard`

**Validation:**
- Username: 3–20 chars, alphanumeric + underscore, unique
- Display name: 2–50 chars
- Skills: max 10

---

## 8. Creator Profile Module

**Route:** `/creator/:username`  
**Access:** Public

### Displayed Data:
- Avatar, display name, username, location, bio, skills, Pro badge (if `is_pro = true`)
- Star rating + review count
- Published Vybs grid (VybCover + title + starting price)
- Reviews list (avatar, name, rating stars, comment, date)

### VybCover Logic (category-based covers):
| Category | Gradient | Icon |
|---|---|---|
| Design / Branding | Violet → Purple | Palette |
| Video / Editing | Red → Orange | Film |
| Music / Audio | Purple → Cyan | Music |
| Writing / Copywriting | Amber → Orange | PenTool |
| Development / Code | Cyan → Blue | Code2 |
| Photography | Pink → Rose | Camera |
| Animation / Motion | Green → Teal | Sparkles |
| Default | Slate → Gray | Layers |

---

## 9. Vyb Management Module

### 9.1 Create Vyb
**Route:** `/dashboard/creator/vybs/new`

**Fields:**
- Title (required, max 80 chars)
- Category (required, select from `categories` table)
- Description (required, min 50 chars, max 1000 chars)
- Tags (up to 5 tags)
- Pricing tiers (Basic required; Standard + Premium optional):
  - Price (NGN, min ₦500)
  - Delivery time (days, 1–90)
  - Revision count (0–unlimited)
  - Feature list (up to 8 bullet points per tier)

**On save:**
- Status defaults to `published`
- `creator_id` = auth user
- `updated_at` = now()

### 9.2 Edit Vyb
**Route:** `/dashboard/creator/vybs/:id/edit`  
All same fields editable. Autosave drafts to `localStorage` keyed by `vyb-draft-{id}`.

### 9.3 Publish / Unpublish
Toggle `status` between `published` and `paused`. Only published Vybs appear in Explore.

### 9.4 Delete Vyb
Soft-delete (status = `archived`) if Vyb has associated orders; hard-delete otherwise. Confirm modal required.

---

## 10. Explore / Discovery Module

**Route:** `/explore`  
**Access:** Public

### Features:
- **Grid view:** 3 cols desktop / 2 cols tablet / 1 col mobile
- **Category filter:** Pills/tabs for each category. "All" selected by default
- **Keyword search:** Debounced 400ms. Searches Vyb title, description, creator username
- **Sorting:** Relevance (default), Newest, Price: Low→High, Price: High→Low, Highest Rated
- **VybCover** per Vyb card: category-based gradient + icon
- **Vyb card data:** Cover, Creator avatar+name, Vyb title, Starting price, Rating

### Search Query:
```sql
SELECT v.*, p.display_name, p.avatar_url, p.rating, c.slug as category_slug
FROM vybs v
JOIN profiles p ON p.id = v.creator_id
LEFT JOIN categories c ON c.id = v.category_id
WHERE v.status = 'published'
  AND (v.title ILIKE '%{term}%' OR v.description ILIKE '%{term}%' OR p.username ILIKE '%{term}%')
  AND (c.slug = '{category}' OR '{category}' = 'all')
ORDER BY v.created_at DESC
```

---

## 11. Payment & Order Flow

### 11.1 Order Initiation
**Route:** `/vyb/:id` → Order dialog  

1. Client selects tier (Basic / Standard / Premium)
2. Client enters project brief (required, min 20 chars)
3. Client clicks "Proceed to Payment"

### 11.2 Paystack Inline Payment
```javascript
PaystackPop.setup({
  key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  email: user.email,
  amount: price * 100,  // in kobo
  currency: 'NGN',
  ref: `vybrr_${orderId}_${Date.now()}`,
  callback: (response) => handlePaymentSuccess(response),
  onClose: () => setPaymentCancelled(true)
})
```

### 11.3 Commission Calculation (10%)
```typescript
const amount = Number(selectedTier.price);
const platform_fee = Math.round(amount * 0.10 * 100) / 100;    // 10% to Vybrr
const creator_earnings = Math.round(amount * 0.90 * 100) / 100; // 90% to Creator
```

**Flow:**
- Client pays full `amount` to Vybrr's Paystack account
- Platform retains `platform_fee` (10%) automatically in its Paystack balance
- `creator_earnings` (90%) is tracked in the database, available for creator withdrawal
- No money is split or transferred at payment time — split is accounting-only until withdrawal

### 11.4 Order Record Creation
```sql
INSERT INTO orders (
  vyb_id, client_id, creator_id, tier,
  amount, platform_fee, creator_earnings,
  status, brief, paystack_ref, delivery_date
) VALUES (...)
```

### 11.5 Order Status Machine
```
pending → in_progress → delivered → completed
           ↓                ↓
        cancelled        disputed
```

| Transition | Triggered By | Conditions |
|---|---|---|
| pending → in_progress | Creator clicks "Accept Order" | Order in `pending` state |
| in_progress → delivered | Creator submits delivery | Files uploaded + delivery note |
| delivered → completed | Client clicks "Mark Complete" OR auto after 7 days | |
| delivered → in_progress | Client requests revision | Revisions remaining > 0 |
| * → disputed | Client raises dispute | Within 7 days of delivery |
| * → cancelled | Creator declines / mutual cancel | — |

---

## 12. Order Detail & Messaging Module

**Route:** `/order/:id`  
**Access:** Participants only (RLS enforced)

### Layout:
- Left panel: Order info (Vyb, tier, brief, status, delivery date, amount)
- Right panel: Real-time chat

### Messaging:
- Supabase Realtime subscription on `order_messages` filtered by `order_id`
- Message bubble: sender avatar, message text, timestamp
- File attachment: upload to `Supabase Storage: deliveries/{order_id}/{filename}`, send URL as message
- Read receipts: mark messages as `is_read = true` when recipient opens the order

### Delivery Submission (Creator):
- Upload file(s) to storage
- Enter delivery note (required)
- Submit → order status → `delivered`
- Notification sent to client

### Revision Request (Client):
- Available when `status = 'delivered'` and `revision_count < tier_revisions`
- Sends message explaining revision needed
- Order status → `in_progress`, `revision_count + 1`

---

## 13. Creator Dashboard Module

**Route:** `/dashboard/creator`  
**Access:** Creator or Both role only

### Sections:

#### 13.1 Earnings Overview
```
Total Received    = SUM(creator_earnings) WHERE status IN ('completed','delivered','in_progress')
In Progress       = SUM(creator_earnings) WHERE status IN ('in_progress','delivered')
Available to Withdraw = SUM(creator_earnings) WHERE status = 'completed'
                      MINUS SUM(withdrawals.amount) WHERE status IN ('completed','processing')
```

#### 13.2 Payments Received
- 5 most recent paid orders
- Per item: client avatar, display name, Vyb title, date, +₦creator_earnings, status badge, MessageCircle button
- "View All" link to full payments list

#### 13.3 Orders Management
- All active orders (not cancelled/completed) by default
- Filter by status (tabs: All / Pending / In Progress / Delivered)
- Per card: Vyb title, client name, status badge, amount, delivery date, action buttons (Accept / View / Message Client)

#### 13.4 My Vybs
- All creator's Vybs (published + drafts)
- Toggle publish/pause
- Edit button → `/dashboard/creator/vybs/:id/edit`
- Create New button → `/dashboard/creator/vybs/new`

---

## 14. Withdrawal Module

**Route:** Creator Dashboard → Withdraw Dialog  
**Minimum withdrawal:** ₦1,000  
**Maximum per request:** No cap (limited by available balance)

### Flow:
1. Creator enters amount, selects Nigerian bank (dropdown from Paystack `/bank` endpoint)
2. Creator enters 10-digit account number
3. System auto-resolves account name via `paystack-resolve-account` edge function (triggers on 10-digit input)
4. Account name displayed for confirmation (editable if resolve fails)
5. Creator clicks "Withdraw"
6. `paystack-transfer` edge function:
   a. Create Paystack Transfer Recipient (POST `/transferrecipient`)
   b. Initiate Transfer (POST `/transfer`)
   c. Insert record into `withdrawals`
7. Status displayed: Processing / Pending (if OTP required) / Failed

### Edge Function: `paystack-resolve-account`
- **Auth:** Supabase JWT (requires authenticated user)
- **Input:** `{ account_number, bank_code }`
- **Calls:** `GET https://api.paystack.co/bank/resolve?account_number=X&bank_code=Y`
- **Returns:** `{ account_name, account_number }`
- **Errors:** 404 "Account not found", 400 validation, 500 Paystack error

### Edge Function: `paystack-transfer`
- **Auth:** Supabase JWT (requires authenticated user)
- **Input:** `{ amount, account_number, bank_code, account_name, bank_name }`
- **Steps:**
  1. Validate amount ≥ 1000
  2. Check available balance in DB
  3. Create recipient: POST `https://api.paystack.co/transferrecipient`
  4. Initiate transfer: POST `https://api.paystack.co/transfer`
  5. Insert withdrawal record
- **Returns:** `{ success, transfer_code, status }`
- **OTP handling:** If Paystack requires OTP, status = `pending`; otherwise `processing`

---

## 15. Client Dashboard Module

**Route:** `/dashboard/client`  
**Access:** Client or Both role only

### Sections:

#### 15.1 My Orders
- All orders placed by client
- Filter by status
- Per card: Vyb cover thumbnail, Vyb title, creator avatar+name, status badge, amount, delivery date, action buttons

#### 15.2 Order Actions (per status)
| Status | Available Actions |
|---|---|
| `pending` | Cancel Order |
| `in_progress` | Message Creator, View Order |
| `delivered` | Mark Complete, Request Revision, Raise Dispute, Message Creator |
| `completed` | Leave Review (if not already), View Order |

---

## 16. Reviews & Ratings Module

### Leave Review
- Triggered from: Client Dashboard → completed order → "Leave Review"
- Input: 1–5 star rating (required), comment (optional, max 500 chars)
- One review per order (`UNIQUE` constraint on `reviews.order_id`)
- On submission:
  - Insert into `reviews`
  - Recalculate `profiles.rating`:
    ```sql
    UPDATE profiles SET
      rating = (SELECT AVG(rating) FROM reviews WHERE creator_id = $1),
      review_count = (SELECT COUNT(*) FROM reviews WHERE creator_id = $1)
    WHERE id = $1;
    ```

### Display
- On `/creator/:username`: all reviews, paginated 10/page, sorted newest first
- Star rating shown as filled/empty stars with numeric average and count

---

## 17. Notifications Module

### Notification Types & Triggers
| Type | Trigger | Recipient |
|---|---|---|
| `new_order` | Order created | Creator |
| `order_accepted` | Creator accepts order | Client |
| `delivery_received` | Creator submits delivery | Client |
| `order_completed` | Client marks complete or auto | Creator |
| `message_received` | New order message | Other participant |
| `review_received` | Client leaves review | Creator |
| `withdrawal_completed` | Transfer confirmed | Creator |
| `revision_requested` | Client requests revision | Creator |

### Implementation:
- Supabase database trigger (or Edge Function) inserts into `notifications` on each event
- Frontend: Supabase Realtime subscription on `notifications WHERE user_id = auth.uid()`
- Navbar: unread count badge (red dot) on Bell icon
- Dropdown: list of 10 most recent notifications with relative timestamps
- Mark all as read: sets `is_read = true` for all user's notifications

---

## 18. Settings Module

**Route:** `/settings`  
**Access:** Authenticated users only

### Sections:

#### 18.1 Profile Settings
- Display name, username, bio, location, avatar upload
- Skills (creator only)
- Save → `UPDATE profiles SET ...`

#### 18.2 Account Settings
- Email address (read-only, managed via Supabase Auth)
- Change password: current password + new password + confirm

#### 18.3 Notification Preferences
- Toggle email notifications for each notification type
- Stored in `profiles.notification_preferences JSONB`

---

## 19. Help Center Module

**Route:** `/help`  
**Access:** Public

### Features:
- Search bar: filters FAQs in real time across all categories
- Category tabs: Getting Started, Payments, Orders, For Creators, Account & Settings, Messaging
- FAQ accordion (one open at a time within each category)
- "Contact Us" CTA at bottom

### FAQ Data (inline, static):
- ~30 questions across 6 categories
- Covers: sign-up, Vyb creation, payment flow, withdrawal, order lifecycle, disputes, messaging, account management

---

## 20. Contact Module

**Route:** `/contact`  
**Access:** Public

### Contact Form:
- Name (required)
- Email (required, validated)
- Subject (Select: General Inquiry / Creator Support / Payment Issue / Technical Problem / Report a User / Other)
- Message (required, min 20 chars, max 2000 chars)

### Submission Flow:
1. Validate all fields
2. Insert into `contact_messages` table
3. Show success state with animated checkmark
4. Fallback: if insert fails, `mailto:support@vybrr.ng` link shown

---

## 21. Platform Pages

| Route | Purpose | Access |
|---|---|---|
| `/` | Landing page with hero, features, how-it-works, CTA | Public |
| `/explore` | Browse all Vybs | Public |
| `/creator/:username` | Creator public profile + Vybs | Public |
| `/vyb/:id` | Vyb detail + order placement | Public (order requires auth) |
| `/login` | Sign in | Guest only |
| `/signup` | Register | Guest only |
| `/onboarding` | Profile setup | New authenticated user |
| `/dashboard` | Role-based redirect to client or creator dashboard | Authenticated |
| `/dashboard/client` | Client order management | Client/Both |
| `/dashboard/creator` | Creator earnings + orders + Vybs | Creator/Both |
| `/dashboard/creator/vybs/new` | Create new Vyb | Creator/Both |
| `/dashboard/creator/vybs/:id/edit` | Edit existing Vyb | Creator/Both (own Vybs) |
| `/order/:id` | Order detail + chat | Order participants |
| `/settings` | Profile and account settings | Authenticated |
| `/help` | FAQ and support articles | Public |
| `/contact` | Contact form | Public |
| `/privacy` | Privacy Policy | Public |
| `/terms` | Terms of Service | Public |
| `*` | 404 Not Found | Public |

---

## 22. Theme System

### Implementation
- `ThemeProvider` in `src/contexts/ThemeContext.tsx`
- Reads: `localStorage.getItem("vybrr-theme")` → OS preference → default `light`
- Applies: `document.documentElement.classList.toggle("dark", theme === "dark")`
- Persists: `localStorage.setItem("vybrr-theme", theme)` on every change
- Toggle component: `<ThemeToggle />` in navbar (Moon / Sun icon button)

### CSS Variables
```css
/* Light mode — default */
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--primary: 262 83% 58%;   /* violet */

/* Dark mode (.dark class) */
--background: 240 15% 8%;
--foreground: 240 5% 96%;
--primary: 262 83% 65%;
```

---

## 23. Edge Function Specifications

### `paystack-resolve-account`
| Attribute | Value |
|---|---|
| Method | POST |
| Auth | Supabase JWT required |
| Input | `{ account_number: string, bank_code: string }` |
| Paystack endpoint | `GET /bank/resolve` |
| Success response | `{ account_name: string, account_number: string }` |
| Error response | `{ error: string }` with HTTP 4xx/5xx |

### `paystack-transfer`
| Attribute | Value |
|---|---|
| Method | POST |
| Auth | Supabase JWT required |
| Input | `{ amount: number, account_number, bank_code, account_name, bank_name }` |
| Steps | Create recipient → Initiate transfer → Insert withdrawal record |
| Success response | `{ success: true, transfer_code: string, status: string }` |
| Error response | `{ error: string }` |

### `paystack-webhook` (planned)
| Attribute | Value |
|---|---|
| Trigger | Paystack sends POST to `/functions/v1/paystack-webhook` |
| Events handled | `transfer.success`, `transfer.failed`, `charge.success` |
| Actions | Update `withdrawals.status`, send notification, update `orders.status` |
| Security | Verify `x-paystack-signature` HMAC header |

---

## 24. Non-Functional Requirements

| Requirement | Specification | Implementation |
|---|---|---|
| Performance | Page load < 2s on 4G | Vite code splitting, React Query caching, image lazy loading |
| Uptime | 99.5% monthly | Supabase managed infrastructure + Vercel/Netlify CDN |
| Security | HTTPS, RLS on all tables, no secret keys in frontend | Supabase RLS, Edge Functions for secret key operations |
| Mobile | Fully responsive, mobile-first | Tailwind responsive prefixes, tested on 375px+ viewports |
| Accessibility | WCAG 2.1 AA baseline | shadcn/ui (Radix primitives), semantic HTML, ARIA labels |
| Dark mode | Full dark/light with persistence | ThemeContext + CSS variables + localStorage |
| SEO | Page titles and meta descriptions | `PageMeta` component per route |
| Error handling | User-friendly error messages | React Query error states, toast notifications, inline errors |
| Scalability | Auto-scaling | Supabase managed Postgres, Edge Functions serverless |

---

## 25. Commission Architecture

### Revenue Flow
```
Client pays ₦X (full amount)
         │
         ▼
Paystack processes payment → funds land in Vybrr's Paystack account
         │
         ├─── 10% (₦X × 0.10) stays in Vybrr Paystack balance (platform revenue)
         │
         └─── 90% (₦X × 0.90) recorded as creator_earnings in orders table
                   │
                   └─── Creator requests withdrawal → paystack-transfer edge function
                             → transfers exactly the earned amount to creator's bank
```

### Database Accounting
- `orders.amount` = full client payment
- `orders.platform_fee` = `ROUND(amount * 0.10, 2)`
- `orders.creator_earnings` = `ROUND(amount * 0.90, 2)`
- `withdrawals.amount` = what creator withdraws (≤ available balance)
- Available balance = `SUM(creator_earnings on completed orders)` − `SUM(completed withdrawals)`

### Commission Displayed
- Creator dashboard always shows **net earnings** (after commission)
- No hidden deductions — `creator_earnings` is what creator sees and expects
- Commission line item visible in order detail view for full transparency

---

## 26. File Storage Structure

```
Supabase Storage
├── avatars/
│   └── {user_id}           # Profile photos
├── deliveries/
│   └── {order_id}/
│       └── {filename}      # Order delivery files
└── vybs/
    └── {vyb_id}/
        └── {filename}      # Optional Vyb portfolio media
```

**Bucket policies:**
- `avatars`: Public read, authenticated write (own folder only)
- `deliveries`: Private, order participants only
- `vybs`: Public read, creator write (own Vyb only)

---

## 27. Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend `.env` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend `.env` | Supabase anonymous key |
| `VITE_PAYSTACK_PUBLIC_KEY` | Frontend `.env` | Paystack inline.js key |
| `PAYSTACK_SECRET_KEY` | Supabase secrets | Paystack API calls (Edge Functions only) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | Admin DB operations (auto-injected) |

---

## 28. Deployment

| Component | Platform | Notes |
|---|---|---|
| Frontend | Lovable (auto-deploy) / Vercel | Build: `npm run build` |
| Database | Supabase (managed) | Migrations via SQL editor |
| Edge Functions | Supabase | `supabase functions deploy {name} --project-ref {ref}` |
| Secrets | Supabase dashboard | `npx supabase secrets set KEY=value --project-ref {ref}` |
| Domain | Custom via Lovable/Vercel | `vybrr.ng` |

---

*This FRD is a living document and will be updated as features evolve. Version-controlled alongside the codebase.*
