# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Complians is a UK immigration compliance platform built as a full-stack Next.js SaaS application. It helps UK sponsors manage immigration compliance through AI-powered assessments, multi-tenant architecture, and comprehensive audit logging.

## Essential Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
```

### Database
```bash
npm run db:generate-types  # Generate TypeScript types from Supabase schema
```

### Deployment
```bash
npm run deploy          # Deploy to Vercel production
npm run deploy:preview  # Deploy to Vercel preview
```

### Testing
Currently no unit test framework is configured. The test script returns a placeholder:
```bash
npm run test  # Outputs "Tests coming soon"
```

Manual integration tests exist as standalone scripts (e.g., `test-billing.mjs`, `test-auth-improvements.mjs`).

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), NextAuth.js
- **AI Integration**: OpenAI GPT-4 (primary), with support for Anthropic/Google/Together AI
- **Payments**: Stripe (subscriptions and one-time payments)
- **Email**: Resend and SendGrid
- **Deployment**: Vercel

### Key Architectural Patterns

1. **Multi-Tenant SaaS Architecture**
   - Tenant isolation at database level
   - Configurable AI behavior per tenant
   - Role-based access control (Admin, Manager, Auditor, Viewer)

2. **AI Service Layer**
   - `narrativeGenerationService.ts`: Main orchestrator for AI compliance narratives
   - `aiNarrativeService.ts`: Direct AI model integration (OpenAI GPT-4)
   - `ai-compliance-service.ts`: High-level compliance business logic
   - Multi-model support with fallback strategies

3. **Compliance Domains**
   - 16+ specialized compliance areas (skills, salary, documents, etc.)
   - Each domain has dedicated prompts in `/src/lib/prompts/`
   - Agent-based architecture for specialized compliance checks

4. **Authentication & Security**
   - Magic link authentication via NextAuth.js
   - Row-level security in Supabase
   - API key authentication for external access
   - Secure file downloads with signed URLs

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (auth, billing, workers, AI services)
│   ├── auth/              # Authentication pages
│   └── [compliance modules] # Various AI-powered compliance dashboards
├── components/            
│   ├── ui/                # Reusable UI components (Radix UI based)
│   └── [feature components] # Business logic components
├── lib/                   
│   ├── prompts/           # AI prompt templates for each compliance domain
│   ├── *Service.ts        # Service layer (AI, billing, auth, etc.)
│   └── supabase*.ts       # Database clients
└── types/                 # TypeScript definitions
```

### Database Schema

Key tables include:
- `profiles`: User profiles with multi-tenant support
- `workers`: Immigration worker records
- `assessments`: AI compliance assessments
- `purchases`: E-commerce transactions
- `tenant_*`: Multi-tenant configuration tables
- `audit_logs`: Comprehensive audit trail

### AI Integration Details

1. **Primary AI Provider**: OpenAI GPT-4
   - Configure via `OPENAI_API_KEY` in `.env.local`
   - Fallback models: GPT-4 Turbo, GPT-3.5 Turbo

2. **Prompt Management**
   - Domain-specific prompts in `/src/lib/prompts/`
   - Each prompt includes UK legal references
   - Structured output requirements
   - Customizable styles via `/src/lib/ai-style-config.ts`

3. **Multi-Model Architecture**
   - Different models for different tasks (extraction, matching, assessment)
   - Ensemble voting for critical decisions
   - A/B testing framework built-in

4. **Skills & Experience Agent Implementation** (NEW - January 2025)
   - **Simple AI Service**: `/src/lib/simple-ai-service.ts` - Direct OpenAI integration
   - **API Endpoint**: `/api/generate-narrative-v2` - No authentication required
   - **Manual Worker Form**: Pre-filled form for data confirmation/correction
   - **Customizable Narratives**: Plain English style configurable in `ai-style-config.ts`
   - **Fallback Logic**: Template-based narratives when AI fails

### API Endpoints

Key API routes:
- `/api/auth/*`: Authentication flows
- `/api/billing/*`: Stripe integration
- `/api/workers/*`: Worker management
- `/api/generate-narrative`: AI narrative generation
- `/api/compliance/*`: Various compliance endpoints
- `/api/tenants/*`: Multi-tenant management

### Development Best Practices

1. **State Management**: Use React Query for server state
2. **Styling**: Tailwind CSS with consistent color scheme (#263976 primary)
3. **Components**: Prefer shadcn/ui components in `/components/ui`
4. **Error Handling**: Comprehensive try-catch with user-friendly messages
5. **Type Safety**: Strict TypeScript usage throughout

### Environment Variables

Critical environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXTAUTH_SECRET`
- `RESEND_API_KEY`

### Common Development Tasks

1. **Adding a new compliance domain**:
   - Create prompt in `/src/lib/prompts/`
   - Add agent type to `narrativeGenerationService.ts`
   - Create UI component in `/src/components/`

2. **Modifying AI behavior**:
   - Update prompts in `/src/lib/prompts/`
   - Adjust model selection in `aiNarrativeService.ts`
   - Configure tenant-specific settings via `multi-tenant-service.ts`
   - For simple implementations, use `simple-ai-service.ts` pattern

3. **Working with the database**:
   - Run migrations in numerical order from root directory
   - Update types with `npm run db:generate-types`
   - Use Supabase client from `/src/lib/supabase-client.ts`

4. **Handling Authentication Issues**:
   - If auth blocks AI generation, use `simple-ai-service.ts` pattern
   - Create new API endpoints without auth checks (e.g., `/api/generate-narrative-v2`)
   - Use `DISABLE_AUTH=true` environment variable for development

5. **Customizing AI Narratives**:
   - Edit `/src/lib/ai-style-config.ts` for tone and format
   - Update prompts in `/src/lib/prompts/improved-skills-prompt.ts`
   - See `AI_CUSTOMIZATION_GUIDE.md` for detailed instructions

### Deployment Notes

- ESLint errors are ignored during builds (`ignoreDuringBuilds: true`)
- Webpack configured to exclude `fs` module
- Images served from localhost domain
- Vercel deployment with automatic SSL

### Security Considerations

- Never commit API keys or secrets
- Use environment variables for all sensitive data
- Implement proper authentication checks in API routes
- Validate all user inputs before AI processing
- Use Supabase RLS policies for data access control

### Troubleshooting Common Issues

1. **AI Narrative Generation Not Working**:
   - Check `OPENAI_API_KEY` is set in environment variables
   - Verify authentication isn't blocking the request
   - Use `/api/generate-narrative-v2` endpoint if auth issues persist
   - Check browser console for 401/403 errors

2. **Worker Data Showing as "Unknown"**:
   - Manual worker form will appear after document upload
   - Users can confirm/edit extracted information
   - All fields marked with * are required
   - Job Title should match exactly as stated in CoS

3. **Environment Variables Not Loading**:
   - Ensure `.env.local` file exists in root directory
   - Restart dev server after adding new variables
   - In Vercel, add variables without quotes
   - Use `DISABLE_AUTH=true` (not `"true"`) in Vercel