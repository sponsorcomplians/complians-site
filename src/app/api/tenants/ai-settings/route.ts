import { NextRequest, NextResponse } from 'next/server';
import { getTenantAIConfig, updateTenantAIConfig, getDefaultAISettings } from '@/lib/multi-tenant-service';
import { TenantSettings } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const aiConfig = await getTenantAIConfig();
    
    return NextResponse.json({
      success: true,
      ai_config: aiConfig
    });

  } catch (error) {
    console.error('Error getting AI config:', error);
    return NextResponse.json(
      { error: 'Failed to get AI configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings: Partial<TenantSettings> = await request.json();

    // Validate required fields
    if (!settings) {
      return NextResponse.json(
        { error: 'Settings are required' },
        { status: 400 }
      );
    }

    // Validate AI tone
    if (settings.ai_tone && !['strict', 'moderate', 'lenient'].includes(settings.ai_tone)) {
      return NextResponse.json(
        { error: 'Invalid AI tone. Must be one of: strict, moderate, lenient' },
        { status: 400 }
      );
    }

    // Validate risk tolerance
    if (settings.risk_tolerance && !['low', 'medium', 'high'].includes(settings.risk_tolerance)) {
      return NextResponse.json(
        { error: 'Invalid risk tolerance. Must be one of: low, medium, high' },
        { status: 400 }
      );
    }

    // Validate narrative style
    if (settings.narrative_style && !['formal', 'professional', 'conversational'].includes(settings.narrative_style)) {
      return NextResponse.json(
        { error: 'Invalid narrative style. Must be one of: formal, professional, conversational' },
        { status: 400 }
      );
    }

    // Validate compliance strictness
    if (settings.compliance_strictness && !['high', 'medium', 'low'].includes(settings.compliance_strictness)) {
      return NextResponse.json(
        { error: 'Invalid compliance strictness. Must be one of: high, medium, low' },
        { status: 400 }
      );
    }

    // Update the AI configuration
    const updatedConfig = await updateTenantAIConfig(settings);

    return NextResponse.json({
      success: true,
      ai_config: updatedConfig,
      message: 'AI configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating AI config:', error);
    return NextResponse.json(
      { error: 'Failed to update AI configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { reset } = await request.json();

    if (reset) {
      // Reset to default settings
      const defaultSettings = getDefaultAISettings();
      const updatedConfig = await updateTenantAIConfig(defaultSettings);

      return NextResponse.json({
        success: true,
        ai_config: updatedConfig,
        message: 'AI configuration reset to defaults'
      });
    }

    return NextResponse.json(
      { error: 'Invalid request. Use reset: true to reset to defaults' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error resetting AI config:', error);
    return NextResponse.json(
      { error: 'Failed to reset AI configuration' },
      { status: 500 }
    );
  }
} 