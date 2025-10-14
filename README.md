
# Next.js Latest Starter Kit Template

<p align="left">
  <a href="https://pages.cloudflare.com/" target="_blank">
    <img src="https://img.shields.io/badge/Deploy%20to-Cloudflare_Pages-ffbe00?logo=cloudflare&logoColor=white" alt="Deploy to Cloudflare Pages" />
  </a>
  <a href="https://opensource.org/licenses/MIT" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" />
  </a>
  <a href="https://github.com/alexasomba/nextjs-latest-starter-kit-template/actions" target="_blank">
    <img src="https://github.com/alexasomba/nextjs-latest-starter-kit-template/actions/workflows/main.yml/badge.svg" alt="CI Status" />
  </a>
</p>

A production-ready Next.js 16 starter template optimized for **Cloudflare Pages** deployment with **better-auth-cloudflare** integration.

## Features

- ⚡ **Next.js 16** with React 19 and Turbopack
- 🔐 **Authentication** via [better-auth-cloudflare](https://github.com/zpg6/better-auth-cloudflare)
  - Anonymous login support
  - Geolocation tracking
  - OpenAPI documentation generation
- 🗄️ **Database** - Drizzle ORM with Cloudflare D1
- 📦 **File Storage** - Cloudflare R2 bucket integration
- 🔑 **Key-Value Store** - Cloudflare KV namespace support
- 🎨 **UI Components** - Tailwind CSS 4 + shadcn/ui components
- 🔧 **Code Quality** - Biome for formatting and linting
- 🚀 **Cloudflare Workers** - Native Cloudflare platform integration

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Authentication**: better-auth + better-auth-cloudflare
- **Database**: Drizzle ORM + Cloudflare D1
- **Storage**: Cloudflare R2 (object storage)
- **Cache**: Cloudflare KV (key-value store)
- **Deployment**: Cloudflare Pages via @opennextjs/cloudflare
- **Code Quality**: Biome

## Prerequisites

- Node.js 18+ or Bun
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed globally

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd nextjs-latest-starter-kit-template
npm install
# or
bun install
```

### 2. Set Up Cloudflare Resources

You'll need to create the following Cloudflare resources:

#### Create a D1 Database

```bash
wrangler d1 create DATABASE
```

Copy the database ID and update your `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DATABASE",
      "database_name": "DATABASE",
      "database_id": "your-database-id"
    }
  ]
}
```

#### Create a KV Namespace

```bash
wrangler kv namespace create KV
```

Add the KV namespace to `wrangler.jsonc`:

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "your-kv-id"
    }
  ]
}
```

#### Create an R2 Bucket

```bash
wrangler r2 bucket create r2-bucket
```

Add the R2 bucket to `wrangler.jsonc`:

```jsonc
{
  "r2_buckets": [
    {
      "binding": "R2_BUCKET",
      "bucket_name": "r2-bucket"
    }
  ]
}
```

### 3. Set Up Database Schema

Generate the authentication schema:

```bash
npm run auth:update
```

Generate Drizzle migrations:

```bash
npm run db:generate
```

Apply migrations locally:

```bash
npm run db:migrate:dev
```

### 4. Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

The development server uses Turbopack for fast refresh. You can start editing pages in `src/app/` and see changes instantly.

## Available Scripts

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build Next.js application
- `npm run build:cf` - Build for Cloudflare Pages deployment

### Authentication

- `npm run auth:generate` - Generate Better Auth database schema
- `npm run auth:format` - Format generated schema with Prettier
- `npm run auth:update` - Generate and format schema (combines above two)

### Database

- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate:dev` - Apply migrations to local D1 database
- `npm run db:migrate:prod` - Apply migrations to production D1 database
- `npm run db:studio:dev` - Open Drizzle Studio for local database
- `npm run db:studio:prod` - Open Drizzle Studio for production database

### Code Quality

- `npm run format` - Format code with Biome
- `npm run lint` - Lint code with Biome

### Deployment

- `npm run preview` - Build and preview locally
- `npm run deploy` - Build and deploy to Cloudflare Pages
- `npm run clean-deploy` - Clean install and deploy

### Utilities

- `npm run cf-typegen` - Generate TypeScript types from Wrangler config
- `npm run clean` - Clean build artifacts and dependencies

## Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes (Better Auth)
│   │   ├── dashboard/    # Protected dashboard page
│   │   └── page.tsx      # Home page with anonymous login
│   ├── auth/             # Authentication configuration
│   │   ├── index.ts      # Better Auth setup
│   │   └── authClient.ts # Client-side auth utilities
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── FileUploadDemo.tsx
│   ├── db/               # Database configuration
│   │   ├── schema.ts     # Drizzle schema
│   │   └── auth.schema.ts # Generated auth schema
│   ├── lib/              # Utility functions
│   └── middleware.ts     # Next.js middleware for auth
├── public/               # Static assets
├── wrangler.jsonc        # Cloudflare Workers configuration
├── open-next.config.ts   # OpenNext Cloudflare configuration
├── next.config.ts        # Next.js configuration
└── biome.json            # Biome configuration
```

## Authentication Flow

This template uses **better-auth-cloudflare** for authentication:

1. **Anonymous Login**: Users can log in without credentials
2. **Session Management**: Sessions stored in D1 database
3. **Geolocation**: Automatic IP geolocation via Cloudflare
4. **Protected Routes**: Middleware redirects unauthenticated users

### Adding Social Providers

To add OAuth providers (GitHub, Google, etc.), update `src/auth/index.ts`:

```typescript
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  },
}
```

Add the secrets to Cloudflare:

```bash
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

## File Upload with R2

The template includes file upload functionality using Cloudflare R2:

- Maximum file size: 2MB (configurable in `src/auth/index.ts`)
- Allowed types: `.jpg`, `.jpeg`, `.png`, `.gif` (configurable)
- Additional metadata: category, description, public flag

Files are uploaded via Better Auth's R2 plugin and can be managed through the dashboard.

## Deployment

### Deploy to Cloudflare Pages

1. **Apply migrations to production**:

```bash
npm run db:migrate:prod
```

2. **Deploy**:

```bash
npm run deploy
```

Or use the Cloudflare dashboard:

1. Connect your GitHub repository
2. Set build command: `npm run build:cf`
3. Set build output directory: `.open-next`
4. Add environment variables/bindings from your `wrangler.jsonc`

### Environment Variables

Configure in Cloudflare Pages settings or `wrangler.jsonc`:

- `DATABASE` - D1 database binding (required)
- `KV` - KV namespace binding (required)
- `R2_BUCKET` - R2 bucket binding (required)

## Learn More

### Next.js

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features
- [Next.js App Router](https://nextjs.org/docs/app) - App Router documentation

### Cloudflare

- [Cloudflare Pages](https://developers.cloudflare.com/pages/) - Pages documentation
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - D1 database documentation
- [Cloudflare R2](https://developers.cloudflare.com/r2/) - R2 storage documentation
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) - Workers documentation

### Better Auth

- [Better Auth](https://www.better-auth.com/) - Better Auth documentation
- [better-auth-cloudflare](https://github.com/zpg6/better-auth-cloudflare) - Cloudflare adapter

### Drizzle ORM

- [Drizzle Documentation](https://orm.drizzle.team/) - Drizzle ORM documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
