This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## WordPress auth integration

This project proxies auth requests through Next.js API routes:

- `POST /api/auth/signup` → WordPress `POST /simple-jwt-login/v1/users`
- `POST /api/auth/signin` → WordPress JWT (`/simple-jwt-login/v1/auth`)
- `GET /api/auth/session` → returns `{ authenticated: boolean }` based on saved JWT cookie
- `POST /api/auth/logout` → WordPress JWT revoke (`/simple-jwt-login/v1/auth/revoke`) and clears auth cookie

Copy `.env.example` to `.env.local` and set values.

Notes:

- `signup` defaults to Simple JWT Login register endpoint. If you switch back to `/wp/v2/users`, admin Application Password credentials are required.
- `signin` is Simple JWT only and uses `WORDPRESS_JWT_TOKEN_PATH`.
- `logout` uses `WORDPRESS_JWT_REVOKE_PATH` and sends `{ JWT, AUTH_CODE? }`.
