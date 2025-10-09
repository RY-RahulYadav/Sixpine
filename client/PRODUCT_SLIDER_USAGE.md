# Product Details Slider Component - Usage Guide

## Overview
The `Productdetails_Slider1` component is now a **reusable component** that accepts props to display different product sliders with custom titles and product data.

## Component Structure

### File Locations
- **Component**: `src/components/Products_Details/productdetails_slider1.tsx`
- **Styles**: `src/components/Products_Details/productdetails_slider1.module.css`
- **Data**: `src/data/productSliderData.ts`
- **Usage Example**: `src/pages/newproductdetails.tsx`

## Props Interface

```typescript
interface ProductDetailsSliderProps {
  title: string;        // The heading/title for the slider section
  products: Product[];  // Array of products to display
}

interface Product {
  img: string;         // Image URL/path
  title: string;       // Product name
  desc: string;        // Product description
  rating: number;      // Rating (0-5)
  reviews: number;     // Number of reviews
  oldPrice: string;    // Original price (e.g., "₹15,999")
  newPrice: string;    // Discounted price (e.g., "₹12,999")
}
```

## Usage Example

### 1. Import the component and data

```tsx
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1.tsx";
import { frequentlyViewedProducts, browsingHistoryProducts } from "../data/productSliderData";
```

### 2. Use the component with props

```tsx
{/* First Slider - Frequently Viewed */}
<Productdetails_Slider1 
  title="Customers frequently viewed | Popular products in the last 7 days"
  products={frequentlyViewedProducts}
/>

{/* Second Slider - Browsing History */}
<Productdetails_Slider1 
  title="Inspired by your browsing history"
  products={browsingHistoryProducts}
/>

{/* Third Slider - Similar Products */}
<Productdetails_Slider1 
  title="Similar Products You May Like"
  products={similarProducts}
/>
```

## Available Product Data Sets

The `productSliderData.ts` file contains 4 pre-defined product arrays:

1. **frequentlyViewedProducts** - Popular products
2. **browsingHistoryProducts** - Based on browsing history
3. **similarProducts** - Similar items
4. **recommendedProducts** - Recommended for you

## Creating Custom Product Data

You can create your own product array:

```tsx
const customProducts: Product[] = [
  {
    img: "/images/custom-product.jpg",
    title: "Custom Product",
    desc: "Product description here",
    rating: 4.5,
    reviews: 100,
    oldPrice: "₹10,000",
    newPrice: "₹8,000",
  },
  // Add more products...
];

// Use it
<Productdetails_Slider1 
  title="Custom Product Section"
  products={customProducts}
/>
```

## Features

### Design Features
- ✅ Gray background container (`#f5f5f5`)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Horizontal scrolling with arrow navigation
- ✅ Product cards with:
  - Product image
  - Heart icon (wishlist toggle)
  - Star ratings
  - Price (old & new)
  - "Buy Now" button
  - Shopping cart icon

### Interactive Features
- ✅ Smooth scroll animation
- ✅ Heart/wishlist toggle per product
- ✅ Hover effects on buttons and icons
- ✅ Mobile-optimized touch scrolling

## Styling

The component uses CSS modules for scoped styling. Key styles:
- Gray background: `#f5f5f5`
- Padding: `30px 20px` (desktop), `20px 15px` (mobile)
- Border radius: `10px`
- Product card shadow: `0 2px 6px rgba(0, 0, 0, 0.1)`

## Responsive Breakpoints

- **Desktop**: Default styles
- **Laptop** (≤1024px): Adjusted card widths
- **Tablet** (≤768px): Reduced padding, smaller fonts
- **Mobile** (≤425px): Single column, smaller UI elements

## Current Implementation

In `newproductdetails.tsx`, the component is used 4 times:

1. After `<Productdetails />` - Frequently viewed products
2. After first slider - Browsing history products
3. After `<ProductInformation />` - Similar products
4. After `<CustomerReview />` - Recommended products

Each section has its own title and unique product data, creating a rich product detail page layout similar to major e-commerce sites.

## Tips

1. **Keep product arrays between 4-8 items** for best UX
2. **Use consistent image dimensions** (recommended: 315x160px)
3. **Test on mobile devices** to ensure smooth scrolling
4. **Match the design** shown in reference images by maintaining the gray background style
