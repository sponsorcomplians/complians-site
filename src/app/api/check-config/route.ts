import { NextResponse } from 'next/server';

// Configuration check endpoint for debugging AI setup
export async function GET() {
  // Check if we should show full details or just status
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DISABLE_AUTH === 'true';
  
  if (!isDevelopment) {
    // In production, just return basic status
    return NextResponse.json({
      status: 'ok',
      ai: {
        configured: !!process.env.OPENAI_API_KEY
      },
      message: process.env.OPENAI_API_KEY 
        ? '✅ AI service is configured' 
        : '⚠️ AI service not configured - narratives will use templates'
    }, { status: 200 });
  }

  const config = {
    environment: process.env.NODE_ENV || 'not set',
    auth: {
      disableAuth: process.env.DISABLE_AUTH === 'true',
      hasPublicApiKey: !!process.env.NEXT_PUBLIC_API_KEY,
      hasSecretApiKey: !!process.env.API_SECRET_KEY,
      publicApiKeyLength: process.env.NEXT_PUBLIC_API_KEY?.length || 0,
      secretApiKeyLength: process.env.API_SECRET_KEY?.length || 0,
    },
    openai: {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      apiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'not set',
    },
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    recommendations: [] as string[]
  };

  // Add recommendations
  if (!config.openai.hasApiKey) {
    config.recommendations.push('⚠️ OPENAI_API_KEY is not set - AI narrative generation will fail');
  }
  
  if (!config.auth.disableAuth && !config.auth.hasPublicApiKey && !config.auth.hasSecretApiKey) {
    config.recommendations.push('⚠️ No API keys configured and DISABLE_AUTH is false - API authentication will fail');
  }

  if (config.auth.disableAuth) {
    config.recommendations.push('⚠️ DISABLE_AUTH is true - API endpoints are not protected (development only)');
  }

  if (config.recommendations.length === 0) {
    config.recommendations.push('✅ Configuration looks good for AI narrative generation');
  }

  return NextResponse.json(config, { status: 200 });
}