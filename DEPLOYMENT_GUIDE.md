# Complians Website - Production Deployment Guide

## 🚀 Quick Start for Production

This guide will help you deploy your Complians digital compliance products website to production using Vercel, Supabase, and Stripe.

## 📋 Prerequisites

- GitHub account (for code repository)
- Vercel account (ian.refugio@yahoo.co.uk)
- Supabase account
- Stripe account
- Domain name (optional)

## 🔧 Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Choose a region close to your users (EU for UK compliance)
4. Note down your project URL and anon key

### 1.2 Set Up Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Run the SQL from `database-schema.sql`
3. Run the sample data from `sample-data-with-videos.sql`

### 1.3 Configure Storage
1. Go to Storage in Supabase dashboard
2. Create a bucket named `products`
3. Set up RLS policies as described in `SUPABASE_SETUP.md`

### 1.4 Set Up Authentication
1. Go to Authentication > Settings
2. Enable email authentication
3. Configure email templates
4. Set site URL to your production domain

## 💳 Step 2: Configure Stripe

### 2.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Complete business verification
3. Enable live mode

### 2.2 Create Products
1. Go to Products in Stripe dashboard
2. Create products matching your database entries
3. Note down the price IDs
4. Update database with Stripe price IDs

### 2.3 Set Up Webhooks
1. Go to Webhooks in Stripe dashboard
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Note down webhook secret

## 🌐 Step 3: Deploy to Vercel

### 3.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/sponsorcomplians/complians-website.git
git push -u origin main
```

### 3.2 Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings (Next.js preset)
4. Add environment variables (see Step 4)

### 3.3 Configure Domain
1. Add your custom domain in Vercel dashboard
2. Update DNS records as instructed
3. Enable SSL (automatic)

## 🔐 Step 4: Environment Variables

Add these to Vercel environment variables:

```env
# NextAuth.js
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secret-key-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (for authentication)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 📁 Step 5: Upload Product Files

### 5.1 Prepare Files
1. Convert DOCX files to PDF if needed
2. Optimize file sizes
3. Organize in folders by product

### 5.2 Upload to Supabase Storage
1. Use Supabase dashboard or API
2. Upload to `products` bucket
3. Update database with correct file paths

## 🎥 Step 6: Add Video Content

### 6.1 Video Hosting Options
- **Recommended**: Upload MP4 files to Supabase Storage
- **Alternative**: Use Mux.com for professional video hosting
- **Budget**: Use YouTube unlisted videos

### 6.2 Update Database
Update product records with video URLs:
```sql
UPDATE products SET video_url = 'your-video-url' WHERE slug = 'product-slug';
```

## 🖼️ Step 7: Add Logo and Branding

### 7.1 Logo Setup
1. Upload `complians_logo.jpg` to `/public/images/`
2. Update Header component to use actual logo
3. Create favicon from logo

### 7.2 Brand Customization
- Colors are already set (#263976, #00c3ff)
- Font is set to Arial
- Adjust any additional branding as needed

## 🧪 Step 8: Testing Production

### 8.1 Test User Flow
1. Browse products
2. Sign up with real email
3. Complete test purchase (use Stripe test cards)
4. Access dashboard
5. Download files
6. Watch videos

### 8.2 Test Payments
Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Declined: 4000 0000 0000 0002

## 📊 Step 9: Analytics and Monitoring

### 9.1 Set Up Analytics
- Add Google Analytics
- Set up Vercel Analytics
- Monitor Supabase usage

### 9.2 Error Monitoring
- Set up Sentry for error tracking
- Monitor Vercel function logs
- Set up Stripe webhook monitoring

## 🔒 Step 10: Security Checklist

- ✅ HTTPS enabled
- ✅ Environment variables secured
- ✅ Database RLS policies active
- ✅ File access controlled
- ✅ Webhook signatures verified
- ✅ Rate limiting implemented

## 📞 Support and Maintenance

### Regular Tasks
- Monitor payment processing
- Update product content
- Review user feedback
- Update dependencies
- Backup database

### Troubleshooting
- Check Vercel function logs
- Monitor Supabase logs
- Review Stripe dashboard
- Test email delivery

## 🎉 Go Live!

Once everything is tested and working:
1. Switch Stripe to live mode
2. Update environment variables
3. Test with real payment
4. Announce launch!

---

**Need Help?** 
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- Stripe Documentation: [stripe.com/docs](https://stripe.com/docs)

