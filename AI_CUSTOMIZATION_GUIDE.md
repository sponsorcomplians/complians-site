# AI Narrative Customization Guide

This guide explains how to customize the AI-generated narratives to match your organization's style, tone, and format preferences.

## Quick Start

To customize the AI narrative generation, edit the file:
```
src/lib/ai-style-config.ts
```

## 1. Changing the Tone

In `ai-style-config.ts`, find the `tone` setting and uncomment your preferred option:

```typescript
// Choose your preferred tone (uncomment one)
// tone: 'professional', // default - Balanced, formal legal language
tone: 'assertive',      // Strong, definitive statements
// tone: 'detailed',    // Extensive detail and analysis
// tone: 'concise',     // Brief, to-the-point
// tone: 'riskFocused', // Emphasizes risks and liabilities
// tone: 'solutionOriented', // Focuses on remediation
```

### Tone Examples:

**Professional (Default):**
> "The evidence suggests that the worker's experience aligns with the role requirements."

**Assertive:**
> "The worker's experience definitively meets all role requirements."

**Risk-Focused:**
> "While the worker meets basic requirements, potential compliance risks include..."

## 2. Changing the Format

Select your preferred document format:

```typescript
// Choose your preferred format (uncomment one)
format: 'letter',    // Formal business letter
// format: 'report', // Executive report with sections
// format: 'memo',   // Internal memorandum
// format: 'bulleted', // Bullet-point focused
```

## 3. Custom Instructions

Add your organization-specific requirements:

```typescript
customInstructions: `
  - Always include our company registration number: 12345678
  - Use our standard disclaimer: "This assessment is confidential and proprietary"
  - Reference our internal policy document: POL-IMM-001
  - Include a risk score from 1-10
  - Add section for recommended next review date
`,
```

## 4. Phrase Preferences

Customize the language used:

```typescript
phrasePreferences: {
  preferred: {
    'appears to be': 'is confirmed as',
    'might indicate': 'clearly demonstrates',
    'concerns exist': 'critical issues identified',
  },
  avoid: [
    'maybe',
    'perhaps',
    'allegedly',
  ]
}
```

## 5. Length Preferences

Control document length:

```typescript
lengthPreferences: {
  executiveSummary: 'brief',    // 2-3 sentences
  findings: 'detailed',         // Comprehensive analysis
  recommendations: 'moderate',  // 3-5 bullet points
  overall: 'moderate',         // 2-3 pages total
}
```

## 6. Advanced Customization

For more complex changes, edit:
```
src/lib/prompts/improved-skills-prompt.ts
```

This file contains the full prompt template that you can modify directly.

## Examples of Customization

### Example 1: Law Firm Style
```typescript
tone: 'assertive',
format: 'letter',
customInstructions: `
  - Use letterhead: "Smith & Associates Immigration Law"
  - Include fee earner reference
  - Add time recording code
  - Use formal salutation: "Dear Sir/Madam"
`,
```

### Example 2: Corporate HR Style
```typescript
tone: 'concise',
format: 'memo',
customInstructions: `
  - Address to: HR Compliance Team
  - Include employee ID numbers
  - Reference internal HR policies
  - Add cc: Legal Department
`,
```

### Example 3: Risk Management Focus
```typescript
tone: 'riskFocused',
format: 'report',
customInstructions: `
  - Include risk matrix (High/Medium/Low)
  - Calculate financial exposure
  - Reference insurance implications
  - Add mitigation timeline
`,
```

## Testing Your Customizations

After making changes:

1. Save the file
2. Test at: `/api/test-narrative`
3. Review the generated narrative
4. Adjust settings as needed

## Best Practices

1. **Start Small**: Change one setting at a time
2. **Test Thoroughly**: Generate several narratives to ensure consistency
3. **Document Changes**: Keep notes on why you chose specific settings
4. **Review Regularly**: Update settings as regulations change
5. **Get Feedback**: Have your compliance team review outputs

## Troubleshooting

**Narrative too long/short?**
- Adjust `lengthPreferences.overall`

**Wrong terminology?**
- Update `phrasePreferences.preferred`

**Missing sections?**
- Add to `customInstructions`

**Too formal/informal?**
- Change the `tone` setting

## Need Help?

The AI will follow your customizations while maintaining legal accuracy and compliance with UK immigration law. If outputs don't match expectations, refine your settings incrementally.