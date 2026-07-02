# Acctrise - Premium Digital Services Platform

A sophisticated, enterprise-grade platform for buying and managing social media services, virtual numbers, eSIM, and digital reselling. Built with Next.js 15, TypeScript, and a provider adapter pattern for seamless service integration.

## 🎯 Overview

Acctrise enables customers to:
- 💰 Manage multi-currency wallets with instant funding
- 📱 Buy social media growth services (Instagram, TikTok, Telegram, etc.)
- 📞 Rent virtual phone numbers for SMS verification
- 💳 Track orders in real-time with detailed analytics
- 🤝 Earn referral commissions
- 🎫 Use coupons and promotional codes

## 🏗️ Architecture

### Provider Adapter Pattern
The platform uses an **abstract provider adapter pattern**, allowing seamless switching between service providers without changing business logic.

**Current Providers:**
- **SMM Panel** (Reseller SMM) - Social media services
- **SMS Pool** - Virtual phone numbers & SMS verification
- **BulkAcc** - Account logs and bulk services

**How it works:**
```
Order Request → Provider Manager → Tries Primary Provider
                                 → If fails, tries fallback provider
                                 → Updates status via webhooks
```

### Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis (for frequently accessed data)
- **Jobs**: BullMQ (background task queue)
- **Auth**: NextAuth v5 (recommended setup)
- **Payments**: PocketFi planned; funding currently on hold
- **Validation**: Zod + React Hook Form
- **Charts**: Recharts (for analytics)
- **UI**: shadcn/ui patterns, Lucide Icons

## 📁 Project Structure

```
acctrise/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with theme setup
│   │   ├── page.tsx                   # Landing page (logo visible)
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── api/
│   │   │   ├── wallet/
│   │   │   │   ├── fund/route.ts      # Initiate wallet funding
│   │   │   │   └── balance/route.ts   # Get wallet balance
│   │   │   ├── orders/route.ts        # Create & list orders
│   │   │   ├── webhooks/
│   │   │   │   └── payments/route.ts  # Payment gateway webhook
│   │   │   └── providers/route.ts     # List available services
│   │   └── dashboard/
│   │       ├── layout.tsx             # Dashboard layout with sidebar
│   │       ├── page.tsx               # Main dashboard overview
│   │       ├── orders/                # Orders page
│   │       ├── wallet/                # Wallet management
│   │       └── settings/              # User settings
│   ├── components/
│   │   ├── layout/
│   │   │   └── header.tsx             # Header with logo
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── dashboard/
│   │   └── landing/
│   ├── lib/
│   │   ├── db.ts                      # Prisma singleton
│   │   ├── providers/
│   │   │   ├── base-adapter.ts        # Abstract interface
│   │   │   ├── provider-manager.ts    # Manager with failover
│   │   │   ├── index.ts               # Provider initialization
│   │   │   └── adapters/
│   │   │       ├── smm-adapter.ts
│   │   │       ├── sms-pool-adapter.ts
│   │   │       └── bulkacc-adapter.ts
│   │   ├── services/
│   │   │   ├── wallet-service.ts      # Wallet operations
│   │   │   ├── order-service.ts       # Order management
│   │   │   └── index.ts               # Service initialization
│   │   ├── jobs/
│   │   │   └── background-jobs.ts     # BullMQ background tasks
│   │   └── security/
│   │       ├── encryption.ts
│   │       ├── rate-limiter.ts
│   │       └── validation.ts
│   └── styles.css
├── prisma/
│   └── schema.prisma                  # Database schema
├── public/
│   └── acctrise-logo.jpeg             # Public logo
├── assets/
│   └── acctrise-logo.jpeg             # Asset logo
├── tailwind.config.ts                 # Tailwind dark mode config
├── tsconfig.json
├── next.config.ts
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### Installation

1. **Clone and install dependencies**
```bash
cd acctrise
npm install
```

2. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Database
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/acctrise?retryWrites=true&w=majority"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-random-secret"
JWT_SECRET="replace-with-random-secret"

# Email Service (Resend)
RESEND_API_KEY=""
AUTH_EMAIL_FROM="Acctrise <no-reply@acctrise.com>"

# Payment funding is currently on hold. PocketFi is planned.
POCKETFI_PUBLIC_KEY=...
POCKETFI_SECRET_KEY=...

# Provider API keys
BULKACC_API_KEY=""
SMSPOOL_API_KEY=""
RESELLER_SMM_API_KEY=""

# Provider configuration should be encrypted in the database.
# See database schema for Provider.config field.
```

3. **Setup Database**
```bash
# Run Prisma migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

4. **Seed Database with Providers**
```typescript
// Create a seed file: prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create providers
  const smmProvider = await prisma.provider.create({
    data: {
      name: "Reselling SMM",
      slug: "reselling-smm",
      type: "smm",
      status: "ACTIVE",
      config: {
        apiKey: "6c99715c89f2d0e19b28de070b223547"
      }
    }
  });

  // Create services
  await prisma.service.create({
    data: {
      name: "Instagram Followers",
      slug: "instagram-followers",
      categoryId: "default",
      price: 0.0056,
      minOrder: 100
    }
  });
}

main().catch(console.error);
```

Run seed:
```bash
npx prisma db seed
```

5. **Start Development Server**
```bash
npm run dev
```

Visit http://localhost:3000

## 🔧 Configuration

### Provider Configuration

Providers are configured in the database with encrypted API keys:

```typescript
// Add a provider
await prisma.provider.create({
  data: {
    name: "Provider Name",
    type: "smm" | "virtual-numbers" | "logs",
    status: "ACTIVE",
    config: {
      apiKey: encrypted_value, // Should be encrypted before saving
      apiSecret: optional_secret,
      timeout: 30000,
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelayMs: 1000
      }
    },
    syncInterval: 300, // seconds
    healthCheckUrl: "https://api.provider.com/health"
  }
});
```

### Background Jobs

The platform uses BullMQ for background tasks. Jobs are configured in `src/lib/jobs/background-jobs.ts`:

- **Sync Services**: Every 5 minutes - syncs available services from providers
- **Check Order Status**: Every minute - polls provider for order updates
- **Health Checks**: Every 15 minutes - monitors provider availability

## 📝 API Endpoints

### Wallet
- `POST /api/wallet/fund` - Initiate wallet funding
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Transaction history
- `POST /api/wallet/withdraw` - Request withdrawal

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/[id]` - Order details
- `POST /api/orders/[id]/retry` - Retry failed order
- `POST /api/orders/[id]/refund` - Request refund

### Services
- `GET /api/services` - List available services
- `GET /api/services/[id]` - Service details
- `GET /api/categories` - List categories

### Webhooks
- `POST /api/webhooks/payments` - Payment gateway webhooks
- `POST /api/webhooks/providers` - Provider status updates

## 🔐 Security

### Implementation
- ✅ Rate limiting on all endpoints
- ✅ CSRF protection (NextAuth)
- ✅ XSS prevention (escaping, CSP headers)
- ✅ Input validation (Zod schemas)
- ✅ API key encryption in database
- ✅ Audit logs for all operations
- ✅ Webhook signature verification
- ✅ SQL injection prevention (Prisma)
- ✅ Secrets management (.env)

### To Implement
```typescript
// Rate limiting example
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
});

const { success } = await ratelimit.limit(userId);
```

## Payment Integration

Payment funding is currently on hold. PocketFi is the planned gateway for future integration, and the current funding API keeps PocketFi in a held state until activation.

## 🧪 Testing

```bash
# Run tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration
```

## 📊 Monitoring

Monitor background jobs:
```typescript
import { syncServicesQueue } from "@/lib/jobs/background-jobs";

// Check job status
const waiting = await syncServicesQueue.getWaitingCount();
const completed = await syncServicesQueue.getCompletedCount();
```

Monitor provider health from dashboard: `/dashboard/providers`

## 🎨 Theming

Dark mode is the default. To add light mode support:

```typescript
// In layout.tsx
<html className={isDarkMode ? "dark" : ""}>
```

The Tailwind CSS is configured with `darkMode: ["class"]`, allowing CSS-based dark mode switching.

## 📧 Email Notifications

Using Resend for email:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "noreply@acctrise.com",
  to: user.email,
  subject: "Order Complete",
  html: orderCompleteTemplate(order)
});
```

## 🚢 Deployment

### Docker
```bash
docker build -t acctrise .
docker run -p 3000:3000 acctrise
```

### Vercel
```bash
# Connect GitHub repo to Vercel
# Env vars configured in Vercel dashboard
vercel deploy
```

### Manual Deployment
```bash
npm run build
npm start
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org)
- [Prisma Documentation](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [BullMQ](https://docs.bullmq.io)
- [Zod Validation](https://zod.dev)

## 🤝 Contributing

See CONTRIBUTING.md for guidelines

## 📄 License

Proprietary - All rights reserved

## 📞 Support

- Email: support@acctrise.com
- Documentation: docs.acctrise.com
- Status: status.acctrise.com

---

Built with ❤️ by Acctrise Team
