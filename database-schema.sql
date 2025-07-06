-- Supabase Database Schema for Digital Compliance Products Website
-- This file contains the complete database schema including tables, RLS policies, and functions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  file_path TEXT, -- Path to the downloadable file in Supabase Storage
  video_url TEXT, -- URL to the tutorial video
  thumbnail_url TEXT, -- Product thumbnail image
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases table
CREATE TABLE public.purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'gbp',
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Download logs table
CREATE TABLE public.download_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_product_id ON public.purchases(product_id);
CREATE INDEX idx_purchases_stripe_payment_intent ON public.purchases(stripe_payment_intent_id);
CREATE INDEX idx_download_logs_user_id ON public.download_logs(user_id);
CREATE INDEX idx_download_logs_product_id ON public.download_logs(product_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Products policies (public read access)
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

-- Purchases policies
CREATE POLICY "Users can view their own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Download logs policies
CREATE POLICY "Users can view their own download logs" ON public.download_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own download logs" ON public.download_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions

-- Function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_purchases
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to check if user has purchased a product
CREATE OR REPLACE FUNCTION public.user_has_purchased_product(user_uuid UUID, product_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.purchases
    WHERE user_id = user_uuid
    AND product_id = product_uuid
    AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's purchased products
CREATE OR REPLACE FUNCTION public.get_user_purchased_products(user_uuid UUID)
RETURNS TABLE (
  product_id UUID,
  product_title TEXT,
  product_description TEXT,
  product_file_path TEXT,
  product_video_url TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.file_path,
    p.video_url,
    pur.created_at
  FROM public.products p
  JOIN public.purchases pur ON p.id = pur.product_id
  WHERE pur.user_id = user_uuid
  AND pur.status = 'completed'
  ORDER BY pur.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AI Compliance Agents Tables

-- Workers table for all AI compliance agents
CREATE TABLE public.compliance_workers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL, -- 'ai-salary-compliance', 'ai-qualification-compliance', etc.
  name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  soc_code TEXT NOT NULL,
  cos_reference TEXT NOT NULL,
  compliance_status TEXT NOT NULL CHECK (compliance_status IN ('COMPLIANT', 'BREACH', 'SERIOUS_BREACH')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  red_flag BOOLEAN DEFAULT false,
  global_risk_score INTEGER DEFAULT 0 CHECK (global_risk_score >= 0 AND global_risk_score <= 100),
  assignment_date DATE NOT NULL,
  last_assessment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments table for detailed compliance assessments
CREATE TABLE public.compliance_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.compliance_workers(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  worker_name TEXT NOT NULL,
  cos_reference TEXT NOT NULL,
  job_title TEXT NOT NULL,
  soc_code TEXT NOT NULL,
  compliance_status TEXT NOT NULL CHECK (compliance_status IN ('COMPLIANT', 'BREACH', 'SERIOUS_BREACH')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  evidence_status TEXT NOT NULL,
  breach_type TEXT,
  red_flag BOOLEAN DEFAULT false,
  assignment_date DATE NOT NULL,
  professional_assessment TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance reports table for generated reports
CREATE TABLE public.compliance_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.compliance_assessments(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'pdf', 'email', 'print'
  report_content TEXT, -- HTML content for the report
  file_path TEXT, -- Path to stored PDF file
  downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_compliance_workers_user_id ON public.compliance_workers(user_id);
CREATE INDEX idx_compliance_workers_agent_type ON public.compliance_workers(agent_type);
CREATE INDEX idx_compliance_assessments_user_id ON public.compliance_assessments(user_id);
CREATE INDEX idx_compliance_assessments_worker_id ON public.compliance_assessments(worker_id);
CREATE INDEX idx_compliance_assessments_agent_type ON public.compliance_assessments(agent_type);
CREATE INDEX idx_compliance_reports_user_id ON public.compliance_reports(user_id);
CREATE INDEX idx_compliance_reports_assessment_id ON public.compliance_reports(assessment_id);

-- Enable RLS on new tables
ALTER TABLE public.compliance_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_workers
CREATE POLICY "Users can view their own compliance workers" ON public.compliance_workers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compliance workers" ON public.compliance_workers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance workers" ON public.compliance_workers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compliance workers" ON public.compliance_workers
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for compliance_assessments
CREATE POLICY "Users can view their own compliance assessments" ON public.compliance_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compliance assessments" ON public.compliance_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance assessments" ON public.compliance_assessments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compliance assessments" ON public.compliance_assessments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for compliance_reports
CREATE POLICY "Users can view their own compliance reports" ON public.compliance_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compliance reports" ON public.compliance_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance reports" ON public.compliance_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compliance reports" ON public.compliance_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at on new tables
CREATE TRIGGER handle_updated_at_compliance_workers
  BEFORE UPDATE ON public.compliance_workers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Functions for AI compliance agents

-- Function to get workers by agent type
CREATE OR REPLACE FUNCTION public.get_compliance_workers_by_agent(user_uuid UUID, agent_type_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  job_title TEXT,
  soc_code TEXT,
  cos_reference TEXT,
  compliance_status TEXT,
  risk_level TEXT,
  red_flag BOOLEAN,
  assignment_date DATE,
  last_assessment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cw.id,
    cw.name,
    cw.job_title,
    cw.soc_code,
    cw.cos_reference,
    cw.compliance_status,
    cw.risk_level,
    cw.red_flag,
    cw.assignment_date,
    cw.last_assessment_date,
    cw.created_at
  FROM public.compliance_workers cw
  WHERE cw.user_id = user_uuid
  AND cw.agent_type = agent_type_param
  ORDER BY cw.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get assessments by agent type
CREATE OR REPLACE FUNCTION public.get_compliance_assessments_by_agent(user_uuid UUID, agent_type_param TEXT)
RETURNS TABLE (
  id UUID,
  worker_id UUID,
  worker_name TEXT,
  cos_reference TEXT,
  job_title TEXT,
  soc_code TEXT,
  compliance_status TEXT,
  risk_level TEXT,
  evidence_status TEXT,
  breach_type TEXT,
  red_flag BOOLEAN,
  assignment_date DATE,
  professional_assessment TEXT,
  generated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.worker_id,
    ca.worker_name,
    ca.cos_reference,
    ca.job_title,
    ca.soc_code,
    ca.compliance_status,
    ca.risk_level,
    ca.evidence_status,
    ca.breach_type,
    ca.red_flag,
    ca.assignment_date,
    ca.professional_assessment,
    ca.generated_at
  FROM public.compliance_assessments ca
  WHERE ca.user_id = user_uuid
  AND ca.agent_type = agent_type_param
  ORDER BY ca.generated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remediation Actions Table
CREATE TABLE IF NOT EXISTS remediation_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES compliance_workers(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    action_summary TEXT NOT NULL,
    detailed_notes TEXT,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_remediation_actions_user_id ON remediation_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_remediation_actions_worker_id ON remediation_actions(worker_id);
CREATE INDEX IF NOT EXISTS idx_remediation_actions_status ON remediation_actions(status);
CREATE INDEX IF NOT EXISTS idx_remediation_actions_agent_type ON remediation_actions(agent_type);

-- Alerts Table for notification system
CREATE TABLE IF NOT EXISTS alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES compliance_workers(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    alert_message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Unread' CHECK (status IN ('Unread', 'Read', 'Dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_worker_id ON alerts(worker_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

