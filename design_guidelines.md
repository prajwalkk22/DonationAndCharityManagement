# Design Guidelines: Donation & Charity Management System

## Design Approach

**Selected Approach:** Design System-Based (Modern Dashboard Pattern)

**Rationale:** This is a utility-focused, data-intensive application requiring clarity, efficiency, and consistency across multiple user roles and workflows.

**Primary References:** Linear (clean data presentation), Stripe Dashboard (financial clarity), Notion (role-based interfaces), Vercel Dashboard (modern admin aesthetics)

**Core Principles:**
- Information clarity over decoration
- Consistent patterns across all role dashboards
- Scannable data hierarchies
- Purposeful whitespace for reduced cognitive load

---

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for receipts, IDs, financial data)

**Hierarchy:**
```
Page Titles: text-3xl font-semibold
Section Headers: text-2xl font-semibold
Card Titles: text-lg font-medium
Subsections: text-base font-medium
Body Text: text-sm
Labels/Metadata: text-xs font-medium uppercase tracking-wide
Data Tables: text-sm
Financial Amounts: text-lg font-semibold tabular-nums
```

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16

**Dashboard Structure:**
- Fixed sidebar navigation (w-64)
- Main content area with max-w-7xl container
- Consistent page padding: px-8 py-6
- Card spacing: gap-6 for grids, space-y-6 for stacks

**Grid Patterns:**
- Metrics/Stats: 3-column grid (grid-cols-1 md:grid-cols-3)
- Campaign Cards: 2-column grid (grid-cols-1 lg:grid-cols-2)
- Data Tables: Full-width with horizontal scroll on mobile

---

## Component Library

### Navigation
**Sidebar (All Roles):**
- Logo/branding at top (h-16)
- Role indicator badge below logo
- Navigation items with icons (h-10 each)
- User profile/logout at bottom
- Active state: subtle border-left indicator

### Dashboard Cards
**Metric Cards:**
- Icon (top-left, h-10 w-10)
- Label (text-xs uppercase)
- Large value (text-2xl font-bold)
- Trend indicator (optional, text-sm)
- Consistent card padding: p-6

**Campaign Cards:**
- Campaign title (text-lg font-semibold)
- Description (text-sm, line-clamp-2)
- Progress bar (h-2 rounded-full)
- Stats row: Goal amount | Raised | Donors (text-sm)
- CTA button (primary action)
- Card structure: p-6 rounded-lg border

### Forms
**Input Fields:**
- Label (text-sm font-medium mb-2)
- Input height: h-10
- Padding: px-4
- Rounded: rounded-md
- Border focus state with ring

**Form Layouts:**
- Single column for primary forms (max-w-md)
- Two-column for complex forms (grid-cols-2 gap-6)
- Field spacing: space-y-4
- Submit button: full-width on mobile, w-auto on desktop

### Data Tables
**Structure:**
- Header row with sort indicators
- Row height: h-12
- Alternating row backgrounds for scannability
- Action column (right-aligned) with icon buttons
- Sticky header on scroll
- Pagination controls below table

**Financial Data:**
- Right-align all amounts
- Tabular numbers (font-variant-numeric: tabular-nums)
- Monospace font for transaction IDs

### Donation Receipt
**Layout:**
- Max-w-2xl centered container
- Header: Organization logo + "Donation Receipt"
- Receipt ID (monospace, prominent)
- Donor information section
- Donation details table
- Campaign information box
- Footer: Thank you message + tax information
- Print/Download buttons (top-right)

### Modals & Overlays
**Modal Dimensions:**
- Small (forms): max-w-md
- Medium (details): max-w-2xl
- Large (tables): max-w-4xl

**Structure:**
- Header (p-6 border-b)
- Content area (p-6)
- Footer with actions (p-6 border-t)

---

## Role-Specific Dashboards

### Admin Dashboard
**Layout:**
- Top: 4 metric cards (Total Campaigns, Total Donations, Active Volunteers, Total Raised)
- Middle: Recent Donations table (latest 10)
- Bottom: Campaign Performance grid (2 columns)
- Sidebar: Quick actions (Create Campaign, Add Event, Manage Users)

### Donor Dashboard
**Layout:**
- Top: Personal giving stats (3 cards: Total Donated, Campaigns Supported, Last Donation)
- Middle: Active campaigns grid (browsable donation targets)
- Bottom: Donation history table with search/filter bar
- Quick donate CTA prominently placed

### Volunteer Dashboard
**Layout:**
- Top: Upcoming events timeline view
- Middle: Event assignment cards (date, location, description)
- Bottom: Participation history
- Availability calendar widget

---

## Interactive States

**Buttons:**
- Primary: Standard height h-10, px-6, rounded-md
- Secondary: Same sizing, border variant
- Icon buttons: h-10 w-10 squared
- Disabled state: reduced opacity (opacity-50)

**Cards:**
- Hover: subtle shadow increase (no color change)
- Click: maintain consistency
- Selected: border indicator

**Progress Bars:**
- Height: h-2
- Animated fill on load
- Rounded ends
- Percentage label inline

---

## Animations

**Use Sparingly:**
- Smooth page transitions (150ms ease)
- Progress bar fills (500ms ease-out)
- Modal enter/exit (200ms)
- NO hover animations, scroll effects, or decorative motion

---

## Images

**Hero/Banner Images:** None required - this is a utility application

**In-Application Imagery:**
- Campaign thumbnail placeholders (16:9 ratio, rounded-md)
- User avatars (circular, h-10 w-10)
- Organization logo (sidebar top, h-12)
- Empty states: simple illustrations for "No campaigns yet" etc.

**Image Strategy:** Minimal decorative imagery; focus on data visualization and functional UI elements

---

## Accessibility

- All form inputs have visible labels
- Focus states clearly visible (ring-2)
- Sufficient contrast for all text
- Keyboard navigation throughout
- ARIA labels for icon-only buttons
- Table headers properly associated

---

This design creates a professional, trustworthy interface optimized for financial transactions and data management while maintaining visual clarity across all user roles.