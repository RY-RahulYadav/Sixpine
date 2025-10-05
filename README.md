# E-Commerce Platform

A full-stack e-commerce platform built with **Django REST Framework** backend and **React TypeScript** frontend.

## 🚀 Features

### Backend (Django REST Framework)
- **User Authentication**: Registration, Login, JWT tokens, Profile management
- **Product Management**: Product catalog, categories, search, filtering
- **Shopping Cart**: Add/remove items, quantity management
- **Order Management**: Checkout, order tracking, order history
- **Admin Panel**: Complete admin interface with dashboard analytics
- **Email Integration**: Gmail OAuth2 for OTP verification
- **API Documentation**: Swagger/OpenAPI documentation

### Frontend (React TypeScript)
- **Modern UI**: Responsive design with Vite + React
- **Authentication**: Login/Register with OTP verification
- **Product Catalog**: Browse products with filters and search
- **Shopping Cart**: Real-time cart management
- **Checkout**: Complete order placement workflow
- **User Dashboard**: Profile, orders, addresses management
- **Admin Interface**: Product and order management

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **Git**
- **Gmail account** (for email functionality)

## 🛠️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/ecommerce.git
cd ecommerce
```

### 2. Backend Setup (Django)

#### Navigate to server directory
```bash
cd server
```

#### Create virtual environment
```bash
# Windows
python -m venv venv
venv\\Scripts\\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` file with your settings:
```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Email Configuration
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password

# Google OAuth2 Configuration (for Gmail API)
GOOGLE_OAUTH2_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH2_CLIENT_SECRET=your-google-client-secret

# Gmail OAuth Token (automatically managed)
GMAIL_OAUTH_TOKEN=
```

#### Database Setup
```bash
python manage.py migrate
python manage.py createsuperuser
```

#### Load Demo Data (Optional)
```bash
python seed_demo_data.py
```

#### Setup Gmail OAuth (Required for OTP emails)
```bash
python setup_oauth_gmail.py
```
Follow the interactive setup to configure Gmail API authentication.

#### Start Development Server
```bash
python manage.py runserver
```

Backend will be available at: http://localhost:8000

### 3. Frontend Setup (React)

#### Navigate to client directory
```bash
cd ../client
```

#### Install dependencies
```bash
npm install
# or
yarn install
```

#### Start Development Server
```bash
npm run dev
# or
yarn dev
```

Frontend will be available at: http://localhost:5173

## 📚 API Documentation

### Swagger UI Documentation
- **URL**: http://localhost:8000/docs/
- **Interactive**: Test API endpoints directly from browser
- **Complete**: All endpoints with request/response examples

### Swagger YAML
- **URL**: http://localhost:8000/api/swagger.yml
- **Format**: OpenAPI 3.0 specification
- **Download**: Can be imported into other tools

### Postman Collection

#### Import Postman Collection
1. Open Postman
2. Click **Import**
3. Choose **File** tab
4. Select `server/E-Commerce API.postman_collection.json`
5. Click **Import**

#### Collection Features
- ✅ **Pre-configured requests** for all endpoints
- ✅ **Environment variables** for base URL and tokens
- ✅ **Authentication flows** with automatic token management
- ✅ **Test scripts** for validation
- ✅ **Documentation** for each endpoint

#### Postman Environment Setup
1. Create new environment in Postman
2. Add variables:
   ```
   base_url: http://localhost:8000
   token: (will be set automatically after login)
   ```

## 🔑 Authentication

### User Authentication Flow
1. **Register**: `/api/auth/request-otp/` - Request OTP via email
2. **Verify**: `/api/auth/verify-otp/` - Verify OTP and create account
3. **Login**: `/api/auth/login/` - Login with credentials
4. **Profile**: `/api/auth/profile/` - Get/update user profile

### Admin Authentication
- **Login**: `/api/admin/auth/login/` - Admin login
- **Dashboard**: `/api/admin/dashboard/stats/` - Admin analytics

### Token Usage
Include in headers for authenticated requests:
```
Authorization: Token your_token_here
```

## 🌐 Available URLs

### Frontend URLs
- **Home**: http://localhost:5173/
- **Login**: http://localhost:5173/login
- **Register**: http://localhost:5173/register
- **Products**: http://localhost:5173/products
- **Cart**: http://localhost:5173/cart
- **Profile**: http://localhost:5173/profile
- **Orders**: http://localhost:5173/orders

### Backend URLs
- **API Root**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **Swagger Docs**: http://localhost:8000/docs/
- **API Schema**: http://localhost:8000/api/swagger.yml

### Key API Endpoints

#### Public Endpoints
```
GET  /api/products/              # Product list
GET  /api/products/{slug}/       # Product details
GET  /api/home-data/            # Homepage data
POST /api/auth/login/           # User login
POST /api/auth/register/        # User registration
POST /api/auth/request-otp/     # Request OTP
POST /api/auth/verify-otp/      # Verify OTP
```

#### Authenticated Endpoints
```
GET    /api/cart/               # Get cart
POST   /api/cart/add/           # Add to cart
GET    /api/orders/             # User orders
POST   /api/orders/checkout/    # Create order
GET    /api/addresses/          # User addresses
POST   /api/addresses/          # Create address
GET    /api/wishlist/           # User wishlist
```

#### Admin Endpoints
```
GET    /api/admin/dashboard/stats/    # Dashboard stats
GET    /api/admin/users/              # Manage users
GET    /api/admin/products/           # Manage products  
GET    /api/admin/orders/             # Manage orders
GET    /api/admin/categories/         # Manage categories
```

## 📧 Email Configuration

### Gmail OAuth Setup

1. **Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `http://localhost`

2. **Update .env**:
   ```env
   GOOGLE_OAUTH2_CLIENT_ID=your-client-id
   GOOGLE_OAUTH2_CLIENT_SECRET=your-client-secret
   EMAIL_HOST_USER=your-gmail@gmail.com
   ```

3. **Run OAuth Setup**:
   ```bash
   cd server
   python setup_oauth_gmail.py
   ```

### Email Features
- ✅ **OTP Verification** for registration
- ✅ **Order Confirmations** 
- ✅ **Password Reset** emails
- ✅ **OAuth2 Security** - No app passwords needed
- ✅ **Automatic Token Refresh**

## 🗄️ Database

### Models Overview
- **User**: Custom user model with profiles
- **Product**: Product catalog with categories, brands
- **Cart**: Shopping cart with items
- **Order**: Order management with items, addresses
- **Address**: User shipping addresses
- **Category/Brand**: Product organization

### Database Commands
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations  
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load demo data
python seed_demo_data.py
```

## 🚀 Deployment

### Production Environment
1. Set `DEBUG=False` in `.env`
2. Configure production database (PostgreSQL recommended)
3. Set up static file serving (WhiteNoise or CDN)
4. Configure email settings for production
5. Update CORS settings for frontend domain

### Environment Variables (Production)
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=your-production-database-url
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
EMAIL_HOST_USER=your-production-email
GOOGLE_OAUTH2_CLIENT_ID=your-production-oauth-id
GOOGLE_OAUTH2_CLIENT_SECRET=your-production-oauth-secret
```

## 🧪 Testing

### Backend Testing
```bash
cd server
python manage.py test
```

### Frontend Testing
```bash
cd client
npm test
# or
yarn test
```

## 🛠️ Development

### Code Structure

```
ecommerce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── styles/         # CSS styles
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
│
├── server/                 # Django backend  
│   ├── accounts/           # User authentication
│   ├── products/           # Product management
│   ├── cart/               # Shopping cart
│   ├── orders/             # Order processing
│   ├── admin_api/          # Admin interface
│   ├── ecommerce_backend/  # Django settings
│   ├── media/              # Uploaded files
│   ├── manage.py           # Django management
│   ├── requirements.txt    # Backend dependencies
│   └── .env                # Environment variables
│
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

### Adding New Features
1. **Backend**: Create new Django apps in `server/`
2. **Frontend**: Add components in `client/src/`
3. **API**: Update `swagger.yml` for documentation
4. **Tests**: Add tests for new functionality

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

#### 1. Import Error: OrderDetailsModal
**Solution**: Add `.tsx` extension to import:
```typescript
import OrderDetailsModal from '../components/OrderDetailsModal.tsx';
```

#### 2. Gmail OAuth Issues
**Solution**: Run the OAuth setup script:
```bash
python setup_oauth_gmail.py
```

#### 3. Database Migration Issues
**Solution**: Reset migrations:
```bash
python manage.py migrate --fake-initial
```

#### 4. Port Already in Use
**Backend**: Change port in `manage.py runserver 8001`
**Frontend**: Change port in `vite.config.ts`

#### 5. CORS Issues
**Solution**: Update `CORS_ALLOWED_ORIGINS` in Django settings

### Getting Help
- **Issues**: Create GitHub issue with error details
- **Documentation**: Check Swagger docs at `/docs/`
- **Email**: Contact support@yourdomain.com

## 📊 Features Roadmap

### Completed ✅
- User authentication with OTP
- Product catalog with search/filter
- Shopping cart functionality
- Order management
- Admin panel with analytics
- API documentation
- Gmail OAuth integration

### Planned 🚧
- Payment gateway integration
- Real-time notifications
- Product reviews and ratings
- Advanced analytics
- Mobile app (React Native)
- Multi-vendor support

---

**Happy coding!** 🚀