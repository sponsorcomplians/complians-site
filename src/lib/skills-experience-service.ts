// Skills & Experience Compliance Service
// Handles API calls for skills and experience assessments

export interface SkillsAssessment {
  id: string;
  worker_id: string;
  assessment_type: 'skills' | 'experience' | 'cv';
  assessment_data: {
    skills_verified?: string[];
    skills_gaps?: string[];
    certifications?: string[];
    assessment_score?: number;
    experience_verified?: boolean;
    years_experience?: number;
    relevant_experience?: string[];
    references_checked?: boolean;
    cv_score?: number;
    improvements_suggested?: string[];
    accuracy_verified?: boolean;
  };
  compliance_status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateAssessmentRequest {
  worker_id: string;
  assessment_type: 'skills' | 'experience' | 'cv';
  assessment_data: any;
  compliance_status?: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  notes?: string;
}

export interface UpdateAssessmentRequest {
  id: string;
  assessment_data?: any;
  compliance_status?: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  notes?: string;
}

class SkillsExperienceService {
  private baseUrl = '/api/skills-experience';

  // Fetch assessments for a worker
  async getAssessments(workerId: string, type?: 'skills' | 'experience' | 'cv'): Promise<SkillsAssessment[]> {
    try {
      const params = new URLSearchParams({ workerId });
      if (type) params.append('type', type);

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.assessments || [];
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  }

  // Create a new assessment
  async createAssessment(assessment: CreateAssessmentRequest): Promise<SkillsAssessment> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessment),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.assessment;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  }

  // Update an existing assessment
  async updateAssessment(assessment: UpdateAssessmentRequest): Promise<SkillsAssessment> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessment),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.assessment;
    } catch (error) {
      console.error('Error updating assessment:', error);
      throw error;
    }
  }

  // Delete an assessment
  async deleteAssessment(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error deleting assessment:', error);
      throw error;
    }
  }

  // Get assessment statistics for dashboard
  async getAssessmentStats(): Promise<{
    totalAssessments: number;
    compliantAssessments: number;
    pendingAssessments: number;
    nonCompliantAssessments: number;
    skillsAssessments: number;
    experienceAssessments: number;
    cvAssessments: number;
  }> {
    try {
      // This would typically be a separate API endpoint
      // For now, we'll calculate from the assessments we have
      const allAssessments = await this.getAssessments('all');
      
      return {
        totalAssessments: allAssessments.length,
        compliantAssessments: allAssessments.filter(a => a.compliance_status === 'COMPLIANT').length,
        pendingAssessments: allAssessments.filter(a => a.compliance_status === 'PENDING').length,
        nonCompliantAssessments: allAssessments.filter(a => a.compliance_status === 'NON_COMPLIANT').length,
        skillsAssessments: allAssessments.filter(a => a.assessment_type === 'skills').length,
        experienceAssessments: allAssessments.filter(a => a.assessment_type === 'experience').length,
        cvAssessments: allAssessments.filter(a => a.assessment_type === 'cv').length,
      };
    } catch (error) {
      console.error('Error fetching assessment stats:', error);
      throw error;
    }
  }

  // Generate assessment report
  async generateReport(workerId: string): Promise<{
    worker: any;
    assessments: SkillsAssessment[];
    summary: {
      overallStatus: string;
      complianceScore: number;
      recommendations: string[];
    };
  }> {
    try {
      const assessments = await this.getAssessments(workerId);
      
      // Calculate compliance score
      const totalAssessments = assessments.length;
      const compliantAssessments = assessments.filter(a => a.compliance_status === 'COMPLIANT').length;
      const complianceScore = totalAssessments > 0 ? Math.round((compliantAssessments / totalAssessments) * 100) : 0;

      // Determine overall status
      let overallStatus = 'PENDING';
      if (complianceScore === 100) overallStatus = 'COMPLIANT';
      else if (complianceScore < 50) overallStatus = 'NON_COMPLIANT';

      // Generate recommendations
      const recommendations: string[] = [];
      
      const hasSkillsAssessment = assessments.some(a => a.assessment_type === 'skills');
      const hasExperienceAssessment = assessments.some(a => a.assessment_type === 'experience');
      const hasCvAssessment = assessments.some(a => a.assessment_type === 'cv');

      if (!hasSkillsAssessment) recommendations.push('Complete skills assessment');
      if (!hasExperienceAssessment) recommendations.push('Complete experience verification');
      if (!hasCvAssessment) recommendations.push('Complete CV analysis');

      // Add specific recommendations based on assessment data
      assessments.forEach(assessment => {
        if (assessment.compliance_status === 'NON_COMPLIANT') {
          if (assessment.assessment_type === 'skills') {
            recommendations.push('Address skills gaps identified in assessment');
          } else if (assessment.assessment_type === 'experience') {
            recommendations.push('Provide additional experience documentation');
          } else if (assessment.assessment_type === 'cv') {
            recommendations.push('Update CV based on analysis recommendations');
          }
        }
      });

      return {
        worker: null, // Would be fetched separately
        assessments,
        summary: {
          overallStatus,
          complianceScore,
          recommendations,
        },
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkCreateAssessments(assessments: CreateAssessmentRequest[]): Promise<SkillsAssessment[]> {
    try {
      const promises = assessments.map(assessment => this.createAssessment(assessment));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error bulk creating assessments:', error);
      throw error;
    }
  }

  // Export assessments to CSV/Excel
  async exportAssessments(workerIds?: string[]): Promise<Blob> {
    try {
      // This would typically call a backend endpoint that generates the export
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting assessments:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const skillsExperienceService = new SkillsExperienceService(); 