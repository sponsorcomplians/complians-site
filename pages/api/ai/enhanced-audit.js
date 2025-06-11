/**
 * Enhanced Audit API Endpoint
 * Integrates multi-LLM processing with existing sponsorcomplians.co.uk platform
 */

import { MultiLLMOrchestrator } from '../../../lib/ai/llm-clients';
import formidable from 'formidable';
import fs from 'fs';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse uploaded files
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const uploadedFiles = Array.isArray(files.documents) ? files.documents : [files.documents];
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No documents uploaded' });
    }

    // Extract text from documents
    const documents = await Promise.all(
      uploadedFiles.map(async (file) => {
        const buffer = fs.readFileSync(file.filepath);
        let content = '';
        
        if (file.mimetype === 'application/pdf') {
          const pdfData = await pdf(buffer);
          content = pdfData.text;
        } else {
          content = buffer.toString('utf-8');
        }

        return {
          filename: file.originalFilename,
          content: content,
          mimetype: file.mimetype,
          size: file.size
        };
      })
    );

    // Initialize multi-LLM orchestrator
    const orchestrator = new MultiLLMOrchestrator();
    
    // Process with enhanced AI analysis
    const auditType = fields.auditType?.[0] || 'salary-compliance';
    const enhancedResults = await orchestrator.processEnhancedAudit(documents, auditType);

    // Return results
    res.status(200).json({
      success: true,
      enhanced_results: enhancedResults,
      message: enhancedResults.success 
        ? 'Enhanced AI audit completed successfully!' 
        : 'Enhanced AI audit failed, but standard processing available.'
    });

  } catch (error) {
    console.error('Enhanced audit API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Enhanced AI audit failed. Standard audit processing can continue.'
    });
  }
}
