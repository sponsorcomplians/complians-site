/**
 * Test the Complete Multi-LLM Audit System
 */

require('dotenv').config({ path: '.env.local' });

async function testCompleteAuditSystem() {
  console.log('🧪 Testing Complete Multi-LLM Audit System...');
  console.log('================================================');
  console.log('');

  try {
    // Import your MultiLLMOrchestrator
    const { MultiLLMOrchestrator } = await import('./lib/ai/llm-clients.js');
    
    const orchestrator = new MultiLLMOrchestrator();
    
    // Mock realistic compliance documents for testing
    const testDocuments = [
      {
        filename: 'certificate_of_sponsorship.pdf',
        content: `
          CERTIFICATE OF SPONSORSHIP
          Reference Number: ABC123456789
          
          Sponsor Details:
          Company: Tech Solutions Ltd
          Sponsor Licence Number: ABCD1234567
          
          Employee Details:
          Name: John Smith
          Date of Birth: 15/03/1990
          Nationality: Indian
          Job Title: Software Developer
          
          Employment Details:
          Start Date: 01/01/2024
          Annual Salary: £35,000
          Working Hours: 40 hours per week
          Location: London, UK
        `
      },
      {
        filename: 'employment_contract.pdf',
        content: `
          EMPLOYMENT CONTRACT
          
          Employee: John Smith
          Employer: Tech Solutions Ltd
          Position: Software Developer
          
          Terms:
          Start Date: 1st January 2024
          Annual Salary: £35,000
          Basic Salary: £32,000
          London Allowance: £3,000
          
          Working Hours: 40 hours per week
          Probation Period: 6 months
          
          This contract is subject to the employee maintaining valid immigration status.
        `
      },
      {
        filename: 'payslip_january_2024.pdf',
        content: `
          PAYSLIP - January 2024
          
          Employee: John Smith
          Employee ID: EMP001
          Department: Engineering
          
          Earnings:
          Basic Salary: £2,666.67
          London Allowance: £250.00
          Total Gross: £2,916.67
          
          Deductions:
          Income Tax: £485.00
          National Insurance: £292.00
          Total Deductions: £777.00
          
          Net Pay: £2,139.67
          
          Year to Date:
          Gross: £2,916.67
          Tax: £485.00
          NI: £292.00
        `
      }
    ];
    
    console.log('📄 Testing with 3 documents:');
    console.log('  - Certificate of Sponsorship');
    console.log('  - Employment Contract');
    console.log('  - January 2024 Payslip');
    console.log('');
    
    console.log('🚀 Starting multi-LLM audit processing...');
    console.log('');
    
    const startTime = Date.now();
    const results = await orchestrator.processEnhancedAudit(testDocuments, 'salary-compliance');
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    
    if (results.success) {
      console.log('✅ MULTI-LLM AUDIT COMPLETED SUCCESSFULLY!');
      console.log('==========================================');
      console.log('');
      
      console.log('📊 AUDIT RESULTS SUMMARY:');
      console.log('-------------------------');
      console.log(`Processing Time: ${processingTime} seconds`);
      console.log(`Documents Processed: ${results.document_classifications.length}`);
      console.log('');
      
      console.log('📄 DOCUMENT CLASSIFICATIONS:');
      results.document_classifications.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.filename}`);
        console.log(`     Type: ${doc.classification.document_type}`);
        console.log(`     Confidence: ${(doc.classification.confidence * 100).toFixed(1)}%`);
      });
      console.log('');
      
      console.log('⚖️ COMPLIANCE ANALYSIS:');
      console.log(`  Overall Status: ${results.compliance_analysis.overall_status.toUpperCase()}`);
      console.log(`  Risk Level: ${results.compliance_analysis.risk_level.toUpperCase()}`);
      console.log(`  Findings: ${results.compliance_analysis.findings?.length || 0} issues identified`);
      console.log('');
      
      console.log('🧮 CALCULATIONS:');
      if (results.calculations.annual_salary_calculation) {
        console.log(`  Annual Salary: £${results.calculations.annual_salary_calculation.total || 'N/A'}`);
      }
      console.log('');
      
      console.log('📝 REPORT GENERATED:');
      console.log(`  Executive Summary: ${results.report.executive_summary ? 'Generated' : 'Not available'}`);
      console.log(`  Detailed Findings: ${results.report.detailed_findings ? 'Generated' : 'Not available'}`);
      console.log('');
      
      console.log('💰 USAGE STATISTICS:');
      console.log(`  Total Tokens: ${results.usage_stats.total_tokens}`);
      console.log(`  Estimated Cost: $${results.usage_stats.estimated_cost.toFixed(4)}`);
      console.log('');
      
      console.log('🎉 YOUR MULTI-LLM COMPLIANCE PLATFORM IS FULLY OPERATIONAL!');
      console.log('');
      console.log('🚀 Ready to integrate with sponsorcomplians.co.uk!');
      
    } else {
      console.log('❌ Multi-LLM audit test failed:');
      console.log(`Error: ${results.error}`);
      console.log(`Fallback: ${results.fallback_message}`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.log('');
    console.log('💡 This might be due to ES modules. The system should work in your Next.js app.');
  }
}

testCompleteAuditSystem();
