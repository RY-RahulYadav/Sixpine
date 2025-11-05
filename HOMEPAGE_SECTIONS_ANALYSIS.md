# Homepage Sections Analysis for Customization

## ✅ Completed Sections

### 1. Hero Section (Fully Customizable)
- **Location**: `client/src/components/Home/heroSection.tsx`
- **Admin Panel**: `/admin/homepage` → Hero Section tab
- **Customizable Elements**:
  - ✅ Main Carousel Slides (title, subtitle, price, button text, background color, image)
  - ✅ Special Deal Banner (right side top) - text fields and background image
  - ✅ Mattress Banner (right side bottom) - text fields and background image
  - ✅ Bottom Banner (below slider) - image URL and alt text

## 📋 Remaining Sections to Make Customizable

### 2. HeroSection2 - "Pick up where you left off"
- **Location**: `client/src/components/Home/heroSection2.tsx`
- **Current Structure**:
  - Section 1: Title "Pick up where you left off" with grid of 4 items (images + text)
  - Section 2: Title "New home arrivals under $50" with grid of 4 items
  - "See more" links
- **Needs Customization**:
  - Section titles
  - Grid items (image URLs, text labels)
  - Link text and URLs

### 3. HeroSection3 - Category & Product Slider
- **Location**: `client/src/components/Home/heroSection3.tsx`
- **Current Structure**:
  - Top category cards (8 items): name and image
  - Product slider cards: tag, title, description, price, image
- **Needs Customization**:
  - Category cards (name, image URL)
  - Product slider items (tag, title, description, price, image URL)

### 4. FurnitureCategories - Category Filtering
- **Location**: `client/src/components/Home/furnitureCategories.tsx`
- **Current Structure**:
  - Category list (12 items): title, category, image
  - Slider items (8 items): title, image
  - Filter buttons
  - Description text (short and full)
- **Needs Customization**:
  - Category items (title, category, image URL)
  - Slider items (title, image URL)
  - Description text (short and full versions)
  - Filter categories

### 5. FurnitureSections - Product Discovery
- **Location**: `client/src/components/Home/furnitureSections.tsx`
- **Current Structure**:
  - Multiple product sections (Discover, Trending, etc.)
  - Each section has products with: title, subtitle, price, oldPrice, discount, rating, reviews, image
- **Needs Customization**:
  - Section titles
  - Product items (all fields)
  - Section visibility/order

### 6. FurnitureOfferSection - Offer Sections
- **Location**: `client/src/components/Home/furnitureOfferSections.tsx`
- **Current Structure**:
  - Multiple offer sections with title and link
  - Each section has product image grid
- **Needs Customization**:
  - Section titles
  - Link text and URLs
  - Product image URLs

### 7. FeatureCard - Features Bar & Countdown
- **Location**: `client/src/components/Home/FeatureCard.tsx`
- **Current Structure**:
  - Features bar with icons, counts, and text (100+ stores, etc.)
  - Countdown timer with end date
  - CTA sections
- **Needs Customization**:
  - Feature items (icon, count, text)
  - Countdown end date
  - CTA text and links

### 8. BannerCards - Banner Carousel
- **Location**: `client/src/components/Home/bannerCards.tsx`
- **Current Structure**:
  - Banner carousel (2 banners with images)
  - Product slider below
- **Needs Customization**:
  - Banner images (URLs)
  - Product slider items (all product fields)

### 9. FurnitureInfoSection - Info Content
- **Location**: `client/src/components/Home/FurnitureInfoSection.tsx`
- **Current Structure**:
  - Main heading and intro paragraphs
  - Materials section with cards
  - Shop by room section
  - Other info sections
- **Needs Customization**:
  - All text content (headings, paragraphs)
  - Material cards (title, description)
  - Room cards (title, description, image)

## Implementation Strategy

1. **Create separate admin tabs** for each section in `AdminHomePageManagement.tsx`
2. **Store each section** as separate `HomePageContent` entries with unique `section_key`:
   - `hero` - Hero Section (already done)
   - `hero2` - HeroSection2
   - `hero3` - HeroSection3
   - `categories` - FurnitureCategories
   - `sections` - FurnitureSections
   - `offers` - FurnitureOfferSection
   - `features` - FeatureCard
   - `banners` - BannerCards
   - `info` - FurnitureInfoSection

3. **Update each component** to fetch data from API using `homepageAPI.getHomepageContent(section_key)`

4. **Create admin UI forms** for each section with intuitive input fields

5. **Maintain default values** for all sections when no data exists

## Next Steps

1. ✅ Hero Section - COMPLETED
2. ⏳ Add HeroSection2 customization
3. ⏳ Add HeroSection3 customization
4. ⏳ Add FurnitureCategories customization
5. ⏳ Add FurnitureSections customization
6. ⏳ Add FurnitureOfferSection customization
7. ⏳ Add FeatureCard customization
8. ⏳ Add BannerCards customization
9. ⏳ Add FurnitureInfoSection customization

