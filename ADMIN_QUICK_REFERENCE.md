# Admin Panel Redesign - Quick Reference

## Component Replacement Guide

### 1. Buttons

**❌ Before:**
```tsx
<Link to="/admin/products/new" className="admin-btn primary">
  <span className="material-symbols-outlined">add</span>
  Add New Product
</Link>
```

**✅ After:**
```tsx
<Link to="/admin/products/new" className="admin-modern-btn primary">
  <span className="material-symbols-outlined">add</span>
  Add New Product
</Link>
```

### 2. Tables

**❌ Before:**
```tsx
<div className="admin-table-container">
  <table className="admin-table">
```

**✅ After:**
```tsx
<div className="admin-modern-table-container">
  <table className="admin-modern-table">
```

### 3. Status Badges

**❌ Before:**
```tsx
<span className="status-badge pending">Pending</span>
```

**✅ After:**
```tsx
<span className="admin-status-badge pending">Pending</span>
```

### 4. Cards

**❌ Before:**
```tsx
<div className="admin-panel">
  <h3>Title</h3>
  <div>Content</div>
</div>
```

**✅ After:**
```tsx
<div className="admin-modern-card">
  <div className="admin-card-header">
    <h3 className="admin-card-title">Title</h3>
  </div>
  <div className="admin-card-body">
    Content
  </div>
</div>
```

### 5. Forms

**❌ Before:**
```tsx
<div className="form-group">
  <label>Name</label>
  <input type="text" />
</div>
```

**✅ After:**
```tsx
<div className="admin-form-group">
  <label className="admin-form-label">Name</label>
  <input type="text" className="admin-form-input" />
</div>
```

### 6. Filters

**❌ Before:**
```tsx
<div className="admin-filters">
  <div className="filter-group">
    <select>...</select>
  </div>
  <form className="search-form">...</form>
</div>
```

**✅ After:**
```tsx
<div className="admin-modern-filters">
  <div className="admin-filters-row">
    <div className="admin-filter-group">
      <label className="admin-filter-label">Label</label>
      <select className="admin-form-select">...</select>
    </div>
    <div className="admin-search-box">
      <span className="material-symbols-outlined">search</span>
      <input type="text" placeholder="Search..." />
    </div>
  </div>
</div>
```

### 7. Loading State

**❌ Before:**
```tsx
<div className="admin-loader">
  <div className="spinner"></div>
  <p>Loading...</p>
</div>
```

**✅ After:**
```tsx
<div className="admin-loading">
  <div className="admin-spinner"></div>
  <p className="admin-loading-text">Loading...</p>
</div>
```

### 8. Empty State

**❌ Before:**
```tsx
<td colSpan={5} className="empty-table">
  <div>
    <span className="material-symbols-outlined">inbox</span>
    <p>No items found</p>
  </div>
</td>
```

**✅ After:**
```tsx
<td colSpan={5}>
  <div className="admin-empty-state">
    <div className="admin-empty-icon">
      <span className="material-symbols-outlined">inbox</span>
    </div>
    <h3 className="admin-empty-title">No items found</h3>
    <p className="admin-empty-message">Try adjusting your filters</p>
  </div>
</td>
```

### 9. Icon Buttons

**❌ Before:**
```tsx
<button className="edit-btn">
  <span className="material-symbols-outlined">edit</span>
</button>
```

**✅ After:**
```tsx
<button className="admin-icon-btn primary">
  <span className="material-symbols-outlined">edit</span>
</button>
```

### 10. Alerts

**❌ Before:**
```tsx
<div className="admin-error-message">
  <span className="material-symbols-outlined">error</span>
  {error}
</div>
```

**✅ After:**
```tsx
<div className="admin-alert error">
  <span className="material-symbols-outlined">error</span>
  <div className="admin-alert-content">
    <div className="admin-alert-title">Error</div>
    <div className="admin-alert-message">{error}</div>
  </div>
</div>
```

---

## Common Patterns

### Page Header Pattern
```tsx
<div style={{ marginBottom: 'var(--spacing-xl)' }}>
  <h2 style={{ 
    fontSize: '28px', 
    fontWeight: '700', 
    color: 'var(--admin-dark)', 
    marginBottom: '8px',
    fontFamily: 'var(--font-heading)'
  }}>
    Page Title
  </h2>
  <p style={{ fontSize: '14px', color: 'var(--admin-text-light)' }}>
    Brief description of this page
  </p>
</div>
```

### Stats Card Pattern
```tsx
<div className="admin-stat-card">
  <div className="admin-stat-content">
    <div className="admin-stat-icon primary">
      <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
        icon_name
      </span>
    </div>
    <div className="admin-stat-label">Label</div>
    <div className="admin-stat-value">$1,234</div>
    <div className="admin-stat-change positive">
      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
        trending_up
      </span>
      +12.5% from last month
    </div>
  </div>
</div>
```

### Action Buttons Row
```tsx
<div style={{ 
  display: 'flex', 
  gap: 'var(--spacing-md)', 
  justifyContent: 'space-between',
  marginBottom: 'var(--spacing-lg)'
}}>
  <h2>Page Title</h2>
  <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
    <button className="admin-modern-btn outline">
      <span className="material-symbols-outlined">filter_alt</span>
      Filters
    </button>
    <Link to="/add-new" className="admin-modern-btn primary">
      <span className="material-symbols-outlined">add</span>
      Add New
    </Link>
  </div>
</div>
```

### Grid Layouts
```tsx
// 2 columns
<div className="admin-grid-2">
  {/* Cards */}
</div>

// 3 columns
<div className="admin-grid-3">
  {/* Cards */}
</div>

// 4 columns
<div className="admin-grid-4">
  {/* Cards */}
</div>
```

---

## Status Badge Colors

```tsx
// Success states (green)
<span className="admin-status-badge success">Active</span>
<span className="admin-status-badge success">Delivered</span>
<span className="admin-status-badge success">Paid</span>

// Warning states (yellow)
<span className="admin-status-badge warning">Pending</span>
<span className="admin-status-badge warning">Processing</span>
<span className="admin-status-badge warning">Low Stock</span>

// Error/Danger states (red)
<span className="admin-status-badge error">Cancelled</span>
<span className="admin-status-badge error">Failed</span>
<span className="admin-status-badge error">Inactive</span>

// Info states (blue)
<span className="admin-status-badge info">Shipped</span>
<span className="admin-status-badge info">In Progress</span>
```

---

## Button Variants

```tsx
// Primary (Orange gradient)
<button className="admin-modern-btn primary">Primary</button>

// Secondary (Blue gradient)
<button className="admin-modern-btn secondary">Secondary</button>

// Success (Green gradient)
<button className="admin-modern-btn success">Success</button>

// Danger (Red gradient)
<button className="admin-modern-btn danger">Danger</button>

// Outline (Transparent with border)
<button className="admin-modern-btn outline">Outline</button>

// Ghost (Transparent, no border)
<button className="admin-modern-btn ghost">Ghost</button>

// Sizes
<button className="admin-modern-btn primary sm">Small</button>
<button className="admin-modern-btn primary">Default</button>
<button className="admin-modern-btn primary lg">Large</button>

// Block (Full width)
<button className="admin-modern-btn primary block">Full Width</button>
```

---

## CSS Variable Quick Reference

```css
/* Colors */
var(--admin-primary)         /* #ff6f00 - Orange */
var(--admin-secondary)       /* #357abd - Blue */
var(--admin-success)         /* #067d62 - Green */
var(--admin-warning)         /* #f59e0b - Orange */
var(--admin-error)           /* #ef4444 - Red */

/* Text Colors */
var(--admin-text)            /* #333333 - Dark */
var(--admin-text-light)      /* #888888 - Light */

/* Backgrounds */
var(--admin-bg)              /* #f9f9f9 - Page bg */
var(--admin-card-bg)         /* #ffffff - Card bg */

/* Spacing */
var(--spacing-sm)            /* 8px */
var(--spacing-md)            /* 16px */
var(--spacing-lg)            /* 24px */
var(--spacing-xl)            /* 32px */

/* Radius */
var(--radius-sm)             /* 8px */
var(--radius-md)             /* 12px */
var(--radius-lg)             /* 16px */

/* Shadows */
var(--shadow-sm)
var(--shadow-md)
var(--shadow-lg)
```

---

## Implementation Checklist

When updating a page:

1. ✅ Import `admin-theme.css`
2. ✅ Add page header section
3. ✅ Update all buttons to `admin-modern-btn`
4. ✅ Replace table classes
5. ✅ Update status badges
6. ✅ Replace filter components
7. ✅ Update form elements
8. ✅ Add loading/empty states
9. ✅ Test responsive design
10. ✅ Verify colors match theme

---

## Testing Checklist

- [ ] Desktop view (>1024px)
- [ ] Tablet view (768-1024px)
- [ ] Mobile view (<768px)
- [ ] Button hover states
- [ ] Table scrolling on mobile
- [ ] Filter dropdown behavior
- [ ] Loading spinner animation
- [ ] Empty state displays
- [ ] Color consistency
- [ ] Icon alignment
