// AI Style Configuration
// Modify this file to customize how the AI generates narratives

export const AIStyleConfig = {
  // Choose your preferred tone (uncomment one)
  tone: 'professional', // default
  // tone: 'assertive',
  // tone: 'detailed',
  // tone: 'concise',
  // tone: 'riskFocused',
  // tone: 'solutionOriented',

  // Choose your preferred format (uncomment one)
  format: 'narrative', // default - flowing paragraphs without sections
  // format: 'letter',
  // format: 'report',
  // format: 'memo',

  // Custom style instructions
  // Add any specific requirements for your organization
  customInstructions: `
    - Write in continuous paragraphs without any section headings or bullet points
    - Always use the worker's actual name throughout (e.g., "Mr. Smith" or "John Smith")
    - Reference the specific job title and CoS number multiple times in the narrative
    - Do not include any signature blocks or contact information
    - Do not use phrases like "the worker" or "the candidate" - always use their name
    - Integrate all information into flowing prose
    - Avoid any numbered lists or bullet points - use connecting phrases instead
  `,

  // Specific phrases to use or avoid
  phrasePreferences: {
    // Instead of saying "appears to be", use:
    preferred: {
      'appears to be': 'is',
      'seems to': 'demonstrates',
      'might be': 'is likely',
      'could indicate': 'indicates',
    },
    
    // Phrases to avoid entirely:
    avoid: [
      'maybe',
      'perhaps',
      'possibly',
      'it seems',
    ]
  },

  // Document sections to emphasize
  emphasis: {
    riskAssessment: true,
    legalReferences: true,
    recommendations: true,
    executiveSummary: true,
  },

  // Length preferences
  lengthPreferences: {
    executiveSummary: 'brief', // brief, moderate, detailed
    findings: 'detailed',      // brief, moderate, detailed
    recommendations: 'moderate', // brief, moderate, detailed
    overall: 'moderate',       // brief (1-2 pages), moderate (2-3 pages), detailed (3-5 pages)
  }
};

// Helper function to get the complete style configuration
export function getStyleConfiguration() {
  const { improvedSkillsPrompt, toneVariations, formatOptions } = require('./prompts/improved-skills-prompt');
  
  let prompt = improvedSkillsPrompt;
  
  // Add tone variation
  if (AIStyleConfig.tone !== 'professional' && toneVariations[AIStyleConfig.tone]) {
    prompt += '\n\nTONE ADJUSTMENT:\n' + toneVariations[AIStyleConfig.tone];
  }
  
  // Add format preference
  const formatKey = AIStyleConfig.format + 'Style';
  if (formatOptions[formatKey]) {
    prompt += '\n\nFORMAT PREFERENCE:\n' + formatOptions[formatKey];
  }
  
  // Add custom instructions
  if (AIStyleConfig.customInstructions.trim()) {
    prompt += '\n\nCUSTOM REQUIREMENTS:\n' + AIStyleConfig.customInstructions;
  }
  
  // Add phrase preferences
  if (Object.keys(AIStyleConfig.phrasePreferences.preferred).length > 0) {
    prompt += '\n\nPHRASE PREFERENCES:\n';
    for (const [avoid, use] of Object.entries(AIStyleConfig.phrasePreferences.preferred)) {
      prompt += `- Instead of "${avoid}", use "${use}"\n`;
    }
  }
  
  // Add length preferences
  prompt += '\n\nLENGTH REQUIREMENTS:\n';
  prompt += `- Executive Summary: ${AIStyleConfig.lengthPreferences.executiveSummary}\n`;
  prompt += `- Findings Section: ${AIStyleConfig.lengthPreferences.findings}\n`;
  prompt += `- Recommendations: ${AIStyleConfig.lengthPreferences.recommendations}\n`;
  prompt += `- Overall Document: ${AIStyleConfig.lengthPreferences.overall}\n`;
  
  return prompt;
}