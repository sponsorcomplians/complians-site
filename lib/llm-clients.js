/**
 * Multi-LLM Client Library for UKVI Compliance Platform
 * Integrates with existing sponsorcomplians.co.uk platform
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Together from 'together-ai';

export class MultiLLMOrchestrator {
  constructor() {
    // Initialize all LLM clients
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.geminiModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    this.together = new Together({
      apiKey: process.env.TOGETHER_API_KEY,
    });
  }

  /**
   * Enhanced audit processing using multiple LLMs
   * This integrates with your existing audit functionality
   */
  async processEnhancedAudit(documents, auditType = 'salary-compliance') {
    try {
      console.log('🚀 Starting enhanced multi-LLM audit processing...');
      
      // Step 1: Document Classification (Llama 3.1)
      console.log('📄 Step 1: Classifying documents with Llama...');
      const classifiedDocs = await Promise.all(
        documents.map(doc => this.classifyDocument(doc.content, doc.filename))
      );

      // Step 2: Compliance Analysis (Claude 3.5)
      console.log('🏛️ Step 2: Analyzing compliance with Claude...');
      const complianceAnalysis = await this.analyzeCompliance(classifiedDocs, auditType);

      // Step 3: Calculations (Gemini Pro)
      console.log('🧮 Step 3: Performing calculations with Gemini...');
      const calculations = await this.performCalculations(complianceAnalysis.data, classifiedDocs);

      // Step 4: Report Generation (GPT-4)
      console.log('📝 Step 4: Generating report with GPT-4...');
      const report = await this.generateReport(complianceAnalysis.data, calculations.data, classifiedDocs);

      // Return comprehensive results
      return {
        success: true,
        audit_type: auditType,
        document_classifications: classifiedDocs,
        compliance_analysis: complianceAnalysis.data,
        calculations: calculations.data,
        report: report.data,
        usage_stats: {
          total_tokens: this.calculateTotalTokens([complianceAnalysis, calculations, report]),
          estimated_cost: this.estimateAuditCost([complianceAnalysis, calculations, report])
        }
      };

    } catch (error) {
      console.error('❌ Enhanced audit processing failed:', error);
      return {
        success: false,
        error: error.message,
        fallback_message: 'Enhanced AI analysis temporarily unavailable. Standard audit processing can continue.'
      };
    }
  }

  /**
   * Document classification using Llama 3.1
   */
  async classifyDocument(content, filename) {
    const prompt = `
      Analyze this UK immigration compliance document and classify it:
      
      Filename: ${filename}
      Content: ${content.substring(0, 2000)}...
      
      Classify as one of: certificate_of_sponsorship, employment_contract, payslip, right_to_work, job_description, other
      
      Extract key information:
      - Employee name
      - Employer name  
      - Job title
      - Salary information
      - Important dates
      
      Return JSON with: document_type, confidence, entities, summary
    `;

    try {
      const response = await this.together.chat.completions.create({
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      return {
        filename,
        content,
        classification: JSON.parse(response.choices[0].message.content),
        usage: response.usage
      };
    } catch (error) {
      console.error('Document classification error:', error);
      return {
        filename,
        content,
        classification: {
          document_type: 'other',
          confidence: 0.5,
          entities: {},
          summary: 'Classification failed - manual review required'
        },
        error: error.message
      };
    }
  }

  /**
   * Compliance analysis using Claude 3.5 Sonnet
   */
  async analyzeCompliance(classifiedDocuments, auditType) {
    const documentSummaries = classifiedDocuments.map(doc => 
      `Document: ${doc.filename}\nType: ${doc.classification.document_type}\nSummary: ${doc.classification.summary || 'N/A'}`
    ).join('\n\n');

    const prompt = `
      As a UK immigration compliance expert, analyze these documents for ${auditType}:
      
      ${documentSummaries}
      
      Apply UK Sponsor Licence requirements:
      - Minimum salary £26,200 per year
      - 100% of going rate for occupation
      - Consistent documentation
      - Proper allowances calculation
      
      Return JSON with:
      - overall_status: compliant/non_compliant/requires_review
      - risk_level: low/medium/high/critical
      - findings: array of specific findings
      - recommendations: array of actions needed
      - supporting_evidence: key evidence from documents
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.2,
        system: "You are a UK immigration compliance expert. Provide detailed analysis in JSON format.",
        messages: [{ role: 'user', content: prompt }]
      });

      return {
        success: true,
        data: JSON.parse(response.content[0].text),
        usage: response.usage
      };
    } catch (error) {
      console.error('Compliance analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculations using Gemini Pro
   */
  async performCalculations(complianceAnalysis, documents) {
    const salaryData = documents
      .filter(doc => ['payslip', 'employment_contract'].includes(doc.classification.document_type))
      .map(doc => `${doc.filename}: ${JSON.stringify(doc.classification.entities)}`)
      .join('\n');

    const prompt = `
      Calculate UK immigration compliance metrics:
      
      Salary Data: ${salaryData}
      
      Calculate:
      1. Annual salary (base + guaranteed allowances)
      2. Comparison to £26,200 minimum
      3. Monthly breakdown if multiple payslips
      4. Pro-rata calculations if part-time
      
      Return JSON with detailed calculations and explanations.
    `;

    try {
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const calculations = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        success: true,
        data: calculations,
        usage: {
          tokens_input: Math.ceil(prompt.length / 4),
          tokens_output: Math.ceil(text.length / 4)
        }
      };
    } catch (error) {
      console.error('Calculation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Report generation using GPT-4
   */
  async generateReport(complianceAnalysis, calculations, documents) {
    const prompt = `
      Generate a professional UK immigration compliance report:
      
      Compliance Analysis: ${JSON.stringify(complianceAnalysis)}
      Calculations: ${JSON.stringify(calculations)}
      Documents: ${documents.length} documents analyzed
      
      Create a comprehensive report with:
      1. Executive summary
      2. Document summary
      3. Detailed findings
      4. Risk assessment
      5. Recommendations
      6. Supporting evidence
      
      Format as JSON with clear sections for professional presentation.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional UK immigration compliance report writer. Create detailed, well-structured reports.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
        max_tokens: 4000
      });

      return {
        success: true,
        data: JSON.parse(response.choices[0].message.content),
        usage: response.usage
      };
    } catch (error) {
      console.error('Report generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate total tokens used across all LLMs
   */
  calculateTotalTokens(responses) {
    return responses.reduce((total, response) => {
      if (response.usage) {
        return total + (response.usage.input_tokens || response.usage.prompt_tokens || 0) + 
                      (response.usage.output_tokens || response.usage.completion_tokens || 0);
      }
      return total;
    }, 0);
  }

  /**
   * Estimate cost of the audit
   */
  estimateAuditCost(responses) {
    // Simplified cost calculation - you can make this more precise
    const totalTokens = this.calculateTotalTokens(responses);
    return (totalTokens / 1000) * 0.02; // Rough estimate: $0.02 per 1K tokens
  }
}
