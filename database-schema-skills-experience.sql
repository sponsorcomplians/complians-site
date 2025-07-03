-- Skills & Experience Compliance Agent Database Schema

-- Table for storing skills and experience assessments
CREATE TABLE IF NOT EXISTS skills_experience_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('skills', 'experience', 'cv')),
    assessment_data JSONB NOT NULL DEFAULT '{}',
    compliance_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (compliance_status IN ('COMPLIANT', 'NON_COMPLIANT', 'PENDING')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_skills_experience_worker_id ON skills_experience_assessments(worker_id);
CREATE INDEX IF NOT EXISTS idx_skills_experience_type ON skills_experience_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_skills_experience_status ON skills_experience_assessments(compliance_status);
CREATE INDEX IF NOT EXISTS idx_skills_experience_created_at ON skills_experience_assessments(created_at);

-- Add columns to existing workers table for tracking assessment dates
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS skills_assessment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS experience_verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cv_analysis_date TIMESTAMP WITH TIME ZONE;

-- Create a view for easy access to worker compliance status
CREATE OR REPLACE VIEW worker_skills_experience_compliance AS
SELECT 
    w.id,
    w.first_name,
    w.last_name,
    w.email,
    w.role,
    w.department,
    w.start_date,
    w.skills_assessment_date,
    w.experience_verification_date,
    w.cv_analysis_date,
    w.compliance_status,
    w.compliance_score,
    CASE 
        WHEN w.skills_assessment_date IS NOT NULL 
        AND w.experience_verification_date IS NOT NULL 
        AND w.cv_analysis_date IS NOT NULL 
        THEN 'COMPLETE'
        ELSE 'INCOMPLETE'
    END as assessment_status,
    COUNT(sa.id) as total_assessments,
    COUNT(CASE WHEN sa.compliance_status = 'COMPLIANT' THEN 1 END) as compliant_assessments
FROM workers w
LEFT JOIN skills_experience_assessments sa ON w.id = sa.worker_id
GROUP BY w.id, w.first_name, w.last_name, w.email, w.role, w.department, w.start_date, 
         w.skills_assessment_date, w.experience_verification_date, w.cv_analysis_date, 
         w.compliance_status, w.compliance_score;

-- Function to update worker compliance score based on assessments
CREATE OR REPLACE FUNCTION update_worker_compliance_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate compliance score based on assessment status
    UPDATE workers 
    SET 
        compliance_score = (
            CASE 
                WHEN skills_assessment_date IS NOT NULL THEN 33.33
                ELSE 0
            END +
            CASE 
                WHEN experience_verification_date IS NOT NULL THEN 33.33
                ELSE 0
            END +
            CASE 
                WHEN cv_analysis_date IS NOT NULL THEN 33.34
                ELSE 0
            END
        ),
        compliance_status = CASE 
            WHEN skills_assessment_date IS NOT NULL 
                AND experience_verification_date IS NOT NULL 
                AND cv_analysis_date IS NOT NULL 
            THEN 'COMPLIANT'
            ELSE 'PENDING'
        END
    WHERE id = NEW.worker_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update compliance score when assessment dates change
CREATE TRIGGER trigger_update_compliance_score
    AFTER UPDATE OF skills_assessment_date, experience_verification_date, cv_analysis_date
    ON workers
    FOR EACH ROW
    EXECUTE FUNCTION update_worker_compliance_score();

-- Row Level Security (RLS) policies
ALTER TABLE skills_experience_assessments ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own assessments (if they have access to specific workers)
CREATE POLICY "Users can view assessments for workers they have access to" ON skills_experience_assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workers w 
            WHERE w.id = skills_experience_assessments.worker_id
            -- Add additional access control logic here if needed
        )
    );

-- Policy for users to create assessments
CREATE POLICY "Users can create assessments" ON skills_experience_assessments
    FOR INSERT WITH CHECK (true);

-- Policy for users to update assessments
CREATE POLICY "Users can update assessments" ON skills_experience_assessments
    FOR UPDATE USING (true);

-- Policy for users to delete assessments
CREATE POLICY "Users can delete assessments" ON skills_experience_assessments
    FOR DELETE USING (true);

-- Sample data for testing
INSERT INTO skills_experience_assessments (worker_id, assessment_type, assessment_data, compliance_status, notes) VALUES
(
    (SELECT id FROM workers LIMIT 1),
    'skills',
    '{
        "skills_verified": ["JavaScript", "React", "Node.js", "Python"],
        "skills_gaps": ["AWS", "Docker"],
        "certifications": ["AWS Certified Developer", "Google Cloud Professional"],
        "assessment_score": 85
    }',
    'COMPLIANT',
    'Skills assessment completed successfully. Worker demonstrates strong technical skills.'
),
(
    (SELECT id FROM workers LIMIT 1),
    'experience',
    '{
        "experience_verified": true,
        "years_experience": 3,
        "relevant_experience": ["Software Development", "Team Leadership"],
        "references_checked": true
    }',
    'COMPLIANT',
    'Experience verification completed. All references checked and verified.'
),
(
    (SELECT id FROM workers LIMIT 1),
    'cv',
    '{
        "cv_score": 88,
        "improvements_suggested": ["Add more specific achievements", "Include metrics"],
        "accuracy_verified": true
    }',
    'COMPLIANT',
    'CV analysis completed. Minor improvements suggested for better presentation.'
); 