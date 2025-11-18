# UI Styling Guide - November 2025

## Overview
This document outlines the comprehensive UI styling patterns implemented across the AMBER Next.js application in November 2025. The goal is to maintain consistent visual design language throughout all pages and components.

## Design System Principles

### 1. Card-Based Layout Pattern
All major sections use consistent card styling:

```tsx
// Main section containers
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
  <div className="p-3 sm:p-6">
    {/* Content */}
  </div>
</div>

// Content containers within sections
<div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
  {/* Field cards */}
</div>
```

### 2. Typography Hierarchy
- **Page Titles**: `text-2xl font-bold text-gray-900 dark:text-white` - ALL CAPS
- **Section Headers**: `text-xl font-bold text-gray-900 dark:text-white` - ALL CAPS  
- **Field Labels**: `text-sm font-semibold text-gray-700 dark:text-gray-300` - ALL CAPS
- **Body Text**: `text-gray-900 dark:text-white font-medium`
- **Muted Text**: `text-gray-500 dark:text-gray-400`

### 3. Responsive Padding Pattern
Consistent spacing that adapts to screen size:
- **Main containers**: `p-3 sm:p-6` 
- **Content areas**: `p-3 sm:p-4`
- **Compact elements**: `p-2 px-3`

### 4. Color Scheme
- **Primary**: Sneller Blue (#0A93D5)
- **Backgrounds**: 
  - Light: `bg-white` / Content: `bg-gray-50`
  - Dark: `bg-gray-800` / Content: `bg-gray-900/50`
- **Borders**: `border-gray-200 dark:border-gray-700`
- **Text**: `text-gray-900 dark:text-white` for primary, `text-gray-600 dark:text-gray-300` for secondary

### 6. Badge System (December 2025)
Consistent badge styling for service identification across all pages:

```tsx
// Badge Display Logic
const getBadgeText = (badge) => {
  return badge === 'Snow' ? 'WR' : badge === 'Lawn' ? 'LM' : badge;
};

// Badge Styling Classes
const getBadgeClasses = (badge) => {
  return badge === 'Snow'
    ? 'bg-[#0A93D5]/10 text-[#0A93D5] ring-[#0A93D5]/20'  // WR - Sneller Blue
    : 'bg-secondary/20 text-secondary-foreground ring-secondary/30';  // LM - Secondary
};

// Implementation Example
<span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getBadgeClasses(service.badge)}`}>
  {getBadgeText(service.badge)}
</span>
```

**Badge Types:**
- **WR Services** (Winter): Sneller blue theme with `#0A93D5` color
- **LM Services** (Lawn Maintenance): Secondary color theme
- **Consistent Display**: "Snow" → "WR", "Lawn" → "LM" across all pages

**Applied To:**
- Core Services page
- Add-On Services page  
- Product Knowledge page

### 7. Global Layout Controls
Prevent horizontal scrolling issues:

```css
/* globals.css */
html, body {
  overflow-x: hidden;
}
```

```tsx
// Layout.tsx - Enhanced containers
<main className="flex-1 overflow-x-hidden">
  <div className="overflow-x-hidden">
    {children}
  </div>
</main>
```

## Page-Specific Patterns

### Property Details Page (Reference Design)
The Property Details page serves as the **reference implementation** for our design system:

#### Header Structure
```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      PAGE TITLE
    </h1>
    <p className="text-gray-600 dark:text-gray-300">
      Descriptive subtitle
    </p>
  </div>
</div>
```

#### Field Cards
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
  <div className="flex items-center gap-3 mb-2">
    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
      <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    </div>
    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">FIELD LABEL</span>
  </div>
  <p className="text-gray-900 dark:text-white font-medium">Field Value</p>
</div>
```

### Admin Panel 
- **Role Badges**: Gold with crown for admin, Sneller blue for users
- **Action Buttons**: Compact neutral styling (`px-2 py-1 text-xs`)
- **Status Badges**: Proper dark mode variants
- **Consistent Tabs**: Border-primary styling with hover states

### Process Guides
- **Cards**: Improved spacing and responsive grid (`xl:grid-cols-3`)
- **Buttons**: Compact styling matching admin panel
- **Development Status**: Button-shaped indicators for consistency

### Active Accounts
- **Title**: ALL CAPS with proper dark mode support
- **Refresh Icon**: `RotateCcw` (circular arrows) for better UX

## Button Styles

### Primary Buttons
```tsx
className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
```

### Compact Buttons (Admin/Action)
```tsx
className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
```

### Neutral Buttons
```tsx
className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
```

## Badge Styles

### Status Badges
```tsx
// Success
className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"

// Warning  
className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"

// Info (Sneller Blue)
className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
```

### Role Badges
```tsx
// Admin (Gold with Crown)
className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"

// User (Sneller Blue)
className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
```

## Dark Mode Support
All components must include proper dark mode variants:
- Use `dark:` prefixes for all color-related classes
- Ensure proper contrast ratios in both light and dark themes
- Test interactive states (hover, focus) in both modes

## Responsive Design
- Mobile-first approach with `sm:` breakpoints
- Consistent padding patterns that scale
- Grid layouts that adapt: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- Icon and text sizing that remains readable on all devices

## Implementation Notes
1. **Consistency First**: Always reference the Property Details page as the design standard
2. **Component Reuse**: Prefer creating reusable utility classes over one-off styles
3. **Testing**: Verify both light and dark modes, all breakpoints
4. **Accessibility**: Maintain proper contrast ratios and focus indicators
5. **Performance**: Use Tailwind's utility classes for optimal CSS optimization

## Recent Pattern Updates (November 2025)
- Removed footer notes from information pages for cleaner appearance
- Standardized all card layouts to Property Details patterns  
- Implemented compact button styling across admin interfaces
- Added proper role indicators with iconography
- Enhanced responsive grid layouts for better mobile experience