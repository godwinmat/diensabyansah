# Diensabyansah Setup

This project contains a single Next.js storefront app.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

App URL: http://localhost:3000

## Optional Local Database

If you want a local Postgres instance for Prisma development:

```bash
docker-compose up -d
```

Default container: `diensabyansah-postgres` on `localhost:5432`.

## Common Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

## Catalog And Content Data

- Product, collection, and blog post records are stored directly in Prisma tables (`Product`, `Collection`, `ProductCollection`, and `BlogPost`).
- The storefront reads from Prisma for products, collections, and journal content.

Required environment variables:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=media-assets
```

Supabase Storage requirements:

- Create a public bucket matching `SUPABASE_STORAGE_BUCKET` (default: `media-assets`).
- Uploads use server-side `SUPABASE_SERVICE_ROLE_KEY`, so this key must only be available on the server.

## Local Authentication

- User accounts are stored in the Prisma `User` model.
- Session cookies are signed using `AUTH_SECRET`.
- Password reset codes are emailed via SMTP.

Required environment variables:

```bash
AUTH_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## Notes

- Checkout uses Flutterwave environment variables.
