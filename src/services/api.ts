import type { ProcessInvoiceResponse } from '@/types';
import { supabase } from './supabase';

// MCP Architecture v2 - Invoice Processor Webhook
// Fixed workflow - properly sends PDF to Claude's Vision API
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/invoice-mcp-v2';

export async function processInvoice(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ProcessInvoiceResponse> {
  onProgress?.(10);

  // Convert file to base64
  const base64 = await fileToBase64(file);

  onProgress?.(30);

  // Upload file to Supabase Storage
  let fileUrl: string | null = null;
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, file);

    if (!uploadError && uploadData) {
      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(uploadData.path);
      fileUrl = urlData.publicUrl;
    }
  } catch (e) {
    console.warn('File upload to storage failed, continuing without file URL:', e);
  }

  onProgress?.(40);

  // Send to n8n for AI processing
  let extractedData: Record<string, unknown> | null = null;
  let n8nResponse: Record<string, unknown> | null = null;

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        file_base64: base64,
        mime_type: file.type,
        filename: file.name,
        source: 'dashboard',
      }),
    });

    if (response.ok) {
      n8nResponse = await response.json();
      extractedData = n8nResponse?.extracted_data as Record<string, unknown> || n8nResponse;
    }
  } catch (e) {
    console.warn('n8n processing failed, storing invoice without extraction:', e);
  }

  onProgress?.(100);

  // n8n handles saving to Supabase, just return the response
  if (n8nResponse) {
    return {
      success: true,
      message: 'Invoice processed and stored successfully',
      invoice_id: (n8nResponse.id as string) || undefined,
      extracted_data: extractedData,
      data: {
        invoice_number: extractedData?.invoice_number as string,
        line_items_count: (extractedData?.line_items as unknown[])?.length || 0,
        confidence: Math.round((extractedData?.confidence as number || 0.95) * 100),
      },
    } as ProcessInvoiceResponse;
  }

  // If n8n failed, throw error (don't create duplicate record)
  throw new Error('Invoice processing failed - n8n did not respond');
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a PDF, PNG, or JPG file.',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  return { valid: true };
}
