# Nash Point - AI Poker Training

A production-ready marketing website for Nash Point, an AI poker training tool inspired by John Nash. Built with Next.js, React, and Tailwind CSS.

## 🎯 Project Overview

Nash Point is a proof-of-concept landing site that:
- Introduces Nash Point - where Nash Equilibrium meets human irrationality
- Explains how we combine GTO principles with exploitative play
- Shows mockups of the training tool features
- Collects user emails for early access waitlist

### The Nash Point Philosophy

Inspired by John Nash, who revolutionized game theory while understanding human irrationality, Nash Point teaches:
1. **Nash Equilibrium** - Master GTO as your foundation
2. **Human Irrationality** - Learn to exploit imperfect opponents
3. **Maximum Profit** - Combine perfect theory with real-world application

## 🚀 Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Vercel** (deployment ready)

## 📦 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
ai-gto-poc-website/
├── app/
│   ├── layout.tsx           # Root layout with Navbar & Footer
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Global styles
│   ├── about/
│   │   └── page.tsx         # About/Vision page
│   ├── demo/
│   │   └── page.tsx         # UI Demo (non-functional mockup)
│   ├── early-access/
│   │   └── page.tsx         # Waitlist signup page
│   └── api/
│       └── waitlist/
│           └── route.ts     # Waitlist API endpoint
├── components/
│   ├── Navbar.tsx           # Navigation bar
│   ├── Footer.tsx           # Footer
│   ├── Hero.tsx             # Hero section
│   ├── FeatureSection.tsx   # Feature grid
│   ├── ComparisonSection.tsx # vs GTO Wizard comparison
│   └── WaitlistForm.tsx     # Email capture form
├── tailwind.config.ts       # Tailwind configuration
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies
```

## 🎨 Design System

The site follows a minimalist, warm, masculine brand identity:

- **Primary Color**: Deep charcoal (#1A1A1A)
- **Background**: Dark (#121212)
- **Accent**: Warm gold/copper (#C48F56)
- **Typography**: Inter font family

All design tokens are defined in:
- `tailwind.config.ts`
- `DESIGN_TOKENS.md`

## 📄 Pages

### Landing Page (`/`)
- Hero section with headline and CTA
- Feature grid (4 key features)
- Comparison with GTO Wizard
- Mockup preview

### About Page (`/about`)
- Problem statement
- Our approach (4 key differentiators)
- Product roadmap
- Solver integration explanation

### Demo Page (`/demo`)
- Non-functional UI mockup
- Hand input interface
- Opponent type selector
- Mock AI commentary
- GTO baseline chart
- Exploitative adjustment display

### Early Access Page (`/early-access`)
- Waitlist form (email + optional notes)
- Benefits list
- Success confirmation

## 🔌 API Routes

### POST `/api/waitlist`
Stores waitlist signups in Neon Postgres database.

**Request:**
```json
{
  "email": "user@example.com",
  "notes": "Optional feedback"
}
```

**Response:**
```json
{
  "message": "Successfully joined the waitlist!",
  "success": true
}
```

### GET `/api/waitlist`
Returns current waitlist count and entries from database (for debugging).

**Database:** Neon Postgres with `@neondatabase/serverless` driver

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Deploy with default settings

Or use Vercel CLI:
```bash
npm install -g vercel
vercel
```

The site is configured to work with zero changes on Vercel.

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## 📝 Notes

- Waitlist data is stored in **Neon Postgres** database
- Uses `@neondatabase/serverless` driver for serverless deployment
- All mockups are non-functional placeholders
- Mobile-first responsive design

## 🗄️ Database Setup

The project uses Neon Postgres for waitlist storage.

**Schema:** See `schema.sql` for the database table structure.

**Environment Variable Required:**
- `DATABASE_URL` - Neon Postgres connection string (stored in `.env.local`)

**To set up the database:**
1. Create a Neon database (connected via Vercel Storage)
2. Run the SQL in `schema.sql` using Neon SQL Editor
3. Add `DATABASE_URL` to `.env.local` and Vercel environment variables

## 📚 Documentation

Additional documentation:
- `DESIGN_TOKENS.md` - Design system reference
- `project-specification.md` - Full project requirements
- `system-architecture.md` - Future tool architecture
- `ui-wireframes.md` - UI wireframe descriptions

## 🔗 References

- [GTO Wizard](https://gtowizard.com) - Competitive reference

## 📄 License

Private project - All rights reserved

---

Built with ♠️ by the Nash Point team

*"The best way to win is to understand both the perfect strategy and why your opponents will never play it perfectly."* - Inspired by John Nash
