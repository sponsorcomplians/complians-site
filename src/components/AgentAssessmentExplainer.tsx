import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";

const agentExplainers: Record<
  string,
  { agentName: string; summary: string; points: string[] }
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
    agentName: "AI Skills & Experience Compliance Agent",
    summary:
      "Reviews CVs and experience records for role suitability and compliance.",
    points: [
      "Verifies skills/experience match role",
      "Detects gaps or missing evidence",
      "Flags compliance risks",
      "Generates assessment report",
      "Guides on remedial actions",
    ],
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
  // Extract agent key from the path, e.g. '/ai-qualification-compliance' => 'ai-qualification-compliance'
  const agentKey =
    pathname?.split("/").find((seg) => seg.startsWith("ai-")) || "";
  const explainer = agentExplainers[agentKey];

  if (!explainer) return null;

  return (
    <div className="mb-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-5 w-5 text-[#00c3ff]" />
          <span className="font-semibold text-[#263976]">
            What does this AI Agent do?
          </span>
        </div>
        <div className="text-gray-700 mb-2">
          <strong>{explainer.agentName}</strong> {explainer.summary}
        </div>
        <ul className="list-disc list-inside text-gray-700 pl-4">
          {explainer.points.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
