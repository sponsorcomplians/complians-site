#!/usr/bin/env node

// Script to upgrade all compliance dashboards to use AI generation
// This script will update all dashboard components to use the universal AI service

import fs from 'fs';
import path from 'path';

const DASHBOARD_MAPPING = {
  'QualificationComplianceDashboard.tsx': 'ai-qualification-compliance',
  'RightToWorkComplianceDashboard.tsx': 'ai-right-to-work-compliance',
  'DocumentComplianceDashboard.tsx': 'ai-document-compliance',
  'RecordKeepingComplianceDashboard.tsx': 'ai-record-keeping-compliance',
  'ReportingDutiesComplianceDashboard.tsx': 'ai-reporting-duties-compliance',
  'ThirdPartyLabourComplianceDashboard.tsx': 'ai-third-party-labour-compliance',
  'ImmigrationStatusMonitoringDashboard.tsx': 'ai-immigration-status-monitoring-compliance',
  'MigrantContactMaintenanceDashboard.tsx': 'ai-migrant-contact-maintenance-compliance',
  'MigrantTrackingComplianceDashboard.tsx': 'ai-migrant-tracking-compliance',
  'ContractedHoursComplianceDashboard.tsx': 'ai-contracted-hours-compliance',
  'GenuineVacanciesComplianceDashboard.tsx': 'ai-genuine-vacancies-compliance',
  'ParagraphC726ComplianceDashboard.tsx': 'ai-paragraph-c7-26-compliance',
  'RecruitmentPracticesComplianceDashboard.tsx': 'ai-recruitment-practices-compliance'
};

const upgradeDashboard = (filePath: string, agentType: string) => {
  console.log(`Upgrading ${path.basename(filePath)} for ${agentType}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import for AI service if not present
  if (!content.includes('generateAIAssessment')) {
    const importIndex = content.indexOf('from "lucide-react";');
    if (importIndex !== -1) {
      content = content.slice(0, importIndex + 20) + 
        '\nimport { generateAIAssessment } from "@/lib/dashboard-ai-upgrade";' +
        content.slice(importIndex + 20);
    }
  }
  
  // Find assessment generation functions and make them async
  content = content.replace(
    /const generate\w+Assessment\s*=\s*\(/g,
    'const generate$&async ('
  );
  
  // Update function calls to await
  content = content.replace(
    /const professionalAssessment = generate/g,
    'const professionalAssessment = await generate'
  );
  
  // Add AI generation wrapper to assessment functions
  const assessmentFunctionRegex = /const generate\w+Assessment\s*=\s*async\s*\([^)]+\)\s*=>\s*{/g;
  let match;
  while ((match = assessmentFunctionRegex.exec(content)) !== null) {
    const functionStart = match.index + match[0].length;
    
    // Find the function body
    let braceCount = 1;
    let i = functionStart;
    while (braceCount > 0 && i < content.length) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') braceCount--;
      i++;
    }
    
    const functionBody = content.slice(functionStart, i - 1);
    
    // Wrap with AI generation
    const aiWrapper = `
    // Try AI generation first
    try {
      const assessmentData = {
        // Extract relevant data from parameters
        generated_at: new Date().toISOString()
      };
      
      const aiResult = await generateAIAssessment(
        '${agentType}',
        {
          workerName: arguments[0],
          jobTitle: arguments[2],
          socCode: arguments[3],
          cosReference: arguments[1],
          assignmentDate: arguments[4]
        },
        assessmentData
      );
      
      return aiResult.narrative;
    } catch (error) {
      console.error('[${agentType}] AI generation failed, using template:', error);
      // Original function body as fallback
      ${functionBody}
    }`;
    
    content = content.slice(0, functionStart) + aiWrapper + content.slice(i - 1);
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Upgraded ${path.basename(filePath)}`);
};

// Main execution
const componentsDir = path.join(__dirname, '../../components');

Object.entries(DASHBOARD_MAPPING).forEach(([fileName, agentType]) => {
  const filePath = path.join(componentsDir, fileName);
  if (fs.existsSync(filePath)) {
    try {
      upgradeDashboard(filePath, agentType);
    } catch (error) {
      console.error(`✗ Failed to upgrade ${fileName}:`, error);
    }
  } else {
    console.warn(`⚠ File not found: ${fileName}`);
  }
});

console.log('\nDashboard upgrade complete!');