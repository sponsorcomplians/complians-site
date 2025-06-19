import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Worker, WorkerDocument, WorkerTraining, WorkerNote } from '@/types/worker';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get worker details
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (workerError) {
      return NextResponse.json({ error: workerError.message }, { status: 404 });
    }
    
    // Get worker documents
    const { data: documents, error: docsError } = await supabase
      .from('worker_documents')
      .select('*')
      .eq('worker_id', params.id)
      .order('document_code');
    
    // Get worker training
    const { data: training, error: trainingError } = await supabase
      .from('worker_training')
      .select('*')
      .eq('worker_id', params.id)
      .order('module_code');
    
    // Get worker notes
    const { data: notes, error: notesError } = await supabase
      .from('worker_notes')
      .select('*')
      .eq('worker_id', params.id)
      .order('created_at', { ascending: false });
    
    return NextResponse.json({
      worker,
      documents: documents || [],
      training: training || [],
      notes: notes || []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    // Add new note
    if (body.note) {
      const { data, error } = await supabase
        .from('worker_notes')
        .insert({
          worker_id: params.id,
          note_type: body.note.noteType,
          note_content: body.note.noteContent,
          created_by: body.note.createdBy || 'System'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ note: data });
    }

    // ✅ this return goes inside the POST block, NOT after
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
