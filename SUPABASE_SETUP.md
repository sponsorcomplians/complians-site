# Supabase Setup Guide

This guide will help you set up Supabase for the Digital Compliance Products Website.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Choose a database password and region
4. Wait for the project to be provisioned

## 2. Database Setup

### Run the Schema
1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database-schema.sql`
3. Run the query to create all tables, functions, and policies

### Add Sample Data
1. Copy and paste the contents of `sample-data.sql`
2. Run the query to insert sample products

## 3. Storage Setup

### Create Storage Buckets
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `products`
3. Set the bucket to be public for product thumbnails
4. Create the following folder structure:
   ```
   products/
   ├── qualification-compliance-checker/
   ├── sponsor-licence-audit-toolkit/
   └── immigration-compliance-masterclass/
   ```

### Upload Files
1. Upload the provided `Qualification_Compliance_Checker_Template V2.docx` to the appropriate folder
2. Upload placeholder thumbnail images for each product
3. Upload placeholder video files or set up video hosting

### Storage Policies
Add these RLS policies for the storage bucket:

```sql
-- Allow public access to thumbnails
CREATE POLICY "Public Access to Thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'products' AND (storage.foldername(name))[1] = 'thumbnails');

-- Allow authenticated users to download purchased files
CREATE POLICY "Authenticated users can download purchased files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
  AND public.user_has_purchased_product(auth.uid(), (storage.foldername(name))[1]::uuid)
);
```

## 4. Authentication Setup

### Configure Auth Settings
1. Go to Authentication > Settings
2. Enable email confirmation if desired
3. Set up email templates
4. Configure redirect URLs:
   - Site URL: `http://localhost:3000` (development)
   - Redirect URLs: `http://localhost:3000/auth/callback`

### Social Auth (Optional)
Configure Google, GitHub, or other social providers if needed.

## 5. API Keys

### Get Your Keys
1. Go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

### Update Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 6. Test the Setup

### Verify Database
1. Go to Table Editor
2. Check that all tables are created
3. Verify sample data is inserted

### Test Authentication
1. Try creating a user account
2. Check that a profile is automatically created
3. Verify RLS policies are working

### Test Storage
1. Try uploading a file
2. Verify access permissions
3. Test signed URL generation

## 7. Production Considerations

### Security
- Review and tighten RLS policies
- Set up proper CORS settings
- Configure rate limiting

### Performance
- Add database indexes for frequently queried columns
- Set up connection pooling if needed
- Monitor query performance

### Backup
- Set up automated backups
- Test restore procedures
- Document recovery processes

## Troubleshooting

### Common Issues
1. **RLS blocking queries**: Check that policies are correctly configured
2. **Storage access denied**: Verify bucket policies and authentication
3. **Function errors**: Check function syntax and permissions

### Useful SQL Queries
```sql
-- Check user purchases
SELECT * FROM purchases WHERE user_id = 'user-uuid';

-- Verify product access
SELECT public.user_has_purchased_product('user-uuid', 'product-uuid');

-- View download logs
SELECT * FROM download_logs WHERE user_id = 'user-uuid';
```

