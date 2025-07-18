// Dashboard AI Upgrade Utility
// Helper functions to upgrade template-based dashboards to use AI generation

export const generateAIAssessment = async (
  agentType: string,
  workerData: {
    workerName: string;
    jobTitle: string;
    socCode?: string;
    cosReference?: string;
    assignmentDate?: string;
  },
  assessmentData: Record<string, any>
): Promise<{
  narrative: string;
  complianceStatus: "COMPLIANT" | "SERIOUS_BREACH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  redFlag: boolean;
}> => {
  try {
    console.log(`[AI Upgrade] Generating AI assessment for ${agentType}`);
    
    const response = await fetch('/api/generate-narrative-universal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentType,
        ...workerData,
        assessmentData
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.narrative) {
      throw new Error('Invalid API response');
    }

    // Extract compliance status from narrative
    const narrative = result.narrative;
    const complianceStatus = extractComplianceStatus(narrative);
    const riskLevel = extractRiskLevel(narrative);
    const redFlag = complianceStatus === "SERIOUS_BREACH";

    return {
      narrative,
      complianceStatus,
      riskLevel,
      redFlag
    };
  } catch (error) {
    console.error(`[AI Upgrade] Error generating AI assessment:`, error);
    // Return template-based fallback
    return generateTemplateFallback(agentType, workerData, assessmentData);
  }
};

const extractComplianceStatus = (narrative: string): "COMPLIANT" | "SERIOUS_BREACH" => {
  const lowerNarrative = narrative.toLowerCase();
  if (lowerNarrative.includes('serious breach') || lowerNarrative.includes('non-compliant')) {
    return "SERIOUS_BREACH";
  }
  return "COMPLIANT";
};

const extractRiskLevel = (narrative: string): "LOW" | "MEDIUM" | "HIGH" => {
  const lowerNarrative = narrative.toLowerCase();
  if (lowerNarrative.includes('high risk') || lowerNarrative.includes('serious breach')) {
    return "HIGH";
  }
  if (lowerNarrative.includes('medium risk') || lowerNarrative.includes('concerns')) {
    return "MEDIUM";
  }
  return "LOW";
};

const generateTemplateFallback = (
  agentType: string,
  workerData: {
    workerName: string;
    jobTitle: string;
    socCode?: string;
    cosReference?: string;
    assignmentDate?: string;
  },
  assessmentData: Record<string, any>
): {
  narrative: string;
  complianceStatus: "COMPLIANT" | "SERIOUS_BREACH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  redFlag: boolean;
} => {
  // Determine compliance based on assessment data
  let isCompliant = true;
  let issues: string[] = [];

  // Check for common non-compliance indicators
  Object.entries(assessmentData).forEach(([key, value]) => {
    if (key.includes('missing') && value === true) {
      isCompliant = false;
      issues.push(`Missing ${key.replace(/_/g, ' ')}`);
    }
    if (key.includes('expired') && value === true) {
      isCompliant = false;
      issues.push(`Expired ${key.replace(/_/g, ' ')}`);
    }
    if (key.includes('invalid') && value === true) {
      isCompliant = false;
      issues.push(`Invalid ${key.replace(/_/g, ' ')}`);
    }
  });

  const complianceStatus = isCompliant ? "COMPLIANT" : "SERIOUS_BREACH";
  const riskLevel = isCompliant ? "LOW" : "HIGH";
  const redFlag = !isCompliant;

  const agentName = agentType.replace(/ai-|-compliance/g, '').replace(/-/g, ' ')
    .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const narrative = `${agentName.toUpperCase()} COMPLIANCE ASSESSMENT

Worker: ${workerData.workerName}
Job Title: ${workerData.jobTitle}
${workerData.socCode ? `SOC Code: ${workerData.socCode}` : ''}
${workerData.cosReference ? `CoS Reference: ${workerData.cosReference}` : ''}
Assessment Date: ${new Date().toLocaleDateString('en-GB')}

ASSESSMENT FINDINGS
${isCompliant ? 
  `The assessment indicates that ${workerData.workerName} meets the ${agentName.toLowerCase()} compliance requirements for their role as ${workerData.jobTitle}.` :
  `The assessment has identified serious compliance issues for ${workerData.workerName} in their role as ${workerData.jobTitle}.`}

${issues.length > 0 ? `
IDENTIFIED ISSUES
${issues.map(issue => `- ${issue}`).join('\n')}
` : ''}

COMPLIANCE VERDICT: ${complianceStatus}

${!isCompliant ? `
This represents a serious breach of sponsor duties. Immediate remedial action is required to address these compliance failures and prevent potential sponsor licence action by the Home Office.
` : ''}

Generated: ${new Date().toISOString()} (Template Mode)`;

  return { narrative, complianceStatus, riskLevel, redFlag };
};

// Export helper to upgrade existing assessment functions
export const upgradeAssessmentFunction = (
  originalFunction: Function,
  agentType: string
) => {
  return async (...args: any[]) => {
    // Extract worker data from arguments (common pattern across dashboards)
    const [workerName, cosReference, jobTitle, socCode, assignmentDate, ...otherArgs] = args;
    
    const workerData = {
      workerName,
      jobTitle,
      socCode,
      cosReference,
      assignmentDate
    };

    // Build assessment data from remaining arguments
    const assessmentData: Record<string, any> = {};
    otherArgs.forEach((arg: any, index: number) => {
      if (arg !== undefined) {
        assessmentData[`param_${index}`] = arg;
      }
    });

    // Try AI generation first
    const aiResult = await generateAIAssessment(agentType, workerData, assessmentData);
    
    return aiResult.narrative;
  };
};