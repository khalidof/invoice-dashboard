import type { ProcessInvoiceResponse } from '@/types';
import { invoiceService, supabase } from './supabase';

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

  onProgress?.(70);

  // Store invoice in Supabase (regardless of n8n result)
  try {
    // Extract vendor info - handle both nested and flat structures
    const vendorData = extractedData?.vendor as Record<string, unknown> | undefined;
    const vendorName = vendorData?.name as string | undefined
      || extractedData?.vendor_name as string | undefined;

    const invoice = await invoiceService.create({
      invoice_number: (extractedData?.invoice_number as string) || undefined,
      vendor_name: vendorName,
      invoice_date: (extractedData?.invoice_date as string) || undefined,
      due_date: (extractedData?.due_date as string) || undefined,
      total_amount: (extractedData?.total as number) || (extractedData?.total_amount as number) || undefined,
      currency: (extractedData?.currency as string) || 'USD',
      status: extractedData ? 'processed' : 'pending',
      file_url: fileUrl || undefined,
      file_name: file.name,
      extracted_data: extractedData || undefined,
      confidence: (extractedData?.confidence as number) || undefined,
      flags: [],
    });

    // Store line items if available
    const lineItems = extractedData?.line_items as Array<{
      description?: string;
      quantity?: number;
      unit_price?: number;
      amount?: number;
    }> || [];

    if (lineItems.length > 0) {
      await invoiceService.createLineItems(
        invoice.id,
        lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.amount,
        }))
      );
    }

    onProgress?.(100);

    return {
      success: true,
      message: 'Invoice processed and stored successfully',
      invoice_id: invoice.id,
      extracted_data: extractedData,
    } as ProcessInvoiceResponse;
  } catch (e) {
    console.error('Failed to store invoice in Supabase:', e);
    throw new Error(`Failed to store invoice: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
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
