# Mega Menu with Search Integration - Implementation Guide

## Overview
The mega menu navigation now integrates with the search functionality. When users click on any submenu item, they are redirected to the products page with an automatic search query that fills the search bar.

## How It Works

### 1. **Submenu Links** (CategoryTabs.tsx)
All submenu items now use search query parameters instead of category routes:

**Before:**
```tsx
<Link to={`/category/${item.toLowerCase().replace(/\s+/g, '-')}`}>
  {item}
</Link>
```

**After:**
```tsx
<Link to={`/products?search=${encodeURIComponent(item)}`}>
  {item}
</Link>
```

### 2. **Search Bar Auto-Fill** (Navbar.tsx)
The search bar automatically populates when there's a `search` parameter in the URL:

```tsx
// Update search query when URL params change
useEffect(() => {
  const searchParam = searchParams.get('search');
  if (searchParam) {
    setSearchQuery(decodeURIComponent(searchParam));
  } else {
    setSearchQuery('');
  }
}, [searchParams]);
```

### 3. **Product Filtering** (ProductListPage.tsx)
The products page already reads the search query and filters accordingly:

```tsx
const searchQuery = searchParams.get('search');
if (searchQuery) {
  params.q = searchQuery;
}
```

## User Flow Example

1. **User hovers** over "Sofa & Couches" in the mega menu
2. **Mega menu opens** showing subcategories
3. **User clicks** on "3 Seater Sofas"
4. **Redirects to**: `/products?search=3%20Seater%20Sofas`
5. **Search bar** automatically shows "3 Seater Sofas"
6. **Products** are filtered to show 3 seater sofas

## Updated Menu Structure

### All Categories
- **All** → Home page (no search)
- **Submenu items** → `/products?search=<item name>`

### Individual Categories

#### Sofa & Couches
- Main link: `/products?search=Sofa`
- Submenu items:
  - 3 Seater Sofas → `/products?search=3%20Seater%20Sofas`
  - 2 Seater Sofas → `/products?search=2%20Seater%20Sofas`
  - etc.

#### Sofa Chairs
- Main link: `/products?search=Sofa%20Chairs`
- Submenu items: Lounge Chairs, Wing Chairs, etc.

#### Rocking Chairs
- Main link: `/products?search=Rocking%20Chairs`
- Submenu items: Modern, Relax in Motion, Classic

#### Ottomans
- Main link: `/products?search=Ottomans`
- Submenu items: Ottomans with Storage, Decorative Ottomans, etc.

#### Beds & Sofa Cum Beds
- Main link: `/products?search=Beds`
- Submenu items: Queen Size Beds, King Size Beds, etc.

#### Luxury
- Main link: `/products?search=Luxury`
- Submenu items: Sofas, Recliners, Chairs, etc.

## Mobile Navigation
Mobile scroll tabs also updated to use search queries:

```tsx
<Link to="/products?search=Sofa">Sofa & Couches</Link>
<Link to="/products?search=Sofa Chairs">Sofa Chairs</Link>
<Link to="/products?search=Rocking Chairs">Rocking Chairs</Link>
```

## Features

### ✅ Automatic Search Population
- Click any menu item → Search bar fills automatically
- No manual typing needed
- Search term visible to user

### ✅ URL-Based Search
- Search query in URL: `/products?search=3%20Seater%20Sofas`
- Shareable links
- Browser back/forward works correctly

### ✅ Encoded URLs
- Special characters properly encoded
- Spaces converted to `%20`
- Safe for all search terms

### ✅ Consistent Experience
- Desktop mega menu
- Mobile scroll tabs
- Both use same search mechanism

## Technical Details

### URL Encoding
```tsx
// Encodes special characters and spaces
encodeURIComponent("3 Seater Sofas")
// Result: "3%20Seater%20Sofas"

// Decodes back to original text
decodeURIComponent("3%20Seater%20Sofas")
// Result: "3 Seater Sofas"
```

### React Router Integration
```tsx
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();
const searchQuery = searchParams.get('search');
```

### State Synchronization
The search input value is synchronized with URL parameters:
- URL changes → Input updates
- Input changes → URL updates (on submit)
- Always in sync

## Testing Checklist

- [ ] Click mega menu item → Redirects to products page
- [ ] Search bar shows the clicked item name
- [ ] Products are filtered correctly
- [ ] URL contains search parameter
- [ ] Refresh page → Search persists
- [ ] Browser back button → Previous search restored
- [ ] Mobile tabs work the same way
- [ ] Special characters in search work (é, &, etc.)
- [ ] Multiple word searches work ("3 Seater Sofas")

## Code Changes Summary

### Files Modified
1. **CategoryTabs.tsx** - Updated all submenu links to use search queries
2. **Navbar.tsx** - Added URL parameter listener to auto-fill search bar

### Key Changes

#### CategoryTabs.tsx
```tsx
// Changed from category routes to search queries
<Link to={`/products?search=${encodeURIComponent(item)}`}>
  {item}
</Link>
```

#### Navbar.tsx
```tsx
// Added useSearchParams hook
const [searchParams] = useSearchParams();

// Added effect to sync URL with search input
useEffect(() => {
  const searchParam = searchParams.get('search');
  if (searchParam) {
    setSearchQuery(decodeURIComponent(searchParam));
  } else {
    setSearchQuery('');
  }
}, [searchParams]);
```

## Troubleshooting

### Search bar not filling
- Check if URL has `search` parameter
- Verify `useSearchParams` is imported
- Check browser console for errors

### Products not filtering
- Verify backend API supports `q` parameter
- Check network tab for API request
- Ensure ProductListPage reads search params

### Special characters broken
- Always use `encodeURIComponent()` for encoding
- Always use `decodeURIComponent()` for decoding
- Never manually encode URLs

## Future Enhancements

Potential improvements:
- [ ] Breadcrumb navigation showing search path
- [ ] Search history dropdown
- [ ] Related searches suggestions
- [ ] Clear search button
- [ ] Search analytics tracking
- [ ] Category + Search combination filters

## Browser Compatibility

Works on all modern browsers:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

---

**Last Updated**: December 2024
**Version**: 1.0.0
