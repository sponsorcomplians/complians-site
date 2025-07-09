import { extractCoSInfoFromText, CoSInfo } from './extractCoSInfoFromText';

// CV/Resume Information
export interface CVInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>;
  skills: string[];
  certifications: string[];
}

// Reference Letter Information
export interface ReferenceLetterInfo {
  refereeName: string;
  refereeTitle: string;
  refereeCompany: string;
  refereeEmail: string;
  refereePhone: string;
  candidateName: string;
  employmentPeriod: string;
  position: string;
  duties: string;
  performance: string;
  recommendation: string;
  date: string;
  letterhead: boolean;
}

// Employment Contract Information
export interface EmploymentContractInfo {
  employerName: string;
  employeeName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  probationPeriod: string;
  salary: string;
  workingHours: string;
  duties: string;
  noticePeriod: string;
  contractType: string;
  signatureDate: string;
}

// Payslip Information
export interface PayslipInfo {
  employeeName: string;
  employerName: string;
  payPeriod: string;
  payDate: string;
  grossPay: string;
  netPay: string;
  taxDeductions: string;
  nationalInsurance: string;
  pension: string;
  otherDeductions: string;
  hoursWorked: string;
  hourlyRate: string;
}

// Training Certificate Information
export interface TrainingCertificateInfo {
  certificateName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
  certificateNumber: string;
  candidateName: string;
  courseDuration: string;
  courseType: string;
  accreditation: string;
  grade: string;
}

// Job Description Information
export interface JobDescriptionInfo {
  jobTitle: string;
  department: string;
  reportingTo: string;
  salary: string;
  location: string;
  jobType: string;
  mainDuties: string[];
  requiredSkills: string[];
  requiredExperience: string;
  requiredQualifications: string;
  workingHours: string;
  benefits: string[];
}

// Passport Information
export interface PassportInfo {
  passportNumber: string;
  surname: string;
  givenNames: string;
  nationality: string;
  dateOfBirth: string;
  placeOfBirth: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  issuingAuthority: string;
  machineReadableZone: string;
}

// Bank Statement Information
export interface BankStatementInfo {
  accountHolderName: string;
  accountNumber: string;
  sortCode: string;
  bankName: string;
  statementPeriod: string;
  openingBalance: string;
  closingBalance: string;
  transactions: Array<{
    date: string;
    description: string;
    amount: string;
    type: string;
  }>;
}

// Right to Work Check Information
export interface RightToWorkInfo {
  employeeName: string;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  nationality: string;
  checkDate: string;
  checkerName: string;
  checkMethod: string;
  result: string;
  notes: string;
}

// Document Type Detection
export function detectDocumentType(fileName: string, text: string): string {
  const lowerText = text.toLowerCase();
  const lowerFileName = fileName.toLowerCase();

  if (lowerFileName.includes('cos') || lowerText.includes('certificate of sponsorship')) {
    return 'cos';
  }
  if (lowerFileName.includes('cv') || lowerFileName.includes('resume') || lowerText.includes('curriculum vitae')) {
    return 'cv';
  }
  if (lowerFileName.includes('reference') || lowerText.includes('reference letter') || lowerText.includes('referee')) {
    return 'reference';
  }
  if (lowerFileName.includes('contract') || lowerText.includes('employment contract') || lowerText.includes('terms of employment')) {
    return 'contract';
  }
  if (lowerFileName.includes('payslip') || lowerText.includes('payslip') || lowerText.includes('pay statement')) {
    return 'payslip';
  }
  if (lowerFileName.includes('certificate') || lowerText.includes('training certificate') || lowerText.includes('qualification')) {
    return 'certificate';
  }
  if (lowerFileName.includes('job') && lowerFileName.includes('description')) {
    return 'jobDescription';
  }
  if (lowerFileName.includes('passport') || lowerText.includes('passport')) {
    return 'passport';
  }
  if (lowerFileName.includes('bank') || lowerText.includes('bank statement')) {
    return 'bankStatement';
  }
  if (lowerFileName.includes('right') && lowerFileName.includes('work')) {
    return 'rightToWork';
  }

  return 'unknown';
}

// CV Extraction
export function extractCVInfo(text: string): CVInfo {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let fullName = '';
  // Try to find a line that looks like a name at the top
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (/^[A-Z][a-z]+( [A-Z][a-z]+)+$/.test(line) || /[A-Za-z]+[, ]+[A-Za-z]+/.test(line)) {
      fullName = line;
      break;
    }
    if (/^(Name|Full Name)[:\s]/i.test(line)) {
      fullName = line.replace(/^(Name|Full Name)[:\s]*/i, '');
      break;
    }
  }
  // Fallback: use the first non-empty line
  if (!fullName && lines.length > 0) {
    fullName = lines[0];
  }
  const info: CVInfo = {
    fullName,
    email: '',
    phone: '',
    address: '',
    summary: '',
    workExperience: [],
    education: [],
    skills: [],
    certifications: []
  };

  // Extract basic info
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Email
    const emailMatch = line.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch && !info.email) {
      info.email = emailMatch[0];
    }
    
    // Phone
    const phoneMatch = line.match(/(\+44|0)\s*\d{2,4}\s*\d{3,4}\s*\d{3,4}/);
    if (phoneMatch && !info.phone) {
      info.phone = phoneMatch[0];
    }
  }

  return info;
}

// Reference Letter Extraction
export function extractReferenceLetterInfo(text: string): ReferenceLetterInfo {
  const info: ReferenceLetterInfo = {
    refereeName: '',
    refereeTitle: '',
    refereeCompany: '',
    refereeEmail: '',
    refereePhone: '',
    candidateName: '',
    employmentPeriod: '',
    position: '',
    duties: '',
    performance: '',
    recommendation: '',
    date: '',
    letterhead: text.includes('letterhead') || text.includes('headed paper')
  };

  // Extract referee info
  const refereeMatch = text.match(/(?:referee|from|signed by)[:\s]*([A-Za-z\s]+)/i);
  if (refereeMatch) {
    info.refereeName = refereeMatch[1].trim();
  }

  // Extract candidate name
  const candidateMatch = text.match(/(?:candidate|employee|worker)[:\s]*([A-Za-z\s]+)/i);
  if (candidateMatch) {
    info.candidateName = candidateMatch[1].trim();
  }

  return info;
}

// Employment Contract Extraction
export function extractEmploymentContractInfo(text: string): EmploymentContractInfo {
  const info: EmploymentContractInfo = {
    employerName: '',
    employeeName: '',
    jobTitle: '',
    startDate: '',
    endDate: '',
    probationPeriod: '',
    salary: '',
    workingHours: '',
    duties: '',
    noticePeriod: '',
    contractType: '',
    signatureDate: ''
  };

  // Extract employer and employee names
  const employerMatch = text.match(/(?:employer|company)[:\s]*([A-Za-z\s]+)/i);
  if (employerMatch) {
    info.employerName = employerMatch[1].trim();
  }

  const employeeMatch = text.match(/(?:employee|worker)[:\s]*([A-Za-z\s]+)/i);
  if (employeeMatch) {
    info.employeeName = employeeMatch[1].trim();
  }

  return info;
}

// Payslip Extraction
export function extractPayslipInfo(text: string): PayslipInfo {
  const info: PayslipInfo = {
    employeeName: '',
    employerName: '',
    payPeriod: '',
    payDate: '',
    grossPay: '',
    netPay: '',
    taxDeductions: '',
    nationalInsurance: '',
    pension: '',
    otherDeductions: '',
    hoursWorked: '',
    hourlyRate: ''
  };

  // Extract employee name
  const employeeMatch = text.match(/(?:employee|name)[:\s]*([A-Za-z\s]+)/i);
  if (employeeMatch) {
    info.employeeName = employeeMatch[1].trim();
  }

  // Extract gross pay
  const grossMatch = text.match(/gross[:\s]*£?([\d,]+\.?\d*)/i);
  if (grossMatch) {
    info.grossPay = grossMatch[1];
  }

  return info;
}

// Training Certificate Extraction
export function extractTrainingCertificateInfo(text: string): TrainingCertificateInfo {
  const info: TrainingCertificateInfo = {
    certificateName: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    certificateNumber: '',
    candidateName: '',
    courseDuration: '',
    courseType: '',
    accreditation: '',
    grade: ''
  };

  // Extract certificate name
  const certMatch = text.match(/(?:certificate|course)[:\s]*([A-Za-z\s]+)/i);
  if (certMatch) {
    info.certificateName = certMatch[1].trim();
  }

  // Extract candidate name
  const candidateMatch = text.match(/(?:candidate|name)[:\s]*([A-Za-z\s]+)/i);
  if (candidateMatch) {
    info.candidateName = candidateMatch[1].trim();
  }

  return info;
}

// Job Description Extraction
export function extractJobDescriptionInfo(text: string): JobDescriptionInfo {
  const info: JobDescriptionInfo = {
    jobTitle: '',
    department: '',
    reportingTo: '',
    salary: '',
    location: '',
    jobType: '',
    mainDuties: [],
    requiredSkills: [],
    requiredExperience: '',
    requiredQualifications: '',
    workingHours: '',
    benefits: []
  };

  // Extract job title
  const titleMatch = text.match(/(?:job title|position)[:\s]*([A-Za-z\s]+)/i);
  if (titleMatch) {
    info.jobTitle = titleMatch[1].trim();
  }

  return info;
}

// Passport Extraction
export function extractPassportInfo(text: string): PassportInfo {
  const info: PassportInfo = {
    passportNumber: '',
    surname: '',
    givenNames: '',
    nationality: '',
    dateOfBirth: '',
    placeOfBirth: '',
    dateOfIssue: '',
    dateOfExpiry: '',
    issuingAuthority: '',
    machineReadableZone: ''
  };

  // Extract passport number
  const passportMatch = text.match(/(?:passport number|number)[:\s]*([A-Z0-9]+)/i);
  if (passportMatch) {
    info.passportNumber = passportMatch[1];
  }

  return info;
}

// Bank Statement Extraction
export function extractBankStatementInfo(text: string): BankStatementInfo {
  const info: BankStatementInfo = {
    accountHolderName: '',
    accountNumber: '',
    sortCode: '',
    bankName: '',
    statementPeriod: '',
    openingBalance: '',
    closingBalance: '',
    transactions: []
  };

  // Extract account holder name
  const nameMatch = text.match(/(?:account holder|name)[:\s]*([A-Za-z\s]+)/i);
  if (nameMatch) {
    info.accountHolderName = nameMatch[1].trim();
  }

  return info;
}

// Right to Work Check Extraction
export function extractRightToWorkInfo(text: string): RightToWorkInfo {
  const info: RightToWorkInfo = {
    employeeName: '',
    documentType: '',
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    nationality: '',
    checkDate: '',
    checkerName: '',
    checkMethod: '',
    result: '',
    notes: ''
  };

  // Extract employee name
  const employeeMatch = text.match(/(?:employee|name)[:\s]*([A-Za-z\s]+)/i);
  if (employeeMatch) {
    info.employeeName = employeeMatch[1].trim();
  }

  return info;
}

// Main extraction function
export function extractDocumentInfo(fileName: string, text: string) {
  const documentType = detectDocumentType(fileName, text);
  
  switch (documentType) {
    case 'cos':
      return { type: 'cos', data: extractCoSInfoFromText(text) };
    case 'cv':
      return { type: 'cv', data: extractCVInfo(text) };
    case 'reference':
      return { type: 'reference', data: extractReferenceLetterInfo(text) };
    case 'contract':
      return { type: 'contract', data: extractEmploymentContractInfo(text) };
    case 'payslip':
      return { type: 'payslip', data: extractPayslipInfo(text) };
    case 'certificate':
      return { type: 'certificate', data: extractTrainingCertificateInfo(text) };
    case 'jobDescription':
      return { type: 'jobDescription', data: extractJobDescriptionInfo(text) };
    case 'passport':
      return { type: 'passport', data: extractPassportInfo(text) };
    case 'bankStatement':
      return { type: 'bankStatement', data: extractBankStatementInfo(text) };
    case 'rightToWork':
      return { type: 'rightToWork', data: extractRightToWorkInfo(text) };
    default:
      return { type: 'unknown', data: { rawText: text } };
  }
} 