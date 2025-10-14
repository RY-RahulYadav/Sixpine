# Shopping List Hero Section Update

## Overview
Updated the Shopping List page to include a hero section with sidebar navigation, matching the design from the provided mockup image.

## Key Changes

### 1. Layout Structure
- **Two-column layout**: Left sidebar (240px) + Right content area (flexible)
- **Sticky sidebar**: Stays visible when scrolling
- **Card-based design**: Both sidebar and content area have white backgrounds with borders

### 2. Left Sidebar
**Features:**
- **Shopping List section**: Shows "Default List" as active item with icon
- **Private section**: Shows empty state "No lists yet"
- **Active state styling**: Light blue background with left border accent
- **Hover effects**: Light gray background on hover

### 3. Hero Section (Top of content area)

#### Header Row
**Left side:**
- Title: "Shopping List" (24px, bold)
- Subtitle: "Private" (13px, gray)
- Invite button with person icon
- Stats display: Checkboxes count (checked: 0, unchecked: 0)

**Right side:**
- "Add Item" button with plus icon
- Search icon button
- Three-dots menu button (dropdown)

#### Action Bar
**Left side:**
- "Search this list" link with search icon
- "Filter & Sort" dropdown link with chevron

**Right side:**
- "Manage list" link
- "Print List" link

### 4. Tabs
- Positioned below hero section
- Two tabs: "Shopping List" and "Ideas"
- Active tab has orange bottom border and bold text
- Background matches content area

### 5. Shopping List Items
**Updated card design:**
- Light gray background (#fafafa)
- Product image (180x180px)
- Product details with title, description, rating
- **Date added**: "Date added 18 August 2025" in italics
- Pricing display
- Action buttons:
  - "Add to Cart" (yellow button)
  - Quantity selector dropdown
  - Move/transfer icon button
  - Delete/trash icon button

### 6. Color Scheme
- **Content background**: #ffffff (white)
- **Page background**: #f5f5f5 (light gray)
- **Card background**: #fafafa (very light gray)
- **Borders**: #e7e7e7 (light gray)
- **Action bar**: #fafafa (very light gray)
- **Active sidebar item**: #e7f5ff (light blue)
- **Active tab border**: #c7511f (orange)
- **Links**: #007185 (teal blue)

### 7. Responsive Behavior

#### Desktop (> 992px)
- Side-by-side layout
- Sticky sidebar
- Full button text visible

#### Tablet (768px - 992px)
- Sidebar moves to top
- Content area takes full width
- Action bar wraps if needed

#### Mobile (< 768px)
- Stacked layout
- Button text hidden on small buttons (icon only)
- Reduced padding and font sizes
- Full-width action buttons in items

## CSS Classes Added

### Layout
- `.shopping-list-main-layout` - Main container with flex layout
- `.shopping-list-sidebar` - Left sidebar styling
- `.shopping-list-content-area` - Right content area

### Sidebar
- `.sidebar-section` - Section container
- `.sidebar-title` - Section heading
- `.sidebar-list-item` - List item with hover/active states
- `.sidebar-list-item.active` - Active state styling
- `.list-icon` - Icon display
- `.list-name` - List name text
- `.sidebar-empty` - Empty state container
- `.empty-text` - Empty state text

### Hero Section
- `.hero-section` - Hero container
- `.hero-header` - Top header row
- `.hero-left` - Left side content
- `.hero-right` - Right side buttons
- `.hero-title` - Main title
- `.hero-subtitle` - Subtitle text
- `.hero-info` - Info section with buttons
- `.hero-stats` - Stats display
- `.icon-btn` - Icon button with text
- `.icon-action-btn` - Action buttons (Add Item, Search, Menu)
- `.stat-item` - Individual stat item

### Action Bar
- `.action-bar` - Action bar container
- `.action-link` - Clickable action links
- `.action-right` - Right-aligned actions

### Item Cards
- `.item-meta-info` - Meta information container
- `.item-date` - Date added text
- `.btn-icon-action` - Icon-only action buttons

## File Changes

### 1. ShoppingListPage.tsx
- Added sidebar structure
- Added hero section with header and action bar
- Moved tabs inside content area
- Updated item cards with date and new action buttons
- Wrapped content in two-column layout

### 2. shoppingList.css
- Added all sidebar styles
- Added all hero section styles
- Updated layout to support two-column design
- Added responsive styles for mobile/tablet
- Updated background colors
- Added padding to content areas

## Usage Example

```tsx
// Structure
<div className="shopping-list-main-layout">
  <div className="shopping-list-sidebar">
    {/* Sidebar content */}
  </div>
  <div className="shopping-list-content-area">
    <div className="hero-section">
      {/* Hero header and action bar */}
    </div>
    <div className="shopping-list-tabs">
      {/* Tabs */}
    </div>
    <div className="shopping-list-content">
      {/* Main content */}
    </div>
  </div>
</div>
```

## Visual Hierarchy

1. **Breadcrumb** (top)
2. **Page Title** (Your Shopping List)
3. **Two-column layout**
   - Left: Sidebar navigation
   - Right: Content area with:
     - Hero section (title, buttons, actions)
     - Tabs (Shopping List / Ideas)
     - Content (list items)
     - Carousel section
     - Recommendations

## Icons Used (Bootstrap Icons)
- `bi-person` - Invite button
- `bi-check2-square` - Checked items count
- `bi-square` - Unchecked items count
- `bi-plus-lg` - Add Item button
- `bi-search` - Search buttons
- `bi-three-dots` - Menu dropdown
- `bi-chevron-down` - Filter & Sort dropdown
- `bi-arrow-down-circle` - Move/transfer item
- `bi-trash` - Delete item

## Notes
- All buttons have proper hover states
- Focus states included for accessibility
- Smooth transitions (0.2s ease)
- Icons properly sized and aligned
- Responsive design tested for multiple breakpoints
- Sticky sidebar on desktop for better UX
