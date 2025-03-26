This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, set up your environment variables:

1. Copy the `.env.example` file to `.env.local`
2. Update the variables in `.env.local` as needed

```bash
cp .env.example .env.local
```

Next, start your PocketBase server:

```bash
# Example - you might need to adjust this depending on your PocketBase setup
./pocketbase serve
```

Then, run the development server:

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

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## PocketBase Integration

This project uses [PocketBase](https://pocketbase.io/) as its backend. The form is configured to work with a specific collection schema:

- Collection name: `wap_games`
- Fields:
  - `full_name` (text, required)
  - `adypu_email` (email, required, domain: adypu.edu.in)
  - `game_title` (text, required)
  - `screenshot` (file, required)
  - `hosted_link` (URL, required)
  - `github_link` (URL, required, domain: github.com)
  - `created` (auto date)
  - `updated` (auto date)

Make sure your PocketBase instance has this collection set up properly.

## Environment Variables

The following environment variables are used in this project:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_POCKETBASE_URL` | URL of your PocketBase server | `http://127.0.0.1:8090` |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
