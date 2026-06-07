# Vybrr — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 26 May 2026  
**Status:** Active  

---

## 1. Executive Summary

Vybrr is a Nigerian digital creative marketplace that connects clients who need high-quality creative services with independent creators who deliver them. The platform handles discovery, communication, secure payments, delivery, and creator withdrawals — all in one place.

The core value proposition:
- **For clients:** Find verified Nigerian creative talent fast, pay securely, get world-class work.
- **For creators:** Monetise your skills, manage your business, get paid instantly.
- **For Vybrr:** Earn a 10% commission on every transaction processed through the platform.

---

## 2. Problem Statement

Nigeria has one of Africa's largest pools of digital creative talent, yet:
- Creators struggle to find consistent, legitimate paying clients.
- Clients struggle to find, vet, and pay Nigerian creators securely.
- Off-platform transactions lead to fraud, non-payment, and disputes.
- Existing global platforms (Fiverr, Upwork) don't cater to NGN pricing, Nigerian payment methods, or the local creative culture.

Vybrr solves all of these problems in one cohesive platform built specifically for the Nigerian market.

---

## 3. Target Users

### Primary Users

| Persona | Description | Goals |
|---|---|---|
| **The Creator** | Nigerian freelance designer, editor, musician, developer, photographer aged 18–35 | Get consistent clients, get paid fairly and fast, grow their reputation |
| **The Client** | Business owner, startup, individual or brand manager who needs creative work | Find reliable talent quickly, pay safely, receive quality work on time |

### Secondary Users
- **Platform Admin (Vybrr team):** Monitor transactions, handle disputes, manage payouts and commissions.

---

## 4. Goals & Objectives

| Goal | Metric | Target |
|---|---|---|
| Creator monetisation | % of registered creators with at least 1 completed order | 40% within 6 months |
| Client retention | Repeat order rate | 35% within 6 months |
| Platform revenue | Monthly GMV (Gross Merchandise Value) | ₦10M+ by Month 6 |
| Trust | Average creator rating | 4.5+ stars |
| Speed | Time from sign-up to first Vyb published | < 10 minutes |

---

## 5. Core Features

### 5.1 Authentication & Onboarding
- Email/password signup and login
- Google OAuth (one-click sign-in)
- Role selection: Creator, Client, or Both
- Profile completion flow (display name, username, bio, skills, avatar)

### 5.2 Creator Profiles & Vybs
- Public creator profile with portfolio, reviews, rating, and active Vybs
- Creators publish "Vybs" (service listings) with:
  - Title, description, category, tags
  - Up to 3 pricing tiers (Basic / Standard / Premium)
  - Per-tier: price, delivery time, revision count, feature list
  - Category-based cover art (auto-generated)

### 5.3 Discovery & Explore
- Browse all published Vybs with category filtering and keyword search
- Debounced search for performance
- Responsive grid with category cover art per Vyb

### 5.4 Payment & Order Flow
- Client selects a package → writes brief → pays via Paystack
- Vybrr auto-deducts 10% platform commission
- 90% credited to creator's available balance
- Order created with status: `pending → in_progress → delivered → completed`
- Creator accepts order → works on it → submits delivery with files + note

### 5.5 Order Messaging
- Real-time chat per order (Supabase Realtime)
- Both client and creator can send messages
- File attachment support for deliverables
- Message history preserved throughout order lifecycle

### 5.6 Reviews & Ratings
- Clients leave 1–5 star ratings with comments after order completion
- Creator's average rating auto-updated on profile
- Reviews are public on creator profile

### 5.7 Creator Dashboard
- Earnings overview: Total Received, In Progress, Available to Withdraw
- Payments Received section: list of all paid orders with client info
- Orders management: accept, track, and manage all active orders
- Quick "Message Client" access from each order card
- My Vybs management: publish/unpublish, edit, create new

### 5.8 Withdrawal System
- Creator enters bank details (Nigerian bank + account number)
- Account name auto-resolved via Paystack bank resolve API
- Transfer initiated via Paystack (instant, to any Nigerian bank)
- Minimum withdrawal: ₦1,000
- Withdrawal history with status tracking (processing / completed / failed)

### 5.9 Client Dashboard
- All orders placed with status tracking
- Mark orders as complete
- Request revisions
- Leave reviews after completion
- View order details and chat history

### 5.10 Notifications
- Real-time notifications for: new order, order accepted, delivery received, order completed, message received
- Unread count badge in navbar
- Mark all as read

---

## 6. Platform Economics

| Event | Creator Receives | Vybrr Earns |
|---|---|---|
| Client pays ₦5,000 | ₦4,500 | ₦500 |
| Client pays ₦15,000 | ₦13,500 | ₦1,500 |
| Client pays ₦50,000 | ₦45,000 | ₦5,000 |

- Commission is **10% of every transaction**, deducted automatically before funds are available.
- Platform commission stays in the Vybrr Paystack balance, accessible to the platform owner at all times.
- No hidden fees. Creators always see their net earnings.

---

## 7. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Performance | Page load < 2 seconds on 4G |
| Uptime | 99.5% monthly |
| Security | HTTPS, Supabase RLS on all tables, Paystack PCI-DSS |
| Scalability | Supabase managed Postgres, auto-scaling edge functions |
| Mobile | Fully responsive, mobile-first design |
| Accessibility | WCAG 2.1 AA baseline |
| Dark mode | Full dark/light mode toggle, persisted in localStorage |

---

## 8. Out of Scope (v1)

- Mobile app (iOS / Android)
- Pre-order messaging between clients and creators
- Creator subaccounts (automatic split payments via Paystack)
- Subscription plans or creator tiers with reduced commission
- Multi-currency support
- Video calls / live consultations
- Affiliate / referral programme

---

## 9. Success Metrics

| Metric | How Measured |
|---|---|
| GMV | Sum of all order amounts in Supabase `orders` table |
| Platform Revenue | GMV × 10% |
| Active Creators | Creators with ≥1 published Vyb |
| Order Completion Rate | Completed orders / Total orders |
| Average Rating | Mean of all reviews |
| Withdrawal Volume | Sum of `withdrawals.amount` where status = completed |
