import { usePathname } from "next/navigation";
import { Bot, AlertTriangle } from "lucide-react";

const agentExplainers: Record<
  string,
  { agentName: string; summary: string; points: string[]; requiredDocuments?: string[]; warning?: string }
> = {
  "ai-qualification-compliance": {
    agentName: "AI Qualification Compliance System",
    summary:
      "The AI Qualification Compliance System is an advanced automated tool designed to evaluate and verify whether sponsored workers possess the necessary formal qualifications required for their roles. It ensures sponsors meet Home Office requirements for skill level and qualification evidence, reducing the risk of compliance breaches and protecting the sponsor licence.",
    points: [
      "Verifies that qualifications match the specific SOC code and job role",
      "Confirms qualifications were obtained before CoS assignment date",
      "Reviews degree certificates, diplomas, and transcripts",
      "Flags non-relevant or unaccredited qualifications",
      "Identifies discrepancies between declared and documented qualifications",
      "Generates detailed legal-style compliance reports",
      "Provides remedial guidance for qualification gaps",
    ],
    requiredDocuments: [
      "Certificate of Sponsorship (CoS)",
      "Full job description document",
      "Qualification certificates (degrees, diplomas)",
      "Academic transcripts or mark sheets",
      "Professional membership certificates (if applicable)",
      "English language evidence (if relevant)",
    ],
  },
  "ai-salary-compliance": {
    agentName: "AI Salary Compliance System",
    summary:
      "The AI Salary Compliance System is a specialist automated analysis tool designed to verify that migrant workers' salaries meet or exceed the Home Office minimum salary thresholds and conditions set out in sponsor guidance. This system protects sponsors from underpayment breaches and ensures ongoing compliance with immigration and employment laws.",
    points: [
      "Checks salaries against the relevant SOC code thresholds",
      "Verifies pay consistency with CoS and employment contract",
      "Analyses payslips, contracts, and financial records",
      "Flags underpayments or unlawful deductions",
      "Confirms correct hourly rates and minimum hours compliance",
      "Generates detailed compliance risk reports",
      "Provides guidance on remedial salary adjustments",
    ],
    requiredDocuments: [
      "Certificate of Sponsorship (CoS)",
      "Employment contract specifying salary terms",
      "Recent payslips (last 3–6 months)",
      "Bank statements or payroll summaries",
      "Job description specifying working hours and duties",
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
    agentName: "AI Third Party Labour Compliance System",
    summary: "The AI Third Party Labour Compliance System is designed to help sponsors ensure that any workers supplied through third-party arrangements are engaged lawfully and in compliance with Home Office rules. This system helps sponsors avoid risks of unlawful sub-contracting, disguised employment relationships, and breaches of sponsor licence duties.",
    points: [
      "Analyses contracts and agreements with labour supply agencies",
      "Verifies that third-party workers are under genuine, direct control of the sponsor",
      "Checks for disguised sub-contracting or unauthorised outsourcing arrangements",
      "Identifies missing contracts, unauthorised deployments, or gaps in control evidence",
      "Flags high-risk practices that could lead to suspension or revocation",
      "Generates compliance assessment reports with actionable recommendations",
    ],
    requiredDocuments: [
      "Contracts with third-party labour suppliers",
      "Control and supervision agreements",
      "Worker assignment letters or deployment records",
      "Payroll and timesheet records for third-party workers",
      "Right to work checks and compliance evidence for supplied workers",
      "Organisation charts and operational structure documents",
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
    agentName: "AI Contracted Hours Compliance System",
    summary: "The AI Contracted Hours Compliance System is an intelligent tool designed to verify that sponsored workers are consistently working the contracted weekly hours declared to the Home Office and stated on their Certificate of Sponsorship (CoS). It protects sponsors against non-compliance with working hour obligations and identifies risks of potential underemployment or false reporting.",
    points: [
      "Verifies actual hours worked against contracted hours in the CoS and employment contracts",
      "Cross-checks timesheets, rota schedules, and work logs",
      "Detects patterns of underemployment or inconsistencies in reported hours",
      "Flags potential breaches under paragraph C1.39",
      "Generates clear legal-style compliance reports",
      "Provides guidance on corrective actions to address shortfalls",
    ],
    requiredDocuments: [
      "Certificate of Sponsorship (CoS)",
      "Employment contract stating contracted weekly hours",
      "Timesheets or daily logs",
      "Rota schedules",
      "Payroll summaries showing hours paid",
    ],
  },
  "ai-paragraph-c7-26-compliance": {
    agentName: "AI Paragraph C7.26 Compliance System",
    summary: "The AI Paragraph C7.26 Compliance System is designed to evaluate whether sponsors maintain and provide appropriate records and evidence demonstrating that migrant workers continue to meet visa conditions and sponsorship requirements. This system ensures full compliance with paragraph C7.26 of the Immigration Rules, protecting sponsors from revocation risks.",
    points: [
      "Reviews ongoing compliance evidence for sponsored workers",
      "Checks for adherence to visa conditions and sponsor duties",
      "Detects missing or outdated records supporting lawful employment",
      "Flags risks of non-compliance with paragraph C7.26 and possible breaches",
      "Generates detailed legal-style compliance narratives and audit summaries",
    ],
    requiredDocuments: [
      "Evidence of right to work checks and visa validity",
      "Updated employment and role records",
      "Training records and ongoing development evidence",
      "Absence and attendance records",
      "Correspondence with the Home Office on migrant status updates",
      "Any documentation confirming compliance with visa conditions",
    ],
  },
  "ai-document-compliance": {
    agentName: "AI Document Compliance System",
    summary: "The AI Document Compliance System is a dedicated automated solution that validates the completeness, authenticity, and correctness of required documentation for sponsored migrant workers. It ensures that all legal and regulatory documents are accurate and maintained in accordance with Home Office Appendix D requirements.",
    points: [
      "Checks completeness and authenticity of documents",
      "Analyses right to work checks, visas, and biometric permits",
      "Detects expired or forged documents",
      "Verifies consistency across application files, CoS, and HR records",
      "Flags risks of document-based non-compliance",
      "Generates detailed legal-style compliance reports",
      "Advises on rectification and immediate corrective actions",
    ],
    requiredDocuments: [
      "Passport copies and biometric residence permits",
      "Right to work verification records",
      "Certificate of Sponsorship (CoS)",
      "Proof of address documents",
      "Visa and immigration status documents",
      "Employee file with HR records and copies of key documents",
    ],
  },
  "ai-right-to-work-compliance": {
    agentName: "AI Right to Work Compliance System",
    summary: "The AI Right to Work Compliance System is a specialised tool designed to help sponsors verify and document their employees' right to work in the UK in line with Home Office regulations. This system ensures all necessary checks are performed, documented, and retained, protecting the sponsor against civil penalties and licence risks.",
    points: [
      "Verifies right to work checks have been conducted before employment start date",
      "Analyses documents such as share codes, visas, passports, and Biometric Residence Permits",
      "Checks for correct record-keeping and re-check scheduling where required",
      "Flags gaps in documentation or improper verification procedures",
      "Generates detailed compliance reports citing Home Office guidance",
      "Provides recommendations for remedial actions",
    ],
    requiredDocuments: [
      "Right to work check documentation (copies of original ID documents)",
      "Share code verification results",
      "Passport or national ID copies",
      "Biometric Residence Permit copies (if applicable)",
      "Verification logs and internal checklists",
      "Records of follow-up or repeat checks (if required)",
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
    agentName: "AI Genuine Vacancy Compliance System",
    summary: "The AI Genuine Vacancy Compliance System is an advanced analysis tool designed to verify that roles offered under Certificates of Sponsorship (CoS) are genuine, immediate, and supported by robust operational need and evidence. It ensures that sponsors do not create speculative or artificial vacancies, protecting their sponsor licence from enforcement action.",
    points: [
      "Verifies if job roles truly exist at the time of application",
      "Reviews service contracts, business agreements, and staffing plans",
      "Assesses financial viability to pay salaries",
      "Detects speculative or future-dependent roles",
      "Flags compliance risks under paragraphs C1.38, C1.44, and C1.46 of the Immigration Rules",
      "Generates legal-style compliance risk reports",
      "Provides guidance on immediate remedial steps for non-genuine roles",
    ],
    requiredDocuments: [
      "Certificate of Sponsorship (CoS)",
      "Full job description document",
      "Signed service contracts or business agreements",
      "Staffing plan or workforce analysis",
      "Financial statements or bank evidence showing salary capacity",
      "Recruitment advertisements and role justification documents",
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
    agentName: "AI Migrant Tracking Compliance System",
    summary: "The AI Migrant Tracking Compliance System ensures sponsors maintain continuous awareness and control over the whereabouts and working status of all sponsored workers, as required by UK Home Office guidance. Proper tracking helps sponsors demonstrate ongoing monitoring and mitigate risks related to unauthorised absences or changes in circumstances.",
    points: [
      "Verifies records of worker locations, assignments, and absences",
      "Identifies missing or inconsistent tracking logs",
      "Checks whether reporting of changes in duties or work location is compliant",
      "Flags non-compliance with paragraph C1.19 and record-keeping duties",
      "Generates comprehensive compliance analysis reports and actionable audit findings",
    ],
    requiredDocuments: [
      "Worker assignment and rota records",
      "Absence records and authorisation forms",
      "Work location change notifications",
      "HR tracking logs and updates",
      "Correspondence relating to assignments or site changes",
      "Any documented evidence of sponsor oversight on worker whereabouts",
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
    agentName: "AI Migrant Contact Maintenance Compliance System",
    summary: "The AI Migrant Contact Maintenance Compliance System supports sponsors in meeting their duty to keep accurate and up-to-date contact details for all sponsored workers, as required by the Home Office. Maintaining valid contact information ensures that sponsors can meet record-keeping duties and demonstrate control over their sponsored workforce.",
    points: [
      "Reviews records to confirm current residential address, phone number, and email are up to date",
      "Identifies missing, outdated, or inconsistent contact details",
      "Cross-checks contact data against official records and HR databases",
      "Highlights potential non-compliance with paragraph C1.19 and record-keeping duties under Appendix D",
      "Generates detailed audit reports with compliance findings and required remedial actions",
    ],
    requiredDocuments: [
      "Latest residential address records",
      "Phone numbers and email addresses on file",
      "Change of address or contact update forms",
      "HR system data extracts",
      "Copies of any sponsor-held personal information change notifications",
      "Signed declarations or acknowledgements from the worker confirming updated details",
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
