# Deployment Guide

This document provides step-by-step instructions for deploying the E-Commerce platform to production.

## Pre-Deployment Checklist

### Backend (Django)

✅ **Security Issues Fixed:**
- ✅ DEBUG set to False by default in production
- ✅ SECRET_KEY configured via environment variable
- ✅ Exposed OAuth credentials removed from code
- ✅ ALLOWED_HOSTS configured properly
- ✅ CORS settings secured
- ✅ SSL/HTTPS settings enabled for production
- ✅ WhiteNoise middleware added for static files

✅ **TypeScript Errors Fixed:**
- ✅ Removed unused React imports
- ✅ Fixed implicit 'any' types
- ✅ Fixed CSS module imports
- ✅ Removed unused icon imports

## Backend Deployment (Django)

### Option 1: Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables in Vercel:**
   Go to your Vercel project settings and add:
   ```
   SECRET_KEY=your-strong-secret-key-here
   DEBUG=False
   ALLOWED_HOSTS=your-domain.vercel.app
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   EMAIL_HOST_USER=your-email@gmail.com
   GOOGLE_OAUTH2_CLIENT_ID=your-client-id
   GOOGLE_OAUTH2_CLIENT_SECRET=your-client-secret
   SECURE_SSL_REDIRECT=True
   ```

3. **Deploy:**
   ```bash
   cd server
   vercel --prod
   ```

### Option 2: Traditional Server Deployment

1. **Update `.env` file:**
   ```bash
   SECRET_KEY=your-production-secret-key
   DEBUG=False
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   SECURE_SSL_REDIRECT=True
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Collect static files:**
   ```bash
   python manage.py collectstatic --noinput
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Start with Gunicorn:**
   ```bash
   gunicorn ecommerce_backend.wsgi:application --bind 0.0.0.0:8000
   ```

## Frontend Deployment (React + Vite)

### Option 1: Vercel Deployment

1. **Update `.env.production`:**
   ```
   VITE_API_BASE_URL=https://your-backend-api.vercel.app/api
   ```

2. **Deploy:**
   ```bash
   cd client
   vercel --prod
   ```

### Option 2: Build and Deploy to Any Static Host

1. **Update `.env.production`:**
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com/api
   ```

2. **Build:**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy the `dist` folder** to:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - GitHub Pages
   - Any static file host

## Post-Deployment Steps

### 1. Test API Endpoints

```bash
# Test health check
curl https://your-api-domain.com/api/

# Test authentication
curl -X POST https://your-api-domain.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'
```

### 2. Verify Frontend

- Visit your frontend URL
- Test user registration
- Test login
- Test product browsing
- Test cart functionality
- Test checkout process

### 3. Setup Email Service

Ensure Gmail OAuth is configured:
```bash
cd server
python setup_oauth_gmail.py
```

Copy the generated `GMAIL_OAUTH_TOKEN` to your production environment variables.

### 4. Database Backup

Set up automated database backups:
- For PostgreSQL: Use pg_dump
- For SQLite (not recommended for production): Regular file backups

### 5. Monitoring

- Set up error tracking (Sentry, Rollbar)
- Configure uptime monitoring
- Set up performance monitoring
- Configure log aggregation

## Environment Variables Reference

### Backend (.env)

```env
# Required
SECRET_KEY=                    # Strong random secret key
DEBUG=False                    # Never True in production
ALLOWED_HOSTS=                 # Comma-separated domain names
CORS_ALLOWED_ORIGINS=          # Frontend URLs

# Email
EMAIL_HOST_USER=               # Gmail address
GOOGLE_OAUTH2_CLIENT_ID=       # Google OAuth Client ID
GOOGLE_OAUTH2_CLIENT_SECRET=   # Google OAuth Client Secret
GMAIL_OAUTH_TOKEN=             # Auto-generated OAuth token

# Security (Production)
SECURE_SSL_REDIRECT=True       # Force HTTPS
```

### Frontend (.env.production)

```env
VITE_API_BASE_URL=             # Backend API URL
```

## Common Deployment Issues

### Issue 1: CORS Errors

**Solution:** Ensure frontend URL is in `CORS_ALLOWED_ORIGINS`:
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend.vercel.app",
    "https://www.your-domain.com"
]
```

### Issue 2: Static Files Not Loading

**Solution:** Run collectstatic and verify WhiteNoise is configured:
```bash
python manage.py collectstatic --noinput
```

### Issue 3: Database Connection Errors

**Solution:** Update database settings for production database (PostgreSQL recommended):
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT', default='5432'),
    }
}
```

### Issue 4: Email Not Sending

**Solution:** 
1. Verify Gmail OAuth token is set
2. Check Google Cloud Console for API quotas
3. Run `python setup_oauth_gmail.py` to refresh token

### Issue 5: TypeScript Build Errors

**Solution:** All TypeScript errors have been fixed. Run:
```bash
npm run build
```
If errors persist, check:
- All imports are correct
- CSS modules use `.module.css` extension
- No unused imports remain

## Security Checklist

- [ ] SECRET_KEY is unique and secure
- [ ] DEBUG=False in production
- [ ] ALLOWED_HOSTS configured
- [ ] SSL/HTTPS enabled
- [ ] CORS properly configured
- [ ] OAuth credentials not in source code
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] Rate limiting implemented
- [ ] Security headers enabled

## Performance Optimization

### Backend

1. **Enable caching:**
   ```python
   CACHES = {
       'default': {
           'BACKEND': 'django.core.cache.backends.redis.RedisCache',
           'LOCATION': 'redis://127.0.0.1:6379/1',
       }
   }
   ```

2. **Database indexing:**
   ```bash
   python manage.py optimize_db
   ```

3. **Configure CDN for media files**

### Frontend

1. **Enable compression in Vite:**
   Already configured via `vite build`

2. **Configure CDN for static assets**

3. **Enable browser caching**

## Rollback Plan

If deployment fails:

1. **Revert to previous version:**
   ```bash
   vercel rollback
   ```

2. **Check logs:**
   ```bash
   vercel logs
   ```

3. **Restore database backup** if needed

## Support

For deployment issues:
1. Check logs: `vercel logs` or server logs
2. Review error messages
3. Consult documentation
4. Create GitHub issue with error details

---

**Last Updated:** October 10, 2025
