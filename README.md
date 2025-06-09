# – Multi-Tenant Ticketing Platform

This project is the backend core for **StagePass**, a multi-tenant event ticketing system built with [Payload CMS](https://payloadcms.com), [Next.js](https://nextjs.org), and MongoDB. It allows each tenant (organization) to manage their own ticket shop, events, reservations, and settings, all within a scalable and customizable system.

---

## 🚀 Quick Start

### 1. **Install dependencies**
```bash
pnpm install
```

### 2. **Run database migration** (creates initial roles, users, tenant, etc.)
```bash
pnpm dev
```
*On first run, the migration will seed basic data.*

### 3. **Open the admin panel**
Go to: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 👤 Default Credentials

When running the seed migration, the following user is created:

- **Super Admin**
  - Email: `jonas@covonet.be`
  - Password: `test1234`
  - Role: `Super Admin` (can manage everything)

---

## 🏗️ Structure Overview

- **Multi-Tenancy** is handled through a `Tenants` collection, with each tenant having:
  - Their own `Shops` (can be renamed to `Venues` or `Organizations` later)
  - Their own branding, SMTP settings, users, and reservations

- **Users** can be scoped to specific tenants with different `Roles`
- **Reservations** track bookings for events or seats
- **Customers** store ticket buyer info (for marketing, loyalty, or future upselling)
- **Email & SMTP** collections support white-label delivery per tenant

---

## ✉️ Email Setup

Email delivery is handled by `nodemailer`.  
You can customize SMTP settings per tenant via the admin panel.

> Default from: `no-reply@stagepass.io`

---

## 🌐 Domain-based Tenant Routing (optional)

The system is ready for domain-based tenant separation (e.g. `theater1.stagepass.io`, `concertco.stagepass.io`).  
You can assign a custom domain to each tenant and scope access accordingly.

---

## 🔐 Access Control

StagePass uses RBAC with:
- `Super Admin`: sees everything
- `Tenant Admin`: scoped to their own tenant’s data
- `Staff`: customizable roles coming soon (e.g. scanner-only access)

You can configure fine-grained access per collection or document using Payload’s built-in [Access Control](https://payloadcms.com/docs/access-control/overview).

---

## 💻 Front-end

The StagePass front-end is powered by Next.js and lives in a separate repo or subfolder (TBD).  
This repo focuses on the Payload backend.

You can preview frontend pages under `src/app/`, or embed the shop interface via iframe into an organizer’s website.

## 📱 Mobile Scanner

The `mobile` folder contains an Expo app for scanning tickets. Run `pnpm install` inside the folder and start the app with `pnpm start`. Set `EXPO_PUBLIC_API_URL` to point to your backend if it's not running on `http://localhost:3000`.
The app now includes a `babel.config.js` file so the Metro bundler starts correctly.

---

## 🔧 Dev Tools

- Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)
- GraphQL Playground: [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql)

## 💰 Mollie Payments

This project includes a basic [Mollie](https://www.mollie.com) integration.
Create a **Payment Method** in the admin panel and enter your Mollie API keys per shop.
Assign the desired Payment Method on each order. The `/api/createPayment` endpoint
will use those credentials to create the payment and `/api/mollieWebhook` will
update the order status.

---

## 📚 Resources

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Payload Discord](https://discord.gg/payload)
- [StagePass Planning Board](https://www.notion.so/) *(link coming soon)*

---

## 📦 Deployment

- Payload CMS works great on Vercel (frontend) + Render or Railway (backend)
- MongoDB Atlas recommended for database hosting
- Make sure to configure SMTP and secret keys in your `.env`

