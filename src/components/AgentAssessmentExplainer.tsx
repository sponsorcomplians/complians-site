import { usePathname } from "next/navigation";
import { Bot, AlertTriangle } from "lucide-react";

const agentExplainers: Record<
  string,
  { agentName: string; summary: string; points: string[]; requiredDocuments?: string[]; warning?: string }
> = {
  "ai-qualification-compliance": {
    agentName: "AI Qualification Compliance Agent",
    summary:
      "Automatically reviews uploaded qualification documents for compliance with UK Home Office requirements.",
    points: [
      "Verifies relevant qualifications",
      "Detects missing/insufficient care/healthcare qualifications",
      "Identifies red flags and serious breaches",
      "Generates professional assessment and compliance report",
      "Guides on remedial actions",
    ],
  },
  "ai-salary-compliance": {
    agentName: "AI Salary Compliance Agent",
    summary:
      "Analyzes payslips and salary documents for NMW and Home Office threshold compliance.",
    points: [
      "Verifies salary meets legal thresholds",
      "Detects underpayment or missing evidence",
      "Flags NMW breaches",
      "Generates compliance report",
      "Guides on salary rectification",
    ],
  },
  "ai-skills-experience-compliance": {
    agentName: "AI Skills & Experience Compliance System",
    summary:
      "The AI Skills & Experience Compliance System is a sophisticated automated assessment tool designed to evaluate and verify the qualifications, skills, and professional experience of migrant workers against UK Home Office compliance requirements. This system ensures that all sponsored workers possess the necessary competencies and documented experience to fulfill their designated roles effectively and lawfully.",
    points: [
      "Verifies skills and experience match the specific job role requirements",
      "Analyses CVs, references, contracts, payslips, and training certificates",
      "Detects inconsistencies and gaps in employment history and qualifications",
      "Flags compliance risks under paragraph C1.38 of the Immigration Rules",
      "Generates legal-style reports with detailed compliance assessments",
      "Provides remedial action guidance for identified compliance gaps"
    ],
    requiredDocuments: [
      "Certificate of Sponsorship (CoS)",
      "Full job description document",
      "CV with detailed employment history",
      "Reference letters from previous employers",
      "Employment contracts and terms of engagement",
      "Recent payslips demonstrating salary compliance",
      "Training certificates and professional qualifications (if applicable)"
    ],
    warning: "⚠️ CRITICAL COMPLIANCE WARNING: Missing or incomplete documentation will be marked against compliance and may result in a serious breach of sponsor duties or potential licence suspension. The AI Skills & Experience Compliance System provides essential verification but does not replace the sponsor's legal responsibility to ensure all workers meet the required standards."
  },
  "ai-record-keeping-compliance": {
    agentName: "AI Record Keeping Compliance Agent",
    summary:
      "Checks document management and record keeping for sponsor compliance.",
    points: [
      "Verifies required records are present",
      "Detects missing/expired documents",
      "Flags audit risks",
      "Generates compliance summary",
      "Guides on record management",
    ],
  },
  "ai-reporting-duties-compliance": {
    agentName: "AI Reporting Duties Compliance Agent",
    summary: "Monitors sponsor reporting obligations and deadlines.",
    points: [
      "Tracks reporting deadlines",
      "Detects missed/late reports",
      "Flags compliance breaches",
      "Generates reporting status",
      "Guides on timely reporting",
    ],
  },
  "ai-third-party-labour-compliance": {
    agentName: "AI Third-Party Labour Compliance Agent",
    summary: "Reviews third-party labour arrangements for compliance risks.",
    points: [
      "Verifies contracts and arrangements",
      "Detects compliance risks",
      "Flags contract breaches",
      "Generates risk assessment",
      "Guides on contract compliance",
    ],
  },
  "ai-monitoring-immigration-status-compliance": {
    agentName: "AI Immigration Status Monitoring Agent",
    summary: "Monitors migrant worker immigration status in real time.",
    points: [
      "Tracks visa/permit status",
      "Detects expired/expiring status",
      "Flags urgent compliance issues",
      "Generates status report",
      "Guides on status management",
    ],
  },
  "ai-contracted-hours-compliance": {
    agentName: "AI Contracted Hours Compliance Agent",
    summary: "Checks working hours against contract and legal limits.",
    points: [
      "Verifies hours worked",
      "Detects over/under working",
      "Flags contract breaches",
      "Generates hours report",
      "Guides on hours compliance",
    ],
  },
  "ai-paragraph-c7-26-compliance": {
    agentName: "AI Paragraph C7-26 Compliance Agent",
    summary: "Monitors compliance with Paragraph C7-26 requirements.",
    points: [
      "Tracks C7-26 obligations",
      "Detects non-compliance",
      "Flags breaches",
      "Generates compliance summary",
      "Guides on C7-26 actions",
    ],
  },
  "ai-document-compliance": {
    agentName: "AI Document Compliance Agent",
    summary: "Verifies authenticity and completeness of all sponsor documents.",
    points: [
      "Checks document authenticity",
      "Detects missing/expired docs",
      "Flags compliance risks",
      "Generates document report",
      "Guides on document management",
    ],
  },
  "ai-right-to-work-compliance": {
    agentName: "AI Right to Work Agent",
    summary: "Checks right to work status and Home Office integration.",
    points: [
      "Verifies RTW status",
      "Detects expired/invalid RTW",
      "Flags urgent issues",
      "Generates RTW report",
      "Guides on RTW compliance",
    ],
  },
  "ai-hr-compliance": {
    agentName: "AI HR Compliance Agent",
    summary: "Manages HR policy and employee compliance.",
    points: [
      "Checks HR policies",
      "Detects non-compliance",
      "Flags training gaps",
      "Generates HR compliance report",
      "Guides on HR actions",
    ],
  },
  "ai-genuine-vacancies-compliance": {
    agentName: "AI Genuine Vacancies Compliance Agent",
    summary: "Analyzes vacancy and recruitment compliance.",
    points: [
      "Verifies vacancy authenticity",
      "Detects recruitment breaches",
      "Flags market rate issues",
      "Generates vacancy report",
      "Guides on recruitment compliance",
    ],
  },
  "ai-maintaining-migrant-contact-compliance": {
    agentName: "AI Migrant Contact Maintenance Agent",
    summary: "Monitors and tracks migrant worker contact.",
    points: [
      "Tracks contact records",
      "Detects missing/invalid contact",
      "Flags communication issues",
      "Generates contact report",
      "Guides on contact compliance",
    ],
  },
  "ai-recruitment-practices-compliance": {
    agentName: "AI Recruitment Practices Compliance Agent",
    summary: "Checks recruitment practices and policy compliance.",
    points: [
      "Verifies recruitment process",
      "Detects policy breaches",
      "Flags transparency issues",
      "Generates recruitment report",
      "Guides on recruitment actions",
    ],
  },
  "ai-migrant-tracking-compliance": {
    agentName: "AI Migrant Tracking Compliance Agent",
    summary: "Tracks migrant worker activities for compliance.",
    points: [
      "Monitors activities",
      "Detects non-compliance",
      "Flags activity risks",
      "Generates tracking report",
      "Guides on activity compliance",
    ],
  },
  "ai-immigration-status-monitoring-compliance": {
    agentName: "AI Immigration Status Monitoring Agent",
    summary: "Monitors migrant worker immigration status in real time.",
    points: [
      "Tracks visa/permit status",
      "Detects expired/expiring status",
      "Flags urgent compliance issues",
      "Generates status report",
      "Guides on status management",
    ],
  },
  "ai-migrant-contact-maintenance-compliance": {
    agentName: "AI Migrant Contact Maintenance Agent",
    summary: "Monitors and tracks migrant worker contact.",
    points: [
      "Tracks contact records",
      "Detects missing/invalid contact",
      "Flags communication issues",
      "Generates contact report",
      "Guides on contact compliance",
    ],
  },
};

export default function AgentAssessmentExplainer() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentPath = pathSegments[pathSegments.length - 1];

  const explainer = agentExplainers[currentPath];

  if (!explainer) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="h-6 w-6 text-[#263976]" />
        <h2 className="text-xl font-bold text-[#263976]">
          {explainer.agentName}
        </h2>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">
        {explainer.summary}
      </p>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#263976] mb-2">
          What this agent does:
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {explainer.points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>

      {explainer.requiredDocuments && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#263976] mb-2">
            Documents required for a full compliance assessment:
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            {explainer.requiredDocuments.map((doc, index) => (
              <li key={index}>{doc}</li>
            ))}
          </ul>
        </div>
      )}

      {explainer.warning && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-600 font-medium text-sm leading-relaxed">
              {explainer.warning}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
