-- Updated sample data with video URLs for Digital Compliance Products Website
-- Run this after the main schema to populate with initial data including video content

-- Clear existing products first
DELETE FROM public.products;

-- Insert sample products with video URLs
INSERT INTO public.products (
  slug,
  title,
  description,
  price,
  file_path,
  video_url,
  thumbnail_url,
  is_active
) VALUES 
(
  'qualification-compliance-checker',
  'Qualification Compliance Checker',
  'A comprehensive tool to help UK sponsors verify if a sponsored worker meets Home Office qualification requirements. This Word template provides a structured approach to compliance checking with detailed guidance and checklists.',
  49.99,
  'products/qualification-compliance-checker/Qualification_Compliance_Checker_Template_V2.docx',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'products/qualification-compliance-checker/thumbnail.jpg',
  true
),
(
  'sponsor-licence-audit-toolkit',
  'Sponsor Licence Audit Toolkit',
  'Complete audit toolkit for UK sponsor licence holders. Includes compliance checklists, documentation templates, and step-by-step guidance for maintaining your sponsor licence status.',
  79.99,
  'products/sponsor-licence-audit-toolkit/audit-toolkit.pdf',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'products/sponsor-licence-audit-toolkit/thumbnail.jpg',
  true
),
(
  'immigration-compliance-masterclass',
  'Immigration Compliance Masterclass',
  'Comprehensive video course covering all aspects of UK immigration compliance for sponsors. Includes downloadable resources, templates, and ongoing updates.',
  149.99,
  'products/immigration-compliance-masterclass/resources.zip',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'products/immigration-compliance-masterclass/thumbnail.jpg',
  true
);

-- Note: These use sample videos from Google's test video repository
-- In production, replace with actual tutorial videos hosted on your platform
-- Stripe price IDs will need to be added after creating products in Stripe Dashboard
-- UPDATE public.products SET stripe_price_id = 'price_xxx' WHERE slug = 'qualification-compliance-checker';
-- UPDATE public.products SET stripe_price_id = 'price_yyy' WHERE slug = 'sponsor-licence-audit-toolkit';
-- UPDATE public.products SET stripe_price_id = 'price_zzz' WHERE slug = 'immigration-compliance-masterclass';

