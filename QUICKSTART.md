# Quick Start Guide

## ⚡ Installation & Running

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```

### Step 3: Open Browser
Navigate to: http://localhost:3000

## ✅ What's Been Built

### Pages (4 total)
- ✅ `/` - Landing page with hero, tools showcase, features, and comparison
- ✅ `/about` - Vision, approach, roadmap, solver integration info
- ✅ `/demo` - Non-functional UI mockup of the training tool
- ✅ `/early-access` - Waitlist signup form

### Components (8 total)
- ✅ `Navbar` - Responsive navigation with mobile menu
- ✅ `Footer` - Links and branding
- ✅ `Hero` - Clear value prop with tool preview cards
- ✅ `ToolsSection` - Animated mockups with scroll-triggered demos
- ✅ `FeatureSection` - 4-card feature grid
- ✅ `ComparisonSection` - Side-by-side comparison with GTO Wizard
- ✅ `WaitlistForm` - Email capture with success state
- ✅ `LoadingScreen` - Animated logo splash on first visit

### API Routes
- ✅ `POST /api/waitlist` - Stores email signups (in-memory)
- ✅ `GET /api/waitlist` - View current waitlist (debugging)

## 🎨 Design Tokens (Tailwind)

All colors are defined in `tailwind.config.ts`:
- `brand-primary` - #0C0A09 (warm black)
- `brand-bg` - #0A0908 (deep warm black background)
- `brand-accent` - #F97316 (vibrant orange - energy, action)
- `brand-accent-dark` - #EA580C (dark orange for hover)
- `brand-accent-gold` - #FBBF24 (bright gold - chips, premium)
- `brand-surface` - #1C1917 (warm card surface)
- `brand-surface-elevated` - #292524 (elevated elements)
- `brand-border` - #44403C (warm subtle borders)
- `brand-text-primary` - #FAFAF9 (warm white text)
- `brand-text-secondary` - #A8A29E (warm muted text)

## 📱 Features

✅ Fully responsive (mobile-first)
✅ Sticky navigation
✅ Dark theme with warm accents
✅ Form validation
✅ Success states
✅ Hover animations
✅ TypeScript throughout
✅ SEO metadata

## 🚀 Deploy to Vercel

### Option 1: Vercel Dashboard
1. Push code to GitHub
2. Go to vercel.com
3. Click "New Project"
4. Import your repository
5. Deploy (no configuration needed)

### Option 2: Vercel CLI
```bash
npm install -g vercel
vercel
```

## 🧪 Test the Waitlist

1. Go to http://localhost:3000/early-access
2. Enter an email address
3. Submit the form
4. Check your terminal for the console log
5. Try submitting the same email again (should show error)
6. Visit http://localhost:3000/api/waitlist to see all entries

## 📦 Production Build

```bash
npm run build
npm start
```

## 🔍 Verify Everything Works

- [ ] Homepage loads with hero and features
- [ ] Navigation works (all 4 links)
- [ ] Mobile menu toggles correctly
- [ ] About page shows roadmap and info
- [ ] Demo page displays mockup interface
- [ ] Early access form submits successfully
- [ ] Footer links work
- [ ] All pages are responsive

## 💡 Next Steps (Post-POC)

- Integrate real database (PostgreSQL, MongoDB, etc.)
- Add email service (SendGrid, Mailchimp, etc.)
- Implement analytics (Google Analytics, Plausible, etc.)
- Add actual poker hand mockup images
- Create logo files
- Set up custom domain
- Add contact page
- Implement blog/updates section

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill the process on port 3000
npx kill-port 3000
npm run dev
```

### Dependencies not installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check ESLint
npm run lint
```

## 📞 Support

For questions about this codebase, refer to:
- `README.md` - Full documentation
- `DESIGN_TOKENS.md` - Design system reference
- `project-specification.md` - Original requirements

---

🎉 **You're all set!** The website is ready to deploy.
