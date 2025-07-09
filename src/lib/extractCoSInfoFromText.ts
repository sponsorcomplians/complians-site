export interface CoSInfo {
  certificateNumber: string;
  dateAssigned: string;
  familyName: string;
  givenNames: string;
  workStartDate: string;
  workEndDate: string;
  weeklyHours: string;
  jobTitle: string;
  jobType: string;
  jobDescriptionSummary: string;
  grossSalary: string;
}

export function extractCoSInfoFromText(text: string): CoSInfo {
  // Helper to extract a field by label (case-insensitive, flexible)
  function extract(label: string, text: string, fallback = ""): string {
    // Accept variations like 'Given name(s):', 'Given names:', 'Given Name(s):'
    const regex = new RegExp(label + "[\s\(\)a-zA-Z]*:[\s]*([\S\s]*?)(?:\n|$)", "i");
    const match = text.match(regex);
    return match ? match[1].trim() : fallback;
  }

  return {
    certificateNumber: extract("Certificate number", text),
    dateAssigned: extract("Date assigned", text),
    familyName: extract("Family name", text),
    givenNames: extract("Given name", text) || extract("Given name\(s\)", text) || extract("Given names", text),
    workStartDate: extract("Work start date", text),
    workEndDate: extract("Work end date", text),
    weeklyHours: extract("Total weekly hours of work", text),
    jobTitle: extract("Job title", text),
    jobType: extract("Job type", text),
    jobDescriptionSummary: extract("Summary of job description", text),
    grossSalary: extract("Gross salary in pounds sterling", text),
  };
} 