import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    console.log('📥 [API] Received request body:', JSON.stringify(body, null, 2));
    
    // Ensure all fields have default values to prevent undefined errors
    const {
      workerName = 'Unknown Worker',
      jobTitle = 'Unknown Role',
      socCode = 'Unknown SOC',
      assignmentDate = 'Unknown Date',
      cosDuties = 'No CoS duties provided',
      jobDescriptionDuties = 'No job description duties provided',
      cvSummary = 'No CV summary provided',
      referenceSummary = 'No reference summary provided',
      employmentEvidenceSummary = 'No employment evidence provided',
      missingDocs = 'No missing documents specified',
      inconsistencies = 'No inconsistencies identified',
      experienceConcerns = 'No experience concerns identified',
      isCompliant = false,
    } = body;

    console.log('🔍 [API] Extracted workerName:', workerName);
    console.log('🔍 [API] Extracted jobTitle:', jobTitle);

    // Validate required fields with better error messages
    if (!workerName || workerName.trim() === '' || workerName === 'Unknown Worker') {
      console.error('❌ [API] Worker name validation failed:', { workerName, body });
      return NextResponse.json({ 
        error: 'Worker name is required and cannot be empty',
        receivedData: { workerName, bodyKeys: Object.keys(body) }
      }, { status: 400 });
    }

    const systemPrompt = `
You are a Senior Immigration Solicitor and UK sponsor compliance expert. 
You will generate a formal compliance assessment letter in British English, using complete paragraphs (no steps, no bullet points).
Use only the data provided below — do not invent or summarise. Do not include placeholders or static templates.

Data:
- Worker Name: ${workerName}
- Job Title: ${jobTitle}
- SOC Code: ${socCode}
- CoS Assignment Date: ${assignmentDate}
- CoS Duties: ${cosDuties}
- Job Description Duties: ${jobDescriptionDuties}
- CV Summary: ${cvSummary}
- Reference Summary: ${referenceSummary}
- Employment Evidence: ${employmentEvidenceSummary}
- Missing Documents: ${missingDocs}
- Inconsistencies: ${inconsistencies}
- Experience Concerns: ${experienceConcerns}
- Compliance Status: ${isCompliant ? "Compliant" : "Serious Breach"}

Legal references to include where non-compliance is found:
- Paragraph C1.38: "Sponsors must not employ a worker where they do not believe the worker will comply with the conditions of their permission to stay, or where they have reasonable grounds to believe the worker does not have the necessary skills, qualifications, or professional accreditations to do the job in question."
- Annex C2(g): "You fail to provide to us, when requested and within the time limit given, either: • a document specified in Appendix D to the sponsor guidance • specified evidence you were required to keep for workers sponsored under the shortage occupation provisions in Appendix K to the Immigration Rules in force before 1 December 2020."
- Annex C2(a): "You pose a threat to immigration control, for example because you have engaged in behaviour or actions that call into question your suitability to hold a sponsor licence."

Instructions:
- Compose the letter clearly as paragraphs, referencing the data above.
- If any documents are missing, explicitly mention them and cite Annex C2(g).
- If non-compliance is found, clearly conclude with a compliance verdict: "SERIOUS BREACH — immediate remedial action required", and recommend internal audit and corrective Home Office reporting.
- Do not use placeholders like [Date] or [Letterhead].
- Do not return any static template. Always dynamically incorporate provided data.

Return only the final letter text in your response.
    `;

    console.log('🤖 [API] Calling OpenAI with workerName:', workerName);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the compliance assessment narrative as instructed.' }
      ],
      temperature: 0.2,
      max_tokens: 2500,
    });

    const output = completion.choices[0].message.content;

    // Strict validation to avoid placeholders
    if (!output || output.includes('[') || output.includes('Letterhead') || output.includes('Recipient')) {
      throw new Error('AI returned placeholder or invalid narrative.');
    }

    console.log('✅ [API] AI Raw Output generated successfully for worker:', workerName);

    return NextResponse.json({ narrative: output });
  } catch (error: any) {
    console.error('❌ [API] AI Narrative generation error:', error);
    console.error('❌ [API] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: 'Narrative generation failed. Check logs for details.',
      details: error.message 
    }, { status: 500 });
  }
} 