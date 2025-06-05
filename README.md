# Complians - Digital Compliance Products Website

A complete full-stack e-commerce platform for selling digital compliance products, built with Next.js, Tailwind CSS, Stripe, Supabase, and designed for deployment on Vercel.

![Complians Website](https://via.placeholder.com/800x400/263976/FFFFFF?text=Complians+Digital+Compliance+Platform)

## 🌟 Features

### 🛍️ E-commerce Functionality
- **Product Catalog**: Dynamic product pages with detailed descriptions
- **Secure Payments**: Stripe Checkout integration with webhook handling
- **User Authentication**: Magic link email authentication via NextAuth.js
- **Protected Downloads**: Secure file access with signed URLs
- **Purchase Tracking**: Complete order history and download logs

### 🎥 Media & Content
- **Video Tutorials**: Custom video player with controls
- **File Downloads**: PDF, DOCX, and Excel file support
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Professional UI**: Clean, modern interface with brand consistency

### 🔐 Security & Compliance
- **Row Level Security**: Supabase RLS for data protection
- **Secure File Access**: Time-limited signed URLs for downloads
- **Payment Security**: PCI-compliant Stripe integration
- **User Privacy**: GDPR-compliant data handling

### 📊 Admin Features
- **Purchase Analytics**: Track sales and user engagement
- **Download Monitoring**: Log and monitor file access
- **User Management**: View and manage customer accounts
- **Content Management**: Easy product and content updates

## 🏗️ Architecture

### Frontend
- **Next.js 15.3.3**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

### Backend
- **Supabase**: PostgreSQL database with real-time features
- **NextAuth.js**: Authentication with email magic links
- **Stripe**: Payment processing and subscription management
- **Vercel**: Serverless deployment platform

### Key Components
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (checkout, webhooks, downloads)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected user dashboard
│   ├── products/          # Product catalog and detail pages
│   └── profile/           # User profile management
├── components/            # Reusable UI components
│   ├── Button.tsx         # Styled button component
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   ├── VideoPlayer.tsx    # Custom video player
│   └── CheckoutButton.tsx # Stripe checkout integration
├── lib/                   # Utility functions and configurations
│   ├── supabase.ts        # Database client setup
│   ├── stripe.ts          # Payment processing
│   ├── auth.ts            # Authentication helpers
│   └── products.ts        # Product data functions
└── types/                 # TypeScript type definitions
    └── database.ts        # Database schema types
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account
- Email service (Gmail/SMTP)

### Local Development
1. **Clone the repository**
   ```bash
   git clone https://github.com/sponsorcomplians/complians-website.git
   cd complians-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Set up database**
   - Create Supabase project
   - Run SQL from `database-schema.sql`
   - Run sample data from `sample-data-with-videos.sql`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🎨 Design System

### Brand Colors
- **Primary**: #263976 (Deep Blue)
- **Secondary**: #00c3ff (Sky Blue)
- **Font**: Arial (site-wide)

### Component Library
- Consistent button styles with variants
- Professional form inputs with validation
- Responsive grid layouts
- Accessible navigation and interactions

## 💳 Payment Flow

1. **Product Selection**: User browses and selects products
2. **Authentication**: User signs in or creates account
3. **Checkout**: Stripe Checkout session created
4. **Payment**: Secure payment processing
5. **Webhook**: Payment confirmation via webhook
6. **Access Granted**: User gains access to purchased content

## 📁 File Management

### Secure Downloads
- Files stored in Supabase Storage
- Access controlled by purchase verification
- Time-limited signed URLs (1 hour expiry)
- Download activity logging

### Supported Formats
- PDF documents
- Microsoft Word (DOCX)
- Excel spreadsheets (XLSX)
- Video files (MP4)

## 🔧 Configuration

### Environment Variables
See `.env.example` for all required variables:
- Supabase credentials
- Stripe API keys
- NextAuth.js configuration
- Email service settings

### Database Schema
The database includes tables for:
- Users and profiles
- Products and categories
- Purchases and transactions
- Download logs and analytics

## 🧪 Testing

### Local Testing
```bash
npm run dev
```

### Production Testing
- Use Stripe test cards for payment testing
- Test email authentication flow
- Verify file download security
- Check responsive design on multiple devices

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy with automatic SSL

### Post-Deployment
1. Configure custom domain
2. Set up Stripe webhooks
3. Upload product files to Supabase Storage
4. Test complete user flow

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## 📊 Analytics & Monitoring

### Built-in Tracking
- Purchase analytics
- Download monitoring
- User engagement metrics
- Error logging

### Recommended Additions
- Google Analytics
- Vercel Analytics
- Sentry error monitoring
- Stripe Dashboard monitoring

## 🔒 Security Features

- **Authentication**: Secure magic link authentication
- **Authorization**: Role-based access control
- **Data Protection**: Row-level security policies
- **Payment Security**: PCI-compliant Stripe integration
- **File Security**: Signed URLs with expiration
- **HTTPS**: SSL/TLS encryption throughout

## 🛠️ Maintenance

### Regular Tasks
- Monitor payment processing
- Update product content
- Review user feedback
- Security updates
- Database backups

### Scaling Considerations
- Supabase auto-scaling
- Vercel serverless functions
- CDN for static assets
- Database optimization

## 📞 Support

### Documentation
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `SUPABASE_SETUP.md` - Database configuration
- `TESTING_RESULTS.md` - Testing documentation

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

This project is proprietary software developed for Complians. All rights reserved.

## 🤝 Contributing

This is a private project. For support or modifications, please contact the development team.

---

**Built with ❤️ for UK Immigration Compliance**

*Helping sponsors maintain their licence and streamline their processes with professional compliance tools and templates designed by immigration experts.*

