# AI Narrative Generation Setup Guide

## Quick Fix for Skills & Experience Compliance Agent

The AI narrative generation is currently falling back to template logic because the OpenAI API key is not configured. Here's how to fix it:

### 1. Configure OpenAI API Key

Add the following to your `.env.local` file:

```bash
# OpenAI Configuration (Required for AI narrative generation)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Enable development mode (disables auth checks)
DISABLE_AUTH=true

# Optional: API Keys for production
NEXT_PUBLIC_API_KEY=your-public-api-key
API_SECRET_KEY=your-secret-api-key
```

### 2. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 3. Verify Configuration

After setting up your environment variables:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Check configuration (in development only):
   ```bash
   curl http://localhost:3000/api/check-config
   ```

   You should see:
   - `openai.hasApiKey: true`
   - Recommendations should include "✅ Configuration looks good"

### 4. Test AI Generation

1. Go to the Skills & Experience Compliance Agent
2. Upload test documents
3. Click "Analyze Documents"
4. Check browser console for logs:
   - Look for `[SkillsExperienceComp] Narrative successfully generated via AI`
   - Should NOT see fallback template being used

### Troubleshooting

#### Error: "AI service not configured"
- Ensure `OPENAI_API_KEY` is set in `.env.local`
- Restart the development server

#### Error: "401 Unauthorized"
- If `DISABLE_AUTH=false`, ensure you have valid API keys configured
- For development, set `DISABLE_AUTH=true`

#### Error: "429 Rate Limit"
- Check your OpenAI usage limits
- Implement caching to reduce API calls

### What I've Fixed

1. **Enhanced Error Logging**: Added detailed logging throughout the API route
2. **Better Error Messages**: User-friendly toast notifications for different error types
3. **Configuration Check**: Created `/api/check-config` endpoint for debugging
4. **Model Update**: Changed from `gpt-4-turbo-preview` to `gpt-4-turbo`
5. **Auth Flexibility**: Added support for development mode without auth

### Production Considerations

For production deployment:

1. **Remove `DISABLE_AUTH=true`** from environment
2. **Set proper API keys** for authentication
3. **Use environment variables** from your hosting provider (Vercel, etc.)
4. **Implement rate limiting** to prevent abuse
5. **Add caching** to reduce API costs

### Cost Optimization

To reduce OpenAI API costs:

1. Implement response caching (already prepared in codebase)
2. Use `gpt-3.5-turbo` for less critical assessments
3. Batch similar requests
4. Set up usage monitoring and alerts

### Next Steps

Once the OpenAI API key is configured, the Skills & Experience Compliance Agent will:
- Generate professional, context-aware compliance assessments
- Analyze uploaded documents intelligently
- Provide detailed, legally-compliant narratives
- Stop falling back to template-based responses