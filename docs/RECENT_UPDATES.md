# Recent Updates Log

## December 2025 - Badge System Standardization & Documentation Cleanup

### 🎯 Major Updates - Current Version
Badge system standardization across all service pages and comprehensive documentation cleanup for the Next.js application. All WR/LM services now have consistent branding with Sneller blue color scheme.

**📋 See Detailed Documentation:**
- **[December 2025 Updates](./DECEMBER_2025_UPDATES.md)** - Complete change log with badge system and cleanup details
- **[UI Styling Guide](./UI_STYLING_GUIDE.md)** - Design system patterns and implementation guide
- **[November 2025 Updates](./NOVEMBER_2025_UPDATES.md)** - Previous UI consistency improvements

**🔧 Key Improvements:**
- Unified badge system: WR services use Sneller blue, LM services use secondary colors
- Consistent badge display across Core Services, Add-On Services, and Product Knowledge pages
- Simplified service section titles (removed verbose "(WR)" and "(LM)" text)
- Process Guides page alignment and header standardization  
- Removed outdated SQL files and legacy documentation
- Enhanced horizontal scrolling controls

**🎨 Badge System:**
- **WR Services**: `bg-[#0A93D5]/10 text-[#0A93D5] ring-[#0A93D5]/20` (Sneller blue theme)
- **LM Services**: `bg-secondary/20 text-secondary-foreground ring-secondary/30` (Secondary color theme)
- **Display Logic**: "Snow" → "WR", "Lawn" → "LM" for clearer service identification
- **Brand Consistency**: Sneller blue (#0A93D5) as primary service color

## November 2025 - UI Consistency & Admin Panel Improvements (Previous)

---

> **⚠️ LEGACY DOCUMENTATION BELOW**  
> The following sections contain update logs from the previous React version of AMBER.  
> Current version uses Next.js App Router structure. See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for current architecture.

## January 2025 - UI Styling Standardization (Pre-Next.js Rewrite)

### Overview
Major styling updates to create consistent visual hierarchy throughout the application using uppercase text styling and standardized typography patterns.

### Changes Made

#### 1. Uppercase Styling Implementation
Applied uppercase styling to all major page titles and section headers to create professional visual hierarchy:

**Page Titles (h1):**
- Core Services (`src/pages/CoreServices.js:164`)
- Core Processes (`src/pages/CoreProcesses.js:147`)
- Add-On Services (`src/pages/AddOnServices.js:297`)
- Product Info (`src/pages/ProductKnowledge.js:134`)
- Sheets & Docs (`src/pages/SheetsDocs.js:89`)
- Platforms (`src/pages/Platforms.js:91`)
- Estimating Tools (Calculators) (already had uppercase)
- Active Accounts (already had uppercase)

**Section Headers (h2):**
- All process titles in CoreProcesses.js (`src/pages/CoreProcesses.js:155`)
- All service titles in CoreServices.js (`src/pages/CoreServices.js:172`)
- All service titles in AddOnServices.js (`src/pages/AddOnServices.js:305`)
- Category headers in ProductKnowledge.js (`src/pages/ProductKnowledge.js:142`)

**Subsection Headers (h3):**
- Product titles in ProductKnowledge.js (`src/pages/ProductKnowledge.js:147`)

**Card Titles:**
- Calculator card titles (`src/pages/Calculators.js:71, 146, 240`)

**Filter Labels:**
- All 10 filter labels in ActiveAccounts page (`src/pages/ActiveAccounts.js:442, 458, 474, 490, 505, 521, 536, 552, 568, 584`)

#### 2. Text Replacements: "and" → "&"
Replaced all instances of "and" with "&" in titles for conciseness:

**CoreServices.js:**
- "Irrigation Startup and Shutdown" → "Irrigation Startup & Shutdown" (line 57)
- "Lawn Weed Control and Fertilizer Program" → "Lawn Weed Control & Fertilizer Program" (line 81)
- "Pruning and Trimming" → "Pruning & Trimming" (line 149)

**Sidebar.js:**
- "Sheets and Docs" → "Sheets & Docs" (line 38)

**SheetsDocs.js:**
- Page title updated to "Sheets & Docs" (line 89)

**guidesData.js:**
- "Creating/Editing LM and SP Maps" → "Creating/Editing LM & SP Maps" (line 702)

#### 3. Acronym Updates
Updated service provider coordination title:
- "Service Provider Coordination (SSPs/MSPs)" → "Service Provider Coordination (MSP/SSP)" (`src/pages/CoreProcesses.js:76`)

#### 4. Badge Alignment Fix
Fixed vertical alignment of Snow/Lawn badges next to service titles:
- Changed from `items-baseline` to `items-center` for proper vertical centering
- Affected files:
  - `src/pages/CoreServices.js:172`
  - `src/pages/AddOnServices.js:305`
  - `src/pages/ProductKnowledge.js:147`

#### 5. Table of Contents Updates
Updated TableOfContents component for selective uppercase styling:
- Only "Ice Melt Products" and "Lawn Care Products" display in uppercase
- All other TOC items remain in regular case to match sidebar navigation pattern
- Implementation uses conditional span wrapper: `src/components/TableOfContents.js:136, 179`

#### 6. PropertyDetail Page Enhancement
Added new section header with icon:
- **PROPERTY DETAILS** section with ClipboardList icon (`src/pages/PropertyDetail.js:679-685`)
- Uppercase styling applied to all three section headers:
  - PROPERTY DETAILS (ClipboardList icon)
  - SERVICE INFORMATION (Briefcase icon)
  - ACCOUNT NOTES (StickyNote icon)

#### 7. Removed Pages & Features
Cleaned up unused/planned features:
- Removed "EOS Worldwide" page and sidebar link
- Removed "The KAM Club" page and sidebar link
- Removed "Submit PO" link from Tools & Resources section
- Deleted files: `src/pages/EOS.js`, `src/pages/KAMClub.js`
- Updated `src/App.js` to remove routes and imports
- Updated `src/components/Sidebar.js` to remove navigation items

### Files Modified

#### Components
- `src/components/Sidebar.js` - Navigation updates, "Sheets & Docs" naming
- `src/components/TableOfContents.js` - Selective uppercase for specific sections

#### Pages
- `src/pages/CoreServices.js` - Uppercase h1/h2, text replacements, badge alignment
- `src/pages/CoreProcesses.js` - Uppercase h1/h2, acronym update
- `src/pages/AddOnServices.js` - Uppercase h1/h2, badge alignment
- `src/pages/ProductKnowledge.js` - Uppercase h1/h2/h3, badge alignment
- `src/pages/SheetsDocs.js` - Uppercase h1, text replacement
- `src/pages/Platforms.js` - Uppercase h1
- `src/pages/Calculators.js` - Uppercase card titles
- `src/pages/ActiveAccounts.js` - Uppercase filter labels
- `src/pages/PropertyDetail.js` - Added PROPERTY DETAILS section, uppercase headers
- `src/App.js` - Removed EOS and KAM Club routes

#### Data Files
- `src/data/guidesData.js` - Text replacement in guide title

#### Files Deleted
- `src/pages/EOS.js`
- `src/pages/KAMClub.js`

### Design Patterns Established

#### Uppercase Usage Guidelines
✅ **Use uppercase for:**
- All page titles (h1)
- Major section headers (h2) in documentation pages
- Product/service titles (h2/h3 in Core Services, Add-On Services, Product Info)
- Filter labels
- Card titles representing major sections
- Sidebar section headers (QUICK ACCESS, KNOWLEDGE, TRAINING, TOOLS & RESOURCES)
- Specific TOC items: "Ice Melt Products", "Lawn Care Products"

❌ **Do NOT use uppercase for:**
- Body text
- Most button labels (unless single word like "SAVE")
- Navigation items under sidebar sections
- Most TOC items (exceptions listed above)
- Subsection content

#### Text Style Guidelines
- Replace "and" with "&" in all titles
- Use acronyms consistently (e.g., MSP/SSP format)
- Badge elements should be vertically centered with titles using `items-center`

### Testing Notes
- All changes are visual/styling only
- No functional changes to application logic
- No database schema changes
- All pages remain accessible and functional
- Responsive design maintained across breakpoints

### Browser Compatibility
- Changes use standard CSS text-transform
- Tested in modern browsers (Chrome, Firefox, Safari, Edge)
- Dark mode support maintained

### Documentation Created
- `docs/UI_STYLING_GUIDE.md` - Comprehensive guide to all UI styling patterns
- `docs/PROJECT_STRUCTURE.md` - Updated to reflect current file structure
- `docs/RECENT_UPDATES.md` - This file

### Future Considerations
1. Consider creating a reusable `PageTitle` component to enforce uppercase styling
2. Consider creating a `SectionHeader` component with consistent icon + text pattern
3. Monitor for new pages to ensure styling consistency
4. Update any future content to follow established text replacement patterns

### Related Documentation
- See `UI_STYLING_GUIDE.md` for complete styling patterns and usage guidelines
- See `PROJECT_STRUCTURE.md` for current file organization
- See `ARCHITECTURE.md` for technical architecture details
