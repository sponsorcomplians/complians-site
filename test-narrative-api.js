// Test script for narrative generation API
// Run with: node test-narrative-api.js

const testData = {
  workerName: "MD Suyeb Ahmed",
  cosReference: "C2G0M18244N",
  assignmentDate: "28 July 2023",
  jobTitle: "Healthcare Assistant",
  socCode: "6145",
  cosDuties: "Providing personal care and support to patients in healthcare settings",
  jobDescriptionDuties: "Assisting with patient care, monitoring vital signs, supporting nursing staff",
  hasJobDescription: true,
  hasCV: true,
  hasReferences: false,
  hasContracts: true,
  hasPayslips: false,
  hasTraining: false,
  employmentHistoryConsistent: false,
  experienceMatchesDuties: false,
  referencesCredible: false,
  experienceRecentAndContinuous: false,
  inconsistenciesDescription: "Interview conducted 27 July 2023, application form dated 30 September 2023 (after interview). No qualifications provided, only voluntary experience from Jan-Sep 2023.",
  missingDocs: ["Qualifications certificates", "Interview questions", "Interview notes", "Payslips", "Training certificates"],
  documents: [
    { name: "CV.pdf", type: "CV", date: "2023-07-27" },
    { name: "Application_Form.pdf", type: "Application", date: "2023-09-30" },
    { name: "Employment_Contract.pdf", type: "Contract", date: "2023-07-28" }
  ]
};

async function testNarrativeAPI() {
  try {
    console.log('Testing narrative generation API...');
    console.log('Test data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3000/api/generate-narrative', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'test-key'
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    if (data.narrative) {
      console.log('\n=== GENERATED NARRATIVE ===');
      console.log(data.narrative);
      console.log('=== END NARRATIVE ===\n');
    } else {
      console.error('No narrative in response');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testNarrativeAPI(); 