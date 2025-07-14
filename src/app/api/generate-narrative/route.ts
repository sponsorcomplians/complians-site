import { NextRequest, NextResponse } from 'next/server';
import { trackNarrativeGeneration } from '@/lib/tenant-metrics-service';
import { canPerformAction } from '@/lib/stripe-billing-service';
import { logAuditEvent } from '@/lib/audit-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { NarrativeGenerationService } from '@/lib/narrativeGenerationService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (process.env.DISABLE_AUTH === 'true') return NextResponse.json({ user: { email: 'dev@test.com', role: 'admin' } });

  try {
    const session = await getServerSession(authOptions);
    const headersList = await headers();
    
    if (!session?.user?.id || !session?.user?.tenant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if tenant can generate more narratives
    const canGenerateNarrative = await canPerformAction(session.user.tenant_id, 'generate_narrative');
    
    if (!canGenerateNarrative) {
      return NextResponse.json(
        { 
          error: 'Narrative limit exceeded',
          message: 'You have reached the maximum number of narratives for your current plan. Please upgrade your plan to generate more narratives.'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('📥 [API] Received request body:', JSON.stringify(body, null, 2));
    
    // Ensure all fields have default values to prevent undefined errors
    const {
      workerName = '',
      jobTitle = '',
      socCode = '',
      assignmentDate = '',
      cosDuties = '',
      jobDescriptionDuties = '',
      cvSummary = 'No CV summary provided',
      referenceSummary = 'No reference summary provided',
      employmentEvidenceSummary = 'No employment evidence provided',
      missingDocs = 'No missing documents specified',
      inconsistencies = 'No inconsistencies identified',
      experienceConcerns = 'No experience concerns identified',
      isCompliant = false,
      customPrompt = null, // New field for tenant-specific prompts
    } = body || {};

    // Provide default values for required fields if they're undefined
    const safeWorkerName = workerName || 'Unknown Worker';
    const safeJobTitle = jobTitle || 'Unknown Role';
    const safeSocCode = socCode || 'Unknown SOC';
    const safeAssignmentDate = assignmentDate || 'Unknown Date';
    const safeCosDuties = cosDuties || 'No CoS duties provided';
    const safeJobDescriptionDuties = jobDescriptionDuties || 'No job description duties provided';

    console.log('🔍 [API] Extracted workerName:', safeWorkerName);
    console.log('🔍 [API] Extracted jobTitle:', safeJobTitle);
    console.log('🔍 [API] Custom prompt provided:', !!customPrompt);

    // Validate required fields with better error messages
    if (!safeWorkerName || safeWorkerName.trim() === '' || safeWorkerName === 'Unknown Worker') {
      console.error('❌ [API] Worker name validation failed:', { safeWorkerName, body });
      return NextResponse.json({ 
        error: 'Worker name is required and cannot be empty',
        receivedData: { workerName: safeWorkerName, bodyKeys: Object.keys(body) }
      }, { status: 400 });
    }

    // Create narrative input object for the service
    const narrativeInput = {
      workerName: safeWorkerName,
      cosReference: body.cosReference || 'N/A',
      assignmentDate: safeAssignmentDate,
      jobTitle: safeJobTitle,
      socCode: safeSocCode,
      cosDuties: safeCosDuties,
      jobDescriptionDuties: safeJobDescriptionDuties,
      step1Pass: body.step1Pass ?? true,
      step2Pass: body.step2Pass ?? true,
      step3Pass: body.step3Pass ?? true,
      step4Pass: body.step4Pass ?? true,
      step5Pass: body.step5Pass ?? true,
      hasJobDescription: body.hasJobDescription ?? true,
      hasCV: body.hasCV ?? true,
      hasReferences: body.hasReferences ?? true,
      hasContracts: body.hasContracts ?? true,
      hasPayslips: body.hasPayslips ?? true,
      hasTraining: body.hasTraining ?? true,
      employmentHistoryConsistent: body.employmentHistoryConsistent ?? true,
      experienceMatchesDuties: body.experienceMatchesDuties ?? true,
      referencesCredible: body.referencesCredible ?? true,
      experienceRecentAndContinuous: body.experienceRecentAndContinuous ?? true,
      inconsistenciesDescription: body.inconsistenciesDescription || '',
      missingDocs: Array.isArray(body.missingDocs) ? body.missingDocs : (body.missingDocs ? [body.missingDocs] : []),
      isCompliant: isCompliant,
      riskLevel: body.riskLevel || 'LOW',
      evidenceStatus: body.evidenceStatus || '',
      breachType: body.breachType || '',
      compliance_score: body.compliance_score ?? 100,
      risk_score: body.risk_score ?? 0,
      compliance_status: body.compliance_status || (isCompliant ? 'COMPLIANT' : 'SERIOUS_BREACH'),
      agentType: body.agentType || 'skills-experience', // Add the missing agentType field
    };

    console.log('🤖 [API] Calling NarrativeGenerationService with workerName:', safeWorkerName);
    console.log('🤖 [API] Using custom prompt:', !!customPrompt);
    
    // Use the NarrativeGenerationService
    const { narrative: output, audit } = await NarrativeGenerationService.generateNarrative(narrativeInput);

    // Strict validation to avoid placeholders
    if (!output || output.includes('[') || output.includes('Letterhead') || output.includes('Recipient')) {
      throw new Error('AI returned placeholder or invalid narrative.');
    }

    // Track narrative generation metric
    try {
      await trackNarrativeGeneration();
      console.log('📊 [API] Tracked narrative generation metric');
    } catch (trackingError) {
      console.warn('⚠️ [API] Failed to track narrative generation metric:', trackingError);
      // Don't fail the request if tracking fails
    }

    // Log audit event for narrative generation
    try {
      await logAuditEvent(
        'narrative_generated',
        {
          worker_name: safeWorkerName,
          job_title: safeJobTitle,
          soc_code: safeSocCode,
          narrative_length: output.length,
          is_compliant: isCompliant,
          custom_prompt_used: !!customPrompt
        },
        'worker',
        safeWorkerName,
        undefined,
        { narrative_length: output.length },
        headersList
      );
      console.log('📝 [API] Logged narrative generation audit event');
    } catch (auditError) {
      console.warn('⚠️ [API] Failed to log narrative generation audit event:', auditError);
      // Don't fail the request if audit logging fails
    }

    console.log('✅ [API] Narrative generated successfully for worker:', safeWorkerName);
    console.log('✅ [API] Custom prompt used:', !!customPrompt);

    return NextResponse.json({ narrative: output });
  } catch (error: any) {
    console.error('❌ [API] Narrative generation error:', error);
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