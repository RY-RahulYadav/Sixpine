# Sixpine Ecommerce - React Application

This project has been converted from HTML to a React application with React Router DOM.

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Navbar.tsx       # Top navigation bar
│   │   ├── SubNav.tsx       # Sub navigation with mega menu
│   │   ├── CategoryTabs.tsx # Category tabs navigation
│   │   ├── HeroSection.tsx  # Hero slider section
│   │   ├── KeepShopping.tsx # Keep shopping cards section
│   │   ├── HomeDeals.tsx    # Home deals section
│   │   ├── ProductCarousel.tsx # Reusable product carousel
│   │   ├── Banner.tsx       # Banner component
│   │   └── Footer.tsx       # Footer with back to top
│   ├── pages/              # Page components
│   │   └── LandingPage.tsx # Main landing page
│   ├── styles/             # CSS files
│   │   ├── main.css        # Main styles
│   │   ├── hero.css        # Hero section styles
│   │   ├── styles.css      # General styles
│   │   ├── tab-menu.css    # Tab menu styles
│   │   └── footer.css      # Footer styles
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Entry point
│   └── global.d.ts         # TypeScript declarations
└── index.html              # HTML template with CDN links
```

## Features

- ✅ React with TypeScript
- ✅ React Router DOM for navigation
- ✅ Component-based architecture
- ✅ Bootstrap 5 for styling
- ✅ Owl Carousel for sliders
- ✅ Animate.css for animations
- ✅ Bootstrap Icons & Font Awesome
- ✅ Responsive design

## Components

### Navigation Components
- **Navbar**: Top navigation with search, account, and cart
- **SubNav**: Secondary navigation with mega menu for categories
- **CategoryTabs**: Horizontal tabs for product categories

### Content Components
- **HeroSection**: Animated hero slider with product highlights
- **KeepShopping**: Grid of shopping recommendation cards
- **HomeDeals**: Deal sections for home items and furniture
- **ProductCarousel**: Reusable carousel for displaying products
- **Banner**: Promotional banner section

### Layout Components
- **Footer**: Complete footer with links and back-to-top button

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Libraries Used

- **React Router DOM**: Client-side routing
- **Bootstrap 5**: UI framework
- **Owl Carousel**: Product sliders
- **Animate.css**: CSS animations
- **Bootstrap Icons**: Icon library
- **Font Awesome**: Additional icons

## Notes

- All CDN resources are loaded in `index.html`
- jQuery is used for Owl Carousel initialization
- TypeScript types are declared in `global.d.ts`
- CSS files are imported in `main.tsx`

## Future Enhancements

- Add more pages (Shop, Product Details, Cart, Checkout)
- Implement state management (Redux/Context API)
- Add backend API integration
- Implement authentication
- Add product filtering and search functionality
