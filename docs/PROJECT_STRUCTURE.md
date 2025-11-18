# Sneller AMBER - Project Structure

## Overview
This document describes the organization of the Sneller AMBER project.

## Directory Structure

```
sneller-amber-v2/
├── docs/                              # 📚 All documentation
│   ├── GETTING_STARTED.md            # Setup and development guide
│   ├── ARCHITECTURE.md               # Technical architecture
│   ├── SUPABASE_SETUP.md             # Supabase configuration
│   ├── ADMIN_APPROVAL_GUIDE.md       # Admin approval system guide
│   ├── TROUBLESHOOTING.md            # Common issues and solutions
│   ├── UI_STYLING_GUIDE.md           # UI styling patterns and conventions
│   ├── AUDIT_LOG_SYSTEM.md           # Account audit logging system
│   ├── RECENT_UPDATES.md             # Recent changes and improvements
│   ├── NOVEMBER_2025_UPDATES.md      # November UI consistency updates
│   ├── DECEMBER_2025_UPDATES.md      # December badge system updates
│   ├── NETLIFY_DEPLOYMENT.md         # Deployment configuration
│   ├── SESSION_MANAGEMENT_FIX.md     # Session management fixes
│   └── PROJECT_STRUCTURE.md          # This file - project organization
│
├── src/                               # ⚛️ Next.js application source
│   ├── app/                          # App Router pages
│   │   ├── layout.tsx               # Root layout with metadata
│   │   ├── page.js                  # Homepage (auth redirect)
│   │   ├── globals.css              # Global styles with overflow controls
│   │   ├── providers.tsx            # TanStack Query provider
│   │   ├── login/page.tsx           # Login page
│   │   ├── active-accounts/
│   │   │   ├── page.tsx             # Account management list with filters
│   │   │   └── [id]/page.tsx        # Individual account details with WR/LM services
│   │   ├── admin/page.tsx           # Admin panel with Sneller blue branding
│   │   ├── profile/page.tsx         # User profile page
│   │   ├── sheets-and-docs/page.tsx # Sheets & Docs page
│   │   ├── core-processes/page.tsx  # Core business processes
│   │   ├── core-services/page.tsx   # Core service offerings with badge system
│   │   ├── add-on-services/page.tsx # Add-on service offerings with badge system
│   │   ├── product-knowledge/page.tsx # Product specifications with badge system
│   │   ├── tools/page.tsx           # Tools page
│   │   ├── tools-platforms/page.tsx # Software platforms used
│   │   └── guides/page.js           # Process guides with standardized layout
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── tooltip.jsx
│   │   ├── Layout.tsx                # Main layout wrapper
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   ├── TopBar.tsx                # Top navigation bar
│   │   └── TableOfContents.tsx       # "ON THIS PAGE" menu component
│   │
│   ├── lib/                          # External libraries and utilities
│   │   ├── supabase.ts               # Supabase configuration (TypeScript)
│   │   ├── utils.ts                  # Utility functions including cn()
│   │   └── query-provider.tsx        # TanStack Query setup
│   │
│   └── middleware.ts                 # Next.js middleware for auth
│
├── public/                            # 🌐 Static assets
│   ├── manifest.json                 # PWA manifest
│   ├── logo512.png                   # App logo
│   └── tools/                        # Tool assets
│
├── .claude/                           # 🤖 Claude Code configuration
├── .next/                             # 📦 Next.js build output (generated)
├── node_modules/                      # 📚 Dependencies (generated)
│
├── .env.local                        # 🔐 Environment variables (NOT committed)
├── .gitignore                        # Git ignore rules
├── next.config.js                    # Next.js configuration
├── next-env.d.ts                     # Next.js TypeScript declarations
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── package.json                      # Project dependencies
└── README.md                         # Project overview
```

## Key Files

### Configuration Files
- **next.config.js**: Next.js configuration with optimizations
- **tsconfig.json**: TypeScript configuration with path mapping
- **tailwind.config.js**: Tailwind CSS configuration with custom theme
- **package.json**: Dependencies and npm scripts
- **.env.local**: Environment variables (Supabase credentials)
- **.gitignore**: Git ignore patterns
- **middleware.ts**: Next.js middleware for authentication

### Core Application Files
- **src/app/layout.tsx**: Root layout with providers and metadata
- **src/app/page.js**: Homepage with auth redirect
- **src/components/Layout.tsx**: Main layout wrapper with sidebar
- **src/lib/supabase.ts**: Supabase client configuration
- **src/middleware.ts**: Route protection and auth checks

### Environment Setup
1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd sneller-amber-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file with:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database**
   - Follow instructions in `/database/README.md`
   - Or see `/docs/SUPABASE_SETUP.md` for detailed guide

5. **Start development server**
   ```bash
   npm run dev
   ```
- **`.env.local`** - Environment variables (not committed to git)
- **`.env.local.example`** - Template for environment variables
- **`package.json`** - npm dependencies and scripts
- **`tailwind.config.js`** - Tailwind CSS theme configuration
- **`components.json`** - shadcn/ui component configuration

### Documentation Files (in `/docs`)
- **`GETTING_STARTED.md`** - Complete setup and development guide
- **`ARCHITECTURE.md`** - Technical architecture and design patterns
- **`SUPABASE_SETUP.md`** - Supabase database setup instructions
- **`ADMIN_APPROVAL_GUIDE.md`** - Manual user approval system guide
- **`TROUBLESHOOTING.md`** - Common issues and solutions
- **`CLEANUP_LOG.md`** - Code cleanup documentation
- **`UI_STYLING_GUIDE.md`** - UI styling patterns, typography, and conventions
- **`AUDIT_LOG_SYSTEM.md`** - Account audit logging system documentation
- **`PROPERTY_DETAIL_UPDATES.md`** - Property detail page features and updates
- **`SESSION_MANAGEMENT_FIX.md`** - Session management and auth fixes
- **`_DOCUMENTATION_REVIEW.md`** - Documentation review and update notes
- **`PROJECT_STRUCTURE.md`** - This file - project organization

### Database Files (in `/database`)
- **`README.md`** - Database setup instructions
- **`supabase_setup.sql`** - Initial database schema and RLS policies
- **`supabase_enable_manual_approval.sql`** - Enable manual user approval
- **`supabase_admin_get_users.sql`** - Admin function to fetch all users
- **`setup_dual_contracts_complete.sql`** - Active Accounts with dual contracts
- **`create_accounts_audit_log.sql`** - Account change tracking system
- **`migrate_pdf_urls_to_paths.sql`** - Migrate existing PDFs to private storage
- **`PRIVATE_BUCKET_SETUP.md`** - Storage bucket and signed URLs setup guide
- **`_CLEANUP_SUMMARY.md`** - Documentation of database cleanup
- **`_BACKUP_initial_accounts_data.sql`** - Backup of 582 initial accounts
- **`_archive/`** - Historical reference scripts (not needed for setup)

## Important Notes

### What's in Git
✅ **Committed:**
- All source code (`/src`)
- Documentation (`/docs`)
- Database scripts (`/database`)
- Configuration templates (`.env.local.example`)
- Package files (`package.json`, `package-lock.json`)

❌ **Not Committed:**
- `.env.local` - Contains API keys
- `node_modules/` - Dependencies (regenerated with `npm install`)
- `build/` - Production build (regenerated with `npm run build`)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sneller-amber
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up database**
   - Follow instructions in `/database/README.md`
   - Or see `/docs/SUPABASE_SETUP.md` for detailed guide

5. **Start development server**
   ```bash
   npm start
   ```

## Additional Resources

### Documentation
- **Main README**: [../README.md](../README.md) - Project overview
- **Setup Guide**: [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Database Setup**: [../database/README.md](../database/README.md)
- **Technical Docs**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Development & Design
- **UI Styling Guide**: [UI_STYLING_GUIDE.md](./UI_STYLING_GUIDE.md) - Design system patterns and component styling
- **November 2025 Updates**: [NOVEMBER_2025_UPDATES.md](./NOVEMBER_2025_UPDATES.md) - Recent UI improvements and admin enhancements
- **Recent Updates**: [RECENT_UPDATES.md](./RECENT_UPDATES.md) - Complete change history

### Design System Notes
The application follows a **Property Details-based design pattern** established in November 2025:
- Consistent card layouts with `rounded-xl` borders and proper spacing
- Typography hierarchy with ALL CAPS titles and semantic text sizing  
- Sneller blue (#0A93D5) primary color with comprehensive dark mode support
- Responsive padding patterns (`p-3 sm:p-6`) and mobile-first design
- Compact button styling for admin interfaces and action elements

See [UI_STYLING_GUIDE.md](./UI_STYLING_GUIDE.md) for complete implementation details.
