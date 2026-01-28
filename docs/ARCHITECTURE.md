# 🏗️ Sneller AMBER - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Next.js Frontend                        │
│                                                         │
│  • Next.js 16 + React 19 + App Router                  │
│  • Tailwind CSS 3.4 + Sneller 2026 Design System      │
│  • shadcn/ui Components + next-themes                  │
│  • Protected Routes + Admin Routes                     │
│  • TanStack Query for Server State                     │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS API Calls
                     │ (Authentication, Data)
                     │
┌────────────────────▼────────────────────────────────────┐
│              Supabase Backend (BaaS)                    │
│                                                         │
│  • PostgreSQL Database                                 │
│  • Authentication Service                              │
│  • Row Level Security (RLS)                            │
│  • Private Storage (Signed URLs)                       │
│  • Real-time Subscriptions                             │
│  • Email Service (Password Reset)                      │
│                                                         │
└─────────────────────────────────────────────────────────┘

        Frontend: Next.js 16 (Port 3000 dev / Deployed)
        Backend: Supabase Cloud (Managed)
```

## Tech Stack

### Frontend: Next.js 16 + React 19 + Tailwind CSS
**Why:**
- Next.js 16 App Router with Turbopack for fast development
- React 19 with latest features (concurrent rendering, automatic batching)
- TypeScript 5 for type safety and better developer experience
- Tailwind CSS 3.4 with Sneller 2026 design system and next-themes
- TanStack Query v5 for server state management and caching
- Production-grade light/dark mode with zero-flicker theme switching

### Backend: Supabase (Backend-as-a-Service)
**Why:**
- PostgreSQL database with built-in authentication
- Row Level Security (RLS) for data protection
- No custom backend code needed
- Real-time capabilities and email service included
- Free tier perfect for small teams
- 99.9% uptime SLA with automatic backups

### UI Components: Radix UI + shadcn/ui
**Why:**
- Accessible, unstyled primitives (Button, Card, etc.)
- Works seamlessly with Tailwind
- Consistent UX patterns across the app
- Easy to customize and maintain

### Styling: Tailwind CSS + @tailwindcss/typography
**Why:**
- Utility-first CSS for rapid development
- Typography plugin for beautiful prose content
- Custom theme with Sneller brand colors (#0A93D5)
- Dark mode support with CSS custom properties

### Routing: Next.js App Router
**Why:**
- File-based routing with nested layouts
- Built-in SSR/SSG capabilities for better performance
- Middleware for authentication protection
- Server and client components for optimal rendering

### Icons: Lucide React
**Why:**
- Beautiful, consistent icon set
- Tree-shakeable (only imports used icons)
- Matches modern design aesthetic
- Easy to customize size and color

## Application Structure

```
sneller-amber-v2/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx     # Root layout with metadata and providers
│   │   ├── page.js        # Homepage (auth redirect)
│   │   ├── globals.css    # Global styles with CSS variables
│   │   ├── providers.tsx  # TanStack Query provider
│   │   ├── login/page.tsx # Login page
│   │   ├── active-accounts/
│   │   │   ├── page.tsx   # Account management list
│   │   │   └── [id]/page.tsx  # Individual account details
│   │   ├── admin/page.tsx # Admin user management
│   │   ├── profile/page.tsx # User profile management
│   │   ├── sheets-and-docs/page.tsx # Sheets & Docs
│   │   ├── core-processes/page.tsx
│   │   ├── core-services/page.tsx
│   │   ├── add-on-services/page.tsx
│   │   ├── product-knowledge/page.tsx
│   │   ├── tools/page.tsx
│   │   ├── tools-platforms/page.tsx
│   │   └── guides/page.js
│   ├── components/         # Reusable UI components
│   │   ├── Layout.tsx     # Main layout wrapper with sidebar
│   │   ├── Sidebar.tsx    # Navigation sidebar (TypeScript)
│   │   ├── TopBar.tsx     # Header with profile/sign out
│   │   ├── TableOfContents.tsx # "On This Page" menu
│   │   └── ui/            # shadcn/ui components (Button, Card, etc.)
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── tooltip.jsx
│   ├── lib/               # Utility functions
│   │   ├── supabase.ts    # Supabase configuration (TypeScript)
│   │   ├── utils.ts       # cn() for className merging
│   │   └── query-provider.tsx # TanStack Query setup
│   └── middleware.ts      # Next.js middleware for auth
├── public/
│   ├── logo512.png        # Sneller logo
│   └── manifest.json      # PWA manifest
├── docs/                  # Documentation
├── .env.local             # Environment variables (NOT committed)
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind configuration
└── package.json          # Dependencies and scripts
```

## Component Architecture

### Next.js App Router Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  app/layout.tsx                         │
│  • Root layout with metadata                           │
│  • TanStack Query Providers                            │
│  • Global CSS variables                                │
│  • PWA manifest configuration                          │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────┐          ┌─────▼──────┐
    │  Public  │          │ Protected  │
    │  Routes  │          │   Routes   │
    │          │          │            │
    │ /login   │          │ middleware.ts
    │ /        │          │ (auth check)
    └──────────┘          │            │
                          │ <Layout>   │
                          │  └─Sidebar │
                          │  └─TopBar  │
                          │  └─Content │
                          └────────────┘
```

### Authentication Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  middleware.ts                          │
│  • Route protection at edge                            │
│  • Supabase SSR auth check                             │
│  • Automatic redirects                                 │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────┐          ┌─────▼──────┐
    │   Auth   │          │    App     │
    │ Required │          │  Content   │
    │          │          │            │
    │ Supabase │          │ TanStack   │
    │   SSR    │          │   Query    │
    └──────────┘          │ + Supabase │
                          └────────────┘
```
    └──────────┘          │   ├─ /
                          │   ├─ /profile
                          │   ├─ /guides
                          │   └─ <AdminRoute>
                          │       └─ /admin
                          └────────────┘
```

**Authentication Flow:**
1. User visits app → `AuthContext` checks session in localStorage
2. If no session → Redirect to `/login`
3. User signs in → Supabase creates session
4. Session stored in localStorage (persists across browser restarts)
5. `AuthContext` updates state: `user`, `profile`, `isAdmin`
6. `ProtectedRoute` allows access to all content pages
7. `AdminRoute` checks `isAdmin` flag for admin panel access

### Layout System
The app uses a three-column documentation layout:

```
┌─────────────────────────────────────────────────────────┐
│ TopBar (Logo, Profile, Sign Out, Theme Toggle)         │
├───────────┬─────────────────────────┬───────────────────┤
│           │                         │                   │
│ Sidebar   │   Main Content         │  Table of         │
│ (Nav)     │   (prose styling)      │  Contents         │
│ + Admin   │                         │  ("On This Page") │
│ Panel     │                         │                   │
│ (admins)  │                         │                   │
└───────────┴─────────────────────────┴───────────────────┘
```

**Responsive Behavior:**
- Desktop (≥1280px): All three columns visible
- Tablet (768px-1279px): Sidebar + Content (TOC hidden)
- Mobile (<768px): Content only, sidebar accessible via hamburger menu

**Authentication UI:**
- TopBar shows profile icon and sign out button (authenticated users only)
- Sidebar shows "Admin Panel" link at top (admins only)
- Admin Panel has 3 tabs: User Management, Audit Logs, Email Domains

### Dark Mode Implementation
```css
/* CSS Custom Properties in index.css */
:root {
  --background: 0 0% 100%;      /* Light mode */
  --foreground: 213 27% 14%;
  --primary: 199 89% 44%;       /* Sneller Blue #0A93D5 */
}

.dark {
  --background: 222 47% 11%;    /* Dark mode */
  --foreground: 213 31% 91%;
  --primary: 199 89% 44%;       /* Same brand color */
}
```

**State Management:**
- `darkMode` state in root layout
- Persisted to localStorage
- Syncs with system preference on first load
- Applied via className on root element

### Content Pages
All documentation pages use consistent structure:

```jsx
<article className="prose prose-gray dark:prose-invert max-w-none">
  <h1>Page Title</h1>
  <p className="lead">Description</p>

  {/* Content sections */}
  <h2>Section</h2>
  <p>Content...</p>

  {/* Callout boxes */}
  <div className="not-prose rounded-lg bg-[#0A93D5]/10 dark:bg-[#0A93D5]/30 px-6 py-4">
    <h4>Callout Title</h4>
    <p>Content...</p>
  </div>

  {/* Explanation paragraphs inherit prose styling */}
  <div className="mt-4">
    <p>Explanation...</p>
  </div>
</article>
```

## Key Design Patterns

### 1. Prose Typography
Uses `@tailwindcss/typography` for beautiful documentation:
- Automatic heading hierarchy and spacing
- Consistent paragraph spacing
- List styling with brand-colored markers
- Code block styling

### 2. Callout Boxes
Highlighted content sections with:
- Light background tint of brand color
- No border (cleaner look)
- Larger text size matching body content
- Used for contracts, process steps, etc.

### 3. Navigation System
**Sidebar:**
- Sections: Quick Access, Clients, Knowledge, Training, Tools
- Active page highlighted with brand color
- External links open in new tabs
- Persistent across page navigation
- Coming soon items shown with reduced opacity and "Soon" label

**Table of Contents:**
- Auto-generated from h2-h6 headings
- Filters out "Sneller Contract Service Description", "Sneller Contract Description", "Opportunity Indicators", and Round headings
- Smooth scroll to sections
- Active section highlighted
- Left border matching sidebar style

### 4. Brand Color System
Primary brand color (#0A93D5) used consistently:
- Active navigation states
- Callout backgrounds (10% light, 30% dark)
- Buttons and interactive elements
- List markers (`.brand-marker`)

## Database Schema

### Supabase Tables

**1. auth.users** (Supabase managed)
- Built-in authentication table
- Fields: `id`, `email`, `encrypted_password`, `email_confirmed_at`, `user_metadata`
- `user_metadata.is_admin` (boolean) - determines admin access

**2. user_profiles**
- Extends auth.users with additional user data
- Fields:
  - `id` (UUID, FK to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `department` (text, nullable)
  - `phone` (text, nullable)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  - `last_active` (timestamp)
- **RLS Policy**: Users can read own profile, admins can read all

**3. allowed_domains**
- Email domains allowed to sign up
- Fields:
  - `id` (integer, PK)
  - `domain` (text, unique) - e.g., "@snellersg.com"
  - `is_active` (boolean, default true)
  - `created_at` (timestamp)
- **RLS Policy**: Public read, admins can insert/update/delete

**4. admin_audit_log**
- Tracks all admin actions for accountability
- Fields:
  - `id` (UUID, PK)
  - `admin_id` (UUID, FK to auth.users)
  - `admin_email` (text)
  - `action_type` (text) - e.g., "user_promoted", "user_deleted"
  - `target_user_id` (UUID, nullable)
  - `target_user_email` (text, nullable)
  - `metadata` (jsonb, nullable)
  - `created_at` (timestamp)
- **RLS Policy**: Admins can read and insert only

**5. active_accounts**
- Client account management with dual contract system
- Fields:
  - `id` (UUID, PK)
  - `property_name` (text)
  - `parent_account` (text, nullable)
  - `location` (text) - GRR, LAN, KZOO, SSP
  - `account_manager` (text, nullable)
  - `lm_contract_pdf_url` (text, nullable) - File path for LM contract
  - `lm_contract_pdf_name` (text, nullable)
  - `lm_contract_uploaded_at` (timestamp, nullable)
  - `wr_contract_pdf_url` (text, nullable) - File path for WR contract
  - `wr_contract_pdf_name` (text, nullable)
  - `wr_contract_uploaded_at` (timestamp, nullable)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **RLS Policy**: Authenticated users can read/write

**6. accounts_audit_log**
- Tracks all changes to active accounts
- Fields:
  - `id` (UUID, PK)
  - `user_id` (UUID, FK to auth.users)
  - `user_email` (text)
  - `action_type` (text) - account_created, account_updated, etc.
  - `account_id` (UUID, FK to active_accounts)
  - `account_name` (text)
  - `previous_data` (jsonb)
  - `new_data` (jsonb)
  - `status` (text) - pending, approved, undone
  - `reviewed_at` (timestamp, nullable)
  - `reviewed_by` (UUID, nullable)
  - `reviewer_email` (text, nullable)
  - `can_undo` (boolean)
  - `undo_data` (jsonb)
  - `created_at` (timestamp)
- **RLS Policy**: Authenticated users can read/insert, admins can update

**Storage Bucket: Contracts**
- **Type**: Private bucket
- **Access**: Authenticated users only via signed URLs
- **File Path Storage**: Database stores file paths, not full URLs
- **Signed URLs**: Generated on-demand with 1-hour expiry (view) or 24-hour (download)
- **RLS Policies**:
  - Authenticated users can INSERT, SELECT, UPDATE, DELETE
  - Private bucket prevents direct public access

### Database Functions & Triggers

**validate_email_domain()** (Trigger Function)
- Fires on INSERT/UPDATE to auth.users
- Validates email domain against allowed_domains table
- Raises exception if domain not allowed or inactive

**log_admin_action()** (RPC Function)
- Called from frontend for admin actions
- Inserts record into admin_audit_log
- Requires admin authentication

**get_user_stats()** (RPC Function)
- Returns user statistics for admin dashboard
- Total users, active users, admin count

**log_account_change()** (RPC Function)
- Logs changes to active accounts
- Parameters: action_type, account_id, previous_data, new_data, undo_data
- Returns log entry ID

**approve_account_change()** (RPC Function)
- Marks account change as approved
- Prevents undo after approval
- Admin only

**undo_account_change()** (RPC Function)
- Reverses pending account changes
- Returns undo_data for application to execute
- Admin only

## Data Management

### Static Content
All documentation content is defined in component files:
- **Guides**: `src/data/guidesData.js` - metadata and content
- **Services**: Defined directly in CoreServices.js
- **Processes**: Defined directly in CoreProcesses.js
- **Links**: Hardcoded URLs in SheetsDocs.js and Sidebar.js

Content updates require code changes and redeployment.

### Dynamic Data (Supabase)
User and authentication data managed in Supabase:
- **User Profiles**: Stored in `user_profiles` table
- **Admin Permissions**: Stored in `auth.users.user_metadata.is_admin`
- **Email Domains**: Stored in `allowed_domains` table
- **Audit Logs**: Stored in `admin_audit_log` table
- **Active Accounts**: Stored in `active_accounts` table with 580+ initial entries
- **Account Changes**: Tracked in `accounts_audit_log` table
- **Contract PDFs**: Stored in private `Contracts` bucket, accessed via signed URLs

### State Management

**Global State (Context API):**
- `AuthContext` - authentication state
  - `user` - current user from Supabase
  - `profile` - user profile data
  - `loading` - authentication loading state
  - `isAdmin` - admin flag from user metadata

**Local State (useState):**
- `darkMode` - theme preference (root layout)
- `activeId` - current TOC section (TableOfContents.tsx)
- `showDescription` - expanded cards (sheets-and-docs page)
- `isOpen` - mobile sidebar toggle (Layout.tsx)
- Admin panel states - users list, audit logs, etc.

**TanStack Query State:**
- Server state caching and synchronization
- Background refetching
- Optimistic updates
- Error handling and retries

No global state library (Redux, MobX) needed - TanStack Query + useState is sufficient.

## Security Model

### Row Level Security (RLS)

All Supabase tables are protected by RLS policies:

**user_profiles:**
```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON user_profiles
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
```

**allowed_domains:**
```sql
-- Anyone can read allowed domains (for signup validation)
CREATE POLICY "Anyone can read allowed domains" ON allowed_domains
  FOR SELECT USING (true);

-- Only admins can modify domains
CREATE POLICY "Admins can manage domains" ON allowed_domains
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
```

**admin_audit_log:**
```sql
-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON admin_audit_log
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs" ON admin_audit_log
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
```

### Authentication Security

- **Email Domain Validation**: Database trigger validates email domains on signup
- **Password Requirements**: 8+ characters minimum (enforced client-side and by Supabase)
- **Email Verification**: Optional email confirmation (configured in Supabase)
- **Session Management**: Auto-refresh tokens, persistent sessions with localStorage
- **Protected Routes**: All content requires authentication
- **Admin Routes**: Admin panel requires `is_admin` flag in user metadata
- **Audit Trail**: All admin actions logged with timestamp and actor

### Frontend Security

- **No Service Role Key**: Only `anon` key used in frontend (safe to expose)
- **RLS Enforcement**: All data access controlled by database policies
- **Environment Variables**: Credentials in `.env.local` (not committed to Git)
- **HTTPS Only**: Supabase API calls use HTTPS
- **XSS Protection**: React automatically escapes rendered content
- **CSRF Protection**: Supabase handles CSRF tokens
- **Private Storage**: PDFs stored in private bucket, not publicly accessible
- **Signed URLs**: Temporary authenticated URLs (1 hour for viewing, 24 hours for download)
- **File Path Storage**: Database stores paths, not full URLs, preventing unauthorized access

## Build & Deployment

### Development
```bash
npm start
# Runs at localhost:3000
# Hot reload enabled
# Connects to Supabase backend
```

**Prerequisites:**
- `.env.local` configured with Supabase credentials
- Supabase project set up and database tables created

### Production Build
```bash
npm run build
# Creates optimized static files in build/
# Environment variables baked in at build time
# Code splitting and minification automatic
# Ready for static hosting
```

### Deployment Options

**Netlify (Recommended):**
1. Connect Git repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. **Add environment variables:**
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
5. Auto-deploy on push
6. CDN distribution included
7. Free SSL certificates

**Vercel:**
1. Import Git repository
2. Framework: Create React App
3. **Add environment variables:**
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
4. Auto-deploy
5. Edge network distribution

**Manual Hosting:**
1. Build with environment variables
2. Upload `build/` folder contents
3. Configure server to route all requests to `index.html`

## Performance Optimizations

### Built-in React Optimizations
- Code splitting via React Router
- Lazy loading of route components
- Automatic batching of state updates
- Concurrent rendering features
- Memoized AuthContext to prevent unnecessary re-renders

### Tailwind CSS Optimizations
- PurgeCSS removes unused styles
- Production build is <50KB CSS
- Critical CSS inlined automatically

### Supabase Optimizations
- Automatic connection pooling
- Built-in caching for queries
- CDN distribution for API calls
- Real-time subscriptions use WebSockets (efficient)

### Static Assets
- Logo and images optimized
- Service worker for offline capability (PWA)
- Manifest for "Add to Home Screen"
- localStorage for session persistence (no network call on page load)

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS Safari 12+, Chrome Android 80+
- **Features**: CSS Grid, CSS Custom Properties, ES6+

## Accessibility Features
- Semantic HTML structure
- Proper heading hierarchy (h1-h6)
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators for keyboard users
- Color contrast ratios meet WCAG AA

## Future Enhancement Paths

### Easy Additions (Current Architecture)
- Add more pages/guides
- Add more calculators/tools
- Update styling/theming
- Add more external links
- Email notifications for admin actions
- User activity tracking
- Enhanced profile fields

### Medium Complexity (Requires Supabase Extensions)
- Export Active Accounts to Excel/CSV
- Advanced filtering and sorting on Active Accounts
- Account change approval workflow (UI for accounts_audit_log)
- Full-text search across all content (using Postgres full-text search)
- Favorites/bookmarks system (new Supabase table)
- Comments and feedback on guides (new Supabase table)
- Print-friendly CSS and PDF export
- File uploads for user avatars (Supabase Storage)
- Google OAuth integration (when Google Workspace admin access available)
- Touch Planning feature

### Advanced Features (Requires Architecture Changes)
- Real-time notifications (Supabase real-time subscriptions)
- Usage analytics dashboard (Supabase analytics or third-party)
- Content versioning and history (new Supabase tables)
- Multi-language support (i18n library + content tables)
- Advanced reporting for admins (custom queries + charts)
- Content management system (CMS) for non-technical editors

## Why This Architecture Works

### For Current Needs:
✅ **Secure**: Enterprise-grade authentication with RLS policies
✅ **Simple**: Supabase handles all backend complexity
✅ **Fast**: React frontend loads instantly, Supabase provides fast API responses
✅ **Reliable**: 99.9% uptime SLA from Supabase with automatic backups
✅ **Cost-Effective**: Free Supabase tier for small teams, scales affordably
✅ **Developer Experience**: Authentication, database, and real-time features out of the box
✅ **Auditable**: Complete audit trail of all admin actions
✅ **Maintainable**: No custom backend code to maintain

### For Future Growth:
✅ **Scalable**: Supabase scales from 0 to millions of users
✅ **Flexible**: Easy to add new features with Supabase extensions
✅ **Modern**: Uses latest React and PostgreSQL features
✅ **Team-Friendly**: Multiple admins can manage users and content
✅ **Extensible**: Can add real-time features, file storage, analytics, etc.
✅ **Compliant**: RLS policies ensure data privacy and security

### Key Decisions Explained:

**Why Supabase over custom backend?**
- No server infrastructure to maintain
- Built-in authentication saves weeks of development
- RLS policies provide database-level security
- Real-time capabilities available when needed
- Automatic backups and scaling included

**Why email domain restriction?**
- Ensures only company employees can access
- Simple to manage via Admin Panel
- Works without Google Workspace admin access
- Can be extended later with Google OAuth

**Why Context API over Redux?**
- Simpler learning curve for team members
- Sufficient for authentication state management
- Less boilerplate code
- Native React feature (no additional dependencies)

**Why Admin Panel vs. Supabase Dashboard for user management?**
- Better UX for non-technical admins
- Integrated with app's theme and navigation
- Audit logging built in
- Can customize features specific to business needs

This architecture provides exactly what's needed for a secure, authenticated documentation and knowledge management portal, with room to grow as business needs evolve.
