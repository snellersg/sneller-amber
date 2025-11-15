# 🚀 Sneller AMBER - Getting Started Guide

A secure, authenticated Next.js documentation site for Sneller's Landscaping internal knowledge management.

## 📋 Prerequisites

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org))
- **npm** (comes with Node.js)
- **Git** (for version control)
- **Supabase Account** (Free at [supabase.com](https://supabase.com))
- **Company Email** (@snellersg.com or @snellerslandscaping.com)

## 🏗️ Project Structure

```
sneller-amber-v2/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx    # Root layout with providers
│   │   ├── page.js       # Homepage (auth redirect)
│   │   ├── globals.css   # Global styles with CSS variables
│   │   ├── providers.tsx # TanStack Query provider
│   │   ├── login/page.tsx # Login/signup page
│   │   ├── active-accounts/
│   │   │   ├── page.tsx  # Account list
│   │   │   └── [id]/page.tsx # Account details
│   │   ├── admin/page.tsx # Admin user management
│   │   ├── profile/page.tsx # User profile
│   │   └── ...           # Other content pages
│   ├── components/       # UI components
│   │   ├── Layout.tsx   # Main layout wrapper
│   │   ├── Sidebar.tsx  # Navigation sidebar
│   │   ├── TopBar.tsx   # Header with profile/sign out
│   │   ├── TableOfContents.tsx
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utility functions
│   │   ├── supabase.ts  # Supabase configuration
│   │   ├── utils.ts     # Utility functions
│   │   └── query-provider.tsx # TanStack Query setup
│   └── middleware.ts    # Next.js auth middleware
├── public/              # Static assets (logo, manifest)
├── docs/                # Documentation
├── .env.local          # Environment variables (NOT committed)
├── next.config.js      # Next.js configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Dependencies and scripts
```

## ⚡ Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd sneller-amber

# Install dependencies
npm install
```

### 2. Set Up Supabase

**Complete setup guide:** See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

**Quick version:**
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Get your Project URL and anon key from Project Settings > API
3. Run `supabase_setup.sql` in SQL Editor
4. Configure email authentication

### 3. Configure Environment Variables

```bash
# Create environment file
cp .env.local.example .env.local

# Edit .env.local and add your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Never commit `.env.local` - it's already in `.gitignore`.

### 4. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`. You'll be redirected to `/login`.

### 5. Create Your Account

1. Click "Sign up" on the login page
2. Use your company email (@snellersg.com or @snellerslandscaping.com)
3. Verify your email if confirmation is enabled
4. Sign in to access the app

### 6. Set First Admin (One Time Only)

1. Go to Supabase Dashboard > Authentication > Users
2. Click on your user
3. Scroll to "User Metadata" and click "Edit"
4. Set:
   ```json
   {
     "is_admin": true
   }
   ```
5. Save and refresh the app - you'll see "Admin Panel" in the sidebar

## 🎯 Available Commands

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Build production bundle
npm start          # Start production server
npm run lint       # Run ESLint
```

## 📱 Application Overview

### Navigation Structure

The app has a **three-column layout**:
1. **Left Sidebar**: Main navigation
2. **Center**: Content area
3. **Right Sidebar**: "On This Page" table of contents

**Sidebar Sections:**
- **Quick Access**: Sheets and Docs, Submit PO, Customer Call Log, Damage Report, Ops Hub
- **Clients**: Active Accounts (with dual contract management), Touch Planning (coming soon)
- **Knowledge**: Core Processes, Core Services, Add-On Services, Product Info
- **Training**: Process Guides, Practice Workflows (coming soon), EOS Worldwide (coming soon), Armstrong Coaching (coming soon), The KAM Club (coming soon)
- **Tools**: Calculators, Platforms, Cheatsheets & PDFs (coming soon)

### Key Pages

| Route | Page | Description | Access Level |
|-------|------|-------------|--------------|
| `/login` | Login/Signup | Authentication page | Public |
| `/` | Sheets and Docs | Links to essential business tools | Authenticated |
| `/profile` | User Profile | Profile and password management | Authenticated |
| `/admin` | Admin Panel | User management, audit logs, domains | Admin Only |
| `/active-accounts` | Active Accounts | Client account list with search/filter | Authenticated |
| `/active-accounts/:id` | Property Detail | Account details with contract PDFs | Authenticated |
| `/core-processes` | Core Processes | Account management workflows | Authenticated |
| `/core-services` | Core Services | Contract descriptions | Authenticated |
| `/add-on-services` | Add-On Services | Additional service offerings | Authenticated |
| `/product-knowledge` | Product Info | Product information | Authenticated |
| `/guides` | Process Guides Index | Categorized guides | Authenticated |
| `/guides/:slug` | Guide Detail | Individual guide pages | Authenticated |
| `/tools` | Calculators | Mulch and stone calculators | Authenticated |
| `/tools-platforms` | Platforms | Essential software platforms | Authenticated |

### Theme System

The app has **dark mode** support:
- Toggle in top-right corner (sun/moon icon)
- Persisted to localStorage
- Syncs with system preference on first load
- Brand color (#0A93D5) adapts to both themes

## 🛠️ Development Workflow

### Authentication Flow

**User Journey:**
1. User visits app → Redirected to `/login` if not authenticated
2. User signs up with company email
3. Email domain validated (@snellersg.com or @snellerslandscaping.com)
4. Email verification (if enabled in Supabase)
5. User signs in → `AuthContext` manages session
6. User can access all authenticated pages
7. Admins see additional "Admin Panel" link

**Session Management:**
- Sessions persist in localStorage (survives browser restart)
- "Remember Me" checkbox (checked by default)
- Auto-refresh tokens handled by Supabase
- Sign out clears session and redirects to `/login`

### Adding a New Page

1. **Create page component** in `src/pages/`:
   ```jsx
   // src/pages/NewPage.js
   import React from 'react';

   function NewPage() {
     return (
       <article className="prose prose-gray dark:prose-invert max-w-none">
         <h1>New Page</h1>
         <p className="lead">Page description</p>
         <p>Content here...</p>
       </article>
     );
   }

   export default NewPage;
   ```

2. **Add route** in `src/App.js`:
   ```jsx
   import NewPage from './pages/NewPage';

   // Inside the ProtectedRoute wrapper:
   <Route path="/new-page" element={<NewPage />} />
   ```

3. **Add to sidebar** in `src/components/Sidebar.js`:
   ```jsx
   { label: 'New Page', icon: FileText, page: 'NewPage', path: '/new-page' }
   ```

**Note:** All routes inside `<ProtectedRoute>` require authentication. For admin-only pages, wrap with `<AdminRoute>`.

### Using Callout Boxes

For highlighted content sections (like in Core Processes and Core Services):

```jsx
<div className="not-prose mt-4 mb-6 rounded-lg bg-[#0A93D5]/10 dark:bg-[#0A93D5]/30 px-6 py-4">
  <h4 className="text-base font-semibold mb-3 text-foreground">Callout Title</h4>
  <p className="leading-relaxed">Callout content goes here...</p>
</div>

{/* Explanation paragraphs outside callout inherit prose styling */}
<div className="mt-4">
  <p>This paragraph will have proper spacing and styling.</p>
  <p>Multiple paragraphs work great here.</p>
</div>
```

### Adding External Links

External links open in new tabs automatically:

```jsx
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External Link
</a>
```

### Adding to Guides System

1. **Add guide data** to `src/data/guidesData.js`:
   ```jsx
   {
     id: 'unique-slug',
     title: 'Guide Title',
     category: 'Bidding', // or 'Meetings', 'Account Management'
     excerpt: 'Short description',
     content: (
       <>
         <p>Guide content as JSX...</p>
       </>
     )
   }
   ```

2. Guide automatically appears in `/guides` index and is accessible at `/guides/unique-slug`

## 🎨 Styling Guidelines

### Tailwind CSS Classes

The app uses **Tailwind utility classes**:
```jsx
<div className="flex items-center justify-between p-4 rounded-lg bg-card">
  <h2 className="text-xl font-bold">Title</h2>
  <button className="px-4 py-2 rounded bg-primary text-primary-foreground">
    Click Me
  </button>
</div>
```

### Typography Plugin

Documentation pages use `@tailwindcss/typography`:
```jsx
<article className="prose prose-gray dark:prose-invert max-w-none">
  {/* All standard HTML elements styled automatically */}
  <h1>Heading 1</h1>
  <p>Paragraph with proper spacing</p>
  <ul>
    <li>List items</li>
  </ul>
</article>
```

### Brand Colors

Primary brand color is Sneller Blue (#0A93D5):
- Use `bg-primary` for backgrounds
- Use `text-primary` for text
- Use `bg-[#0A93D5]/10` for light tints
- Use `dark:bg-[#0A93D5]/30` for dark mode tints

## 📦 Building for Production

### Create Production Build

```bash
npm run build
```

This creates optimized files in the `build/` directory:
- Minified JavaScript
- Optimized CSS (unused styles removed)
- Compressed assets
- Code splitting for faster loads

### Deployment

**Prerequisites:**
- Supabase project is set up and running
- Database tables created via `supabase_setup.sql`
- Environment variables configured

**Option 1: Netlify (Recommended)**
1. Connect Git repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`
4. **Add environment variables** in Netlify dashboard:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
5. Auto-deploys on Git push

**Option 2: Vercel**
1. Import Git repository
2. Framework: Create React App
3. **Add environment variables** in Vercel dashboard:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
4. Deploy

**Option 3: Manual Hosting**
1. Build with environment variables:
   ```bash
   REACT_APP_SUPABASE_URL=your-url \
   REACT_APP_SUPABASE_ANON_KEY=your-key \
   npm run build
   ```
2. Upload contents of `build/` folder to any web host
3. Configure server to route all requests to `index.html` (for client-side routing)

**Important Security Notes:**
- Never commit `.env.local` to Git
- Only use `anon` key in frontend (not `service_role` key)
- Supabase Row Level Security (RLS) protects your data
- Environment variables are baked into the build at build time

## 🔧 Troubleshooting

### Authentication Issues

**Can't connect to Supabase:**
- Check `.env.local` has correct credentials
- Restart dev server after changing `.env.local`
- Verify Supabase project URL is correct
- Check browser console for errors

**Stuck on loading screen:**
- Clear browser localStorage (F12 > Application > Local Storage > Clear)
- Clear browser cache
- Restart dev server
- Check Supabase project is active

**Email domain not allowed:**
- Verify email ends with @snellersg.com or @snellerslandscaping.com
- Check `allowed_domains` table in Supabase
- Ensure domain is marked as `is_active: true`

**Can't access admin panel:**
- Verify `is_admin: true` in user metadata (Supabase Dashboard)
- Clear browser cache and localStorage
- Sign out and sign back in
- Check browser console for errors

**Password reset not working:**
- Check Authentication > Email Templates in Supabase
- Verify SMTP settings (uses Supabase's by default)
- Check spam folder
- Ensure user's email is verified

### Port Already in Use

If port 3000 is taken:
```bash
# macOS/Linux
PORT=3001 npm start

# Windows
set PORT=3001 && npm start
```

### Dependencies Won't Install

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Build Fails

```bash
# Check Node version (requires 18+)
node --version

# Check environment variables are set
cat .env.local

# Update dependencies
npm update

# Try clean build
rm -rf build node_modules
npm install
npm run build
```

### Dark Mode Not Working

Check localStorage:
```javascript
// In browser console
localStorage.getItem('darkMode')

// Reset dark mode
localStorage.removeItem('darkMode')
// Refresh page
```

## 💡 Tips & Best Practices

### Security Best Practices
- **Never** commit `.env.local` to Git
- **Never** share service_role key (not needed for this app)
- Only use `anon` key in frontend code
- Row Level Security (RLS) protects all database tables
- All admin actions are automatically logged in audit trail
- Use strong passwords (8+ characters minimum)

### User Management
- Only admins can promote/demote other admins
- Use bulk operations for managing multiple users
- Check audit logs regularly for accountability
- Add/remove email domains as needed via Admin Panel
- Send password reset emails to users who forget passwords

### Content Organization
- Keep guide content in `guidesData.js` for easy management
- Use components for reusable UI patterns
- Follow existing page structure for consistency
- All content pages should be inside `<ProtectedRoute>`

### Performance
- Images should be optimized before adding
- Use `lazy` loading for heavy components if needed
- Keep build size under 1MB for fast loads
- Supabase provides automatic caching and CDN

### Accessibility
- Always include `alt` text for images
- Use semantic HTML (`<article>`, `<nav>`, `<main>`)
- Test keyboard navigation (Tab key)
- Maintain heading hierarchy (h1 → h2 → h3)
- Test with screen readers if possible

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-guide

# Make changes and commit
git add .
git commit -m "Add new guide for X process"

# Push and create PR
git push origin feature/new-guide
```

**Important:** Never commit `.env.local` - it's in `.gitignore` for security.

## 🎓 Learning Resources

- **React**: [react.dev](https://react.dev)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **React Router**: [reactrouter.com](https://reactrouter.com)
- **Radix UI**: [radix-ui.com](https://radix-ui.com)

## 📞 Quick Reference

```bash
# Development
npm start                    # Start dev server (localhost:3000)

# Production
npm run build               # Build for deployment

# Supabase
# Visit dashboard at: https://app.supabase.com
```

## Common Tasks

**Add new user**: Admin Panel → Users tab (or user signs up themselves)
**Promote to admin**: Admin Panel → Click "Make Admin" next to user
**Add new page**: Create component → Add route (inside `<ProtectedRoute>`) → Add to sidebar
**Update content**: Edit page component directly
**Add guide**: Update `guidesData.js`
**Add/edit account**: Active Accounts → Click "New Account" or edit existing
**Upload contract PDF**: Active Accounts → Select account → Upload LM/WR contract
**View contract PDF**: Click eye icon on contract (generates secure signed URL)
**Change theme**: Edit `src/index.css` (CSS custom properties)
**Add external link**: Update `SheetsDocs.js` or sidebar
**View audit logs**: Admin Panel → Audit Logs tab
**Manage email domains**: Admin Panel → Email Domains tab

## 🔐 Security Checklist

Before deploying to production:
- [ ] `.env.local` is in `.gitignore` and not committed
- [ ] Environment variables set in hosting platform (Netlify/Vercel)
- [ ] Supabase RLS policies are enabled (via `supabase_setup.sql`)
- [ ] Email confirmation is configured in Supabase
- [ ] At least one admin user is set up
- [ ] Allowed email domains are configured
- [ ] Test login/signup flow works
- [ ] Test admin panel access (admins only)
- [ ] Test password reset flow

---

You now have a fully functional, secure React documentation site with Supabase authentication! 🚀

For detailed Supabase setup, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).
For technical architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).
