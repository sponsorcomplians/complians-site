import { LegalReference } from '@/types/narrative.types';

// This could be fetched from a database/API in production
export const CURRENT_LEGAL_REFERENCES: LegalReference[] = [
  {
    code: "C1.38",
    description: "Sponsors must not employ workers without necessary skills/qualifications",
    version: "12/24",
    effectiveDate: "2024-12-01",
    category: "primary"
  },
  {
    code: "Annex C1(w)",
    description: "Grounds for licence suspension - compliance breaches",
    version: "12/24",
    effectiveDate: "2024-12-01",
    category: "primary"
  },
  {
    code: "Annex C2(a)",
    description: "Threat to immigration control",
    version: "12/24",
    effectiveDate: "2024-12-01",
    category: "primary"
  },
  {
    code: "Annex C2(g)",
    description: "Failure to provide requested documents within time limit",
    version: "12/24",
    effectiveDate: "2024-12-01",
    category: "primary"
  },
  {
    code: "Appendix D",
    description: "Required documentation for sponsor compliance",
    version: "12/24",
    effectiveDate: "2024-12-01",
    category: "guidance"
  }
];

export function getLegalPromptSection(): string {
  const groupedRefs = CURRENT_LEGAL_REFERENCES.reduce((acc, ref) => {
    if (!acc[ref.category]) acc[ref.category] = [];
    acc[ref.category].push(ref);
    return acc;
  }, {} as Record<string, LegalReference[]>);

  return `
CURRENT LEGAL FRAMEWORK (Version: ${CURRENT_LEGAL_REFERENCES[0].version}):

Primary Rules:
${groupedRefs.primary?.map(ref => `- ${ref.code}: ${ref.description}`).join('\n') || ''}

Guidance Documents:
${groupedRefs.guidance?.map(ref => `- ${ref.code}: ${ref.description}`).join('\n') || ''}

Always cite the specific version (${CURRENT_LEGAL_REFERENCES[0].version}) when referencing rules.
`;
}

export async function checkForLegalUpdates(): Promise<boolean> {
  // In production, this would check an API or database
  // For now, return false (no updates)
  return false;
}

/**
 * Get a legal reference by code
 */
export function getLegalReference(code: string): LegalReference | undefined {
  return CURRENT_LEGAL_REFERENCES.find(ref => ref.code === code);
}

/**
 * Get formatted legal reference string
 */
export function getFormattedLegalReference(code: string): string {
  const reference = getLegalReference(code);
  return reference ? `${reference.code} (${reference.version})` : code;
}

/**
 * Get all legal references by category
 */
export function getLegalReferencesByCategory(category: 'primary' | 'secondary' | 'guidance'): LegalReference[] {
  return CURRENT_LEGAL_REFERENCES.filter(ref => ref.category === category);
}

/**
 * Get the current version of the legal framework
 */
export function getCurrentLegalVersion(): string {
  return CURRENT_LEGAL_REFERENCES[0]?.version || 'unknown';
}

/**
 * Check if a legal reference is still effective
 */
export function isLegalReferenceEffective(code: string, checkDate: Date = new Date()): boolean {
  const reference = getLegalReference(code);
  if (!reference) return false;
  
  const effectiveDate = new Date(reference.effectiveDate);
  return checkDate >= effectiveDate;
}

/**
 * Get legal references that apply to a specific compliance area
 */
export function getLegalReferencesForComplianceArea(area: 'skills-experience' | 'documentation' | 'general'): LegalReference[] {
  switch (area) {
    case 'skills-experience':
      return CURRENT_LEGAL_REFERENCES.filter(ref => 
        ref.code === 'C1.38' || ref.code === 'Annex C1(w)' || ref.code === 'Annex C2(a)'
      );
    case 'documentation':
      return CURRENT_LEGAL_REFERENCES.filter(ref => 
        ref.code === 'Annex C2(g)' || ref.code === 'Appendix D'
      );
    case 'general':
      return CURRENT_LEGAL_REFERENCES;
    default:
      return [];
  }
} 