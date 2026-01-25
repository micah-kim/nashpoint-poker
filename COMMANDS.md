# Helpful Commands Reference

## 🚀 Development Commands

### Start Development Server
```bash
npm run dev
```
Then open: http://localhost:3000

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Run Linter
```bash
npm run lint
```

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

## 🧪 Testing the Waitlist

### Submit a Test Email
1. Navigate to http://localhost:3000/early-access
2. Enter any email address
3. Check your terminal for the log output

### View All Waitlist Entries
Open in browser: http://localhost:3000/api/waitlist

### Test with cURL
```bash
# Submit
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","notes":"Test note"}'

# View all
curl http://localhost:3000/api/waitlist
```

## 📦 Deployment Commands

### Deploy to Vercel (CLI) 
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

### Deploy to Vercel (GitHub)
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your repository
5. Click "Deploy"

## 🛠️ Troubleshooting Commands

### Kill Port 3000
```powershell
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use npx
npx kill-port 3000
```

### Clean Install
```bash
# Remove everything
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

### Clear Next.js Cache
```bash
Remove-Item -Recurse -Force .next
npm run dev
```

## 📝 Useful File Paths

### Pages
- `app/page.tsx` - Landing page
- `app/about/page.tsx` - About page
- `app/demo/page.tsx` - Demo page
- `app/early-access/page.tsx` - Early access page

### Components
- `components/Navbar.tsx`
- `components/Footer.tsx`
- `components/Hero.tsx`
- `components/FeatureSection.tsx`
- `components/ComparisonSection.tsx`
- `components/WaitlistForm.tsx`

### Config Files
- `tailwind.config.ts` - Tailwind configuration
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies

### API
- `app/api/waitlist/route.ts` - Waitlist API endpoint

## 🎨 Edit Design Tokens

### Update Colors
Edit: `tailwind.config.ts`

```typescript
colors: {
  'brand-primary': '#1A1A1A',    // Change here
  'brand-bg': '#121212',         // Change here
  'brand-accent': '#C48F56',     // Change here
  // ... etc
}
```

Then restart the dev server:
```bash
npm run dev
```

## 🔍 Debug Commands

### View Build Output
```bash
npm run build -- --debug
```

### Analyze Bundle Size
```bash
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

### Check for Security Issues
```bash
npm audit

# Fix issues
npm audit fix
```

## 📊 Useful Development URLs

- Development: http://localhost:3000
- API Endpoint: http://localhost:3000/api/waitlist
- Landing: http://localhost:3000/
- About: http://localhost:3000/about
- Demo: http://localhost:3000/demo
- Early Access: http://localhost:3000/early-access

## 💡 Git Commands (if using version control)

```bash
# Initialize repo
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Complete POC website"

# Add remote
git remote add origin <your-repo-url>

# Push
git push -u origin main
```

## 🚀 Quick Deploy Script

Save as `deploy.ps1`:
```powershell
Write-Host "Building production version..." -ForegroundColor Cyan
npm run build

Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod

Write-Host "Deployment complete!" -ForegroundColor Green
```

Run with:
```bash
./deploy.ps1
```

---

**Quick Reference**: Keep this file handy for common development tasks!
