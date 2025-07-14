// This file is now deprecated. PDF parsing is handled in the /api/parse-pdf API route.
// You may safely remove this file if not used elsewhere.

import mammoth from 'mammoth';
import { ValidationError } from './error-handling';

interface ExtractedData {
  text: string;
  dates: string[];
  qualifications: string[];
  experience: ExperienceItem[];
  skills: string[];
  confidence: {
    overall: number;
    dates: number;
    qualifications: number;
    experience: number;
    skills: number;
  };
}

interface ExperienceItem {
  role: string;
  company: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  description: string;
}

class DocumentParserService {
  private datePatterns = [
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b/gi,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}\b/gi,
  ];

  private qualificationPatterns = [
    /\b(BSc|MSc|PhD|BA|MA|MBA|Certificate|Diploma|Degree|NVQ|BTEC|A-Level|GCSE)\b/gi,
    /\b(Care Certificate|Health and Social Care|First Aid|Manual Handling)\b/gi,
    /\b(IELTS|TOEFL|English Language)\b.*\b\d+\.?\d*\b/gi,
  ];

  private experienceHeaders = [
    'work experience', 'employment history', 'professional experience',
    'career history', 'work history', 'employment'
  ];

  private skillsHeaders = [
    'skills', 'technical skills', 'core competencies', 
    'key skills', 'competencies', 'expertise'
  ];

  async parseDocument(file: File): Promise<ExtractedData> {
    let text = '';
    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.type === 'application/msword') {
        text = await this.parseDOCX(file);
      } else if (file.type === 'text/plain') {
        text = await file.text();
      } else {
        throw new ValidationError(`Unsupported file type: ${file.type}`);
      }
      if (!text || text.trim().length === 0) {
        throw new ValidationError('Document appears to be empty');
      }
      return this.extractStructuredData(text);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(`Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseDOCX(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  private extractStructuredData(text: string): ExtractedData {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const extracted: ExtractedData = {
      text,
      dates: this.extractDates(text),
      qualifications: this.extractQualifications(text),
      experience: this.extractExperience(lines),
      skills: this.extractSkills(lines),
      confidence: {
        overall: 0,
        dates: 0,
        qualifications: 0,
        experience: 0,
        skills: 0
      }
    };
    extracted.confidence = this.calculateConfidence(extracted);
    return extracted;
  }

  private extractDates(text: string): string[] {
    const dates = new Set<string>();
    this.datePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => dates.add(match));
    });
    return Array.from(dates);
  }

  private extractQualifications(text: string): string[] {
    const qualifications = new Set<string>();
    this.qualificationPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const lines = text.split('\n');
        const matchingLine = lines.find(line => line.includes(match));
        if (matchingLine) {
          qualifications.add(matchingLine.trim());
        }
      });
    });
    return Array.from(qualifications);
  }

  private extractExperience(lines: string[]): ExperienceItem[] {
    const experience: ExperienceItem[] = [];
    let inExperienceSection = false;
    let currentExperience: Partial<ExperienceItem> | null = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const originalLine = lines[i];
      if (this.experienceHeaders.some(header => line.includes(header))) {
        inExperienceSection = true;
        continue;
      }
      if (inExperienceSection && this.skillsHeaders.some(header => line.includes(header))) {
        if (currentExperience && currentExperience.role) {
          experience.push(currentExperience as ExperienceItem);
        }
        break;
      }
      if (inExperienceSection) {
        const rolePattern = /^([^-–—]+)[-–—](.+)$/;
        const match = originalLine.match(rolePattern);
        if (match) {
          if (currentExperience && currentExperience.role) {
            experience.push(currentExperience as ExperienceItem);
          }
          currentExperience = {
            role: match[1].trim(),
            company: match[2].trim(),
            description: ''
          };
        } else if (currentExperience) {
          const hasDate = this.datePatterns.some(pattern => originalLine.match(pattern));
          if (hasDate) {
            const dates = this.extractDates(originalLine);
            if (dates.length >= 2) {
              currentExperience.startDate = dates[0];
              currentExperience.endDate = dates[1];
            }
          } else {
            currentExperience.description = 
              (currentExperience.description || '') + ' ' + originalLine;
          }
        }
      }
    }
    if (currentExperience && currentExperience.role) {
      experience.push(currentExperience as ExperienceItem);
    }
    return experience;
  }

  private extractSkills(lines: string[]): string[] {
    const skills: string[] = [];
    let inSkillsSection = false;
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (this.skillsHeaders.some(header => lowerLine.includes(header))) {
        inSkillsSection = true;
        continue;
      }
      if (inSkillsSection) {
        if (lowerLine.includes('education') || 
            lowerLine.includes('reference') || 
            lowerLine.includes('certification')) {
          break;
        }
        const skillItems = line.split(/[,•·]/).map(s => s.trim()).filter(s => s.length > 0);
        skills.push(...skillItems);
      }
    }
    return skills;
  }

  private calculateConfidence(data: ExtractedData): ExtractedData['confidence'] {
    const confidence = {
      dates: data.dates.length > 0 ? 0.8 : 0.2,
      qualifications: data.qualifications.length > 0 ? 0.9 : 0.1,
      experience: data.experience.length > 0 ? 0.85 : 0.15,
      skills: data.skills.length > 0 ? 0.75 : 0.25,
      overall: 0
    };
    confidence.overall = 
      (confidence.dates + confidence.qualifications + 
       confidence.experience + confidence.skills) / 4;
    return confidence;
  }

  validateExtractedData(data: ExtractedData): ValidationResult {
    const issues: string[] = [];
    const futureDate = data.dates.find(date => {
      const parsed = new Date(date);
      return parsed > new Date();
    });
    if (futureDate) {
      issues.push(`Future date detected: ${futureDate}`);
    }
    if (data.qualifications.length === 0) {
      issues.push('No qualifications found in document');
    }
    if (data.experience.length === 0) {
      issues.push('No work experience found in document');
    }
    return {
      isValid: issues.length === 0,
      issues,
      confidence: data.confidence.overall
    };
  }
}

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  confidence: number;
}

export const documentParserService = new DocumentParserService(); 