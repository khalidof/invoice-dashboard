# Invoice Processing System - Product Requirements Document (PRD)

**Version:** 2.0
**Last Updated:** February 3, 2026
**Author:** Product Team
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Current Architecture](#3-current-architecture)
4. [Technical Stack](#4-technical-stack)
5. [Data Models](#5-data-models)
6. [User Stories & Requirements](#6-user-stories--requirements)
7. [API Specifications](#7-api-specifications)
8. [n8n Workflow Specifications](#8-n8n-workflow-specifications)
9. [MCP Architecture Guidelines](#9-mcp-architecture-guidelines)
10. [Future Enhancements](#10-future-enhancements)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Deployment Guide](#12-deployment-guide)
13. [Testing Strategy](#13-testing-strategy)
14. [MCP Implementation Guide](#14-mcp-implementation-guide)
15. [Appendix](#15-appendix)

---

## 1. Executive Summary

### 1.1 Purpose

The Invoice Processing System is an AI-powered application designed to automate the extraction, validation, and management of invoice data. The system leverages Claude AI (Anthropic) for intelligent document processing and provides a modern React dashboard for invoice management.

### 1.2 Business Objectives

| Objective | Description | Success Metric |
|-----------|-------------|----------------|
| Reduce manual data entry | Automate invoice field extraction | 90% extraction accuracy |
| Accelerate processing time | AI-powered instant processing | < 5 seconds per invoice |
| Improve data quality | Structured validation and confidence scoring | < 2% error rate |
| Enable scalability | Support growing invoice volumes | 1000+ invoices/day capacity |

### 1.3 Key Features

- **AI-Powered Extraction**: Automatic extraction of invoice fields using Claude Vision
- **Multi-Format Support**: PDF, PNG, JPG invoice uploads
- **Real-Time Processing**: Instant webhook-based processing via n8n
- **Dashboard Analytics**: Visual insights into invoice metrics and vendor spend
- **Status Workflow**: Pending → Processed → Approved → Paid pipeline

---

## 2. System Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
│                         React Dashboard (Vite)                               │
│                      http://localhost:5173                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │   Upload     │ │    Read      │ │   Update     │
            │   Invoice    │ │   Invoices   │ │   Status     │
            └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                   │                │               │
                   ▼                ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE                                        │
│                   https://uaixxcarczvtysifgpnz.supabase.co                   │
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │   Storage   │  │   invoices table    │  │ invoice_line_items  │          │
│  │  (files)    │  │   (main data)       │  │     (details)       │          │
│  └─────────────┘  └─────────────────────┘  └─────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │       WEBHOOK TRIGGER         │
                    ▼                               │
┌─────────────────────────────────────────────────────────────────────────────┐
│                              n8n WORKFLOW                                    │
│                         http://localhost:5678                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Webhook   │─▶│Prepare Data │─▶│HTTP Request │─▶│ Parse JSON  │        │
│  │   (POST)    │  │ (Code Node) │  │ (Anthropic) │  │ (Code Node) │        │
│  └─────────────┘  └─────────────┘  └──────┬──────┘  └──────┬──────┘        │
│                                           │                │                │
│                                           ▼                ▼                │
│                                    ┌─────────────┐  ┌─────────────┐        │
│                                    │  Anthropic  │  │  Supabase   │        │
│                                    │  Claude API │  │  (UPDATE)   │        │
│                                    └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
1. USER UPLOADS INVOICE
   └─▶ Frontend converts to Base64
       └─▶ Frontend uploads file to Supabase Storage
           └─▶ Frontend creates initial record in Supabase (file_name, file_url, status='pending')
               └─▶ Frontend sends Base64 + filename to n8n Webhook

2. N8N PROCESSES INVOICE
   └─▶ Webhook receives payload
       └─▶ AI Agent extracts fields using Claude Vision
           └─▶ Parse JSON structures the output
               └─▶ Supabase node UPDATES the existing record (matching by file_name)

3. USER VIEWS RESULTS
   └─▶ Frontend queries Supabase
       └─▶ Displays extracted data in dashboard
```

---

## 3. Current Architecture

### 3.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Pages:                          │  Components:                             │
│  ├── Dashboard.tsx               │  ├── layout/                             │
│  ├── InvoiceList.tsx             │  │   ├── MainLayout.tsx                  │
│  ├── InvoiceDetail.tsx           │  │   ├── Sidebar.tsx                     │
│  ├── Upload.tsx                  │  │   ├── Header.tsx                      │
│  └── Settings.tsx                │  │   └── PageContainer.tsx               │
│                                  │  ├── dashboard/                          │
│  Services:                       │  │   ├── StatsCard.tsx                   │
│  ├── api.ts (n8n webhook)        │  │   ├── RecentInvoices.tsx              │
│  └── supabase.ts (database)      │  │   ├── ProcessingQueue.tsx             │
│                                  │  │   └── SpendByVendor.tsx               │
│  Types:                          │  └── invoices/                           │
│  ├── invoice.ts                  │      ├── InvoiceTable.tsx                │
│  └── api.ts                      │      ├── InvoiceUploader.tsx             │
│                                  │      ├── InvoiceStatusBadge.tsx          │
│                                  │      ├── LineItemsTable.tsx              │
│                                  │      └── ExtractionResult.tsx            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           n8n WORKFLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Workflow: Invoice Processor v2 (MCP Architecture)                          │
│  URL: http://localhost:5678/workflow/dILMjCHvByghIv70                       │
│                                                                             │
│  Nodes:                                                                     │
│  1. Webhook (POST /webhook/invoice-mcp-v2)                                  │
│     └── Receives: { file_base64, mime_type, filename, source }              │
│                                                                             │
│  2. Prepare Data (Code Node)                                                │
│     └── Formats: Anthropic API request with base64 document/image           │
│     └── Outputs: { model, max_tokens, messages, filename }                  │
│                                                                             │
│  3. HTTP Request (POST to Anthropic API)                                    │
│     └── URL: https://api.anthropic.com/v1/messages                          │
│     └── Extracts: invoice_number, vendor_name, dates, amounts, line_items   │
│                                                                             │
│  4. Parse JSON (Code Node)                                                  │
│     └── Cleans: Claude response, removes markdown, validates dates          │
│     └── Outputs: Flat object with all invoice fields                        │
│                                                                             │
│  5. Save to Supabase (UPDATE operation)                                     │
│     └── Matches: WHERE file_name = $json.filename                           │
│     └── Updates: invoice_number, vendor_name, total_amount, etc.            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Project: Invoice MCP                                                        │
│  URL: https://uaixxcarczvtysifgpnz.supabase.co                              │
│                                                                             │
│  Tables:                                                                    │
│  ├── invoices (main invoice records)                                        │
│  └── invoice_line_items (line item details)                                 │
│                                                                             │
│  Storage:                                                                   │
│  └── invoices bucket (PDF/image files)                                      │
│                                                                             │
│  Security:                                                                  │
│  └── RLS enabled with "Allow all access to invoices" policy                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Critical Configuration Points

#### 3.2.1 Environment Variables (.env)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://uaixxcarczvtysifgpnz.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# n8n Webhook URL
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/invoice-mcp-v2
```

#### 3.2.2 n8n Credentials (CRITICAL)

```yaml
Credential Name: mcp INVOICE
Type: Supabase API
Host: https://uaixxcarczvtysifgpnz.supabase.co  # MUST match frontend
Service Role Secret: <service-role-key>  # From Supabase Project Settings > API
```

> **WARNING**: If the n8n Supabase Host URL doesn't match the frontend Supabase URL,
> the UPDATE operation will fail silently (different databases).

---

## 4. Technical Stack

### 4.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| Vite | 7.2.4 | Build Tool |
| TypeScript | 5.9.3 | Type Safety |
| TailwindCSS | 4.1.18 | Styling |
| TanStack Query | 5.90.19 | Server State Management |
| React Router | 7.12.0 | Routing |
| Recharts | 3.6.0 | Data Visualization |
| Lucide React | 0.562.0 | Icons |
| React Dropzone | 14.3.8 | File Upload |

### 4.2 Backend Services

| Service | Purpose | URL |
|---------|---------|-----|
| Supabase | Database + Storage + Auth | https://uaixxcarczvtysifgpnz.supabase.co |
| n8n | Workflow Automation | http://localhost:5678 |
| Anthropic API | AI Processing (Claude) | https://api.anthropic.com |

### 4.3 n8n Workflow

| Node | Type | Configuration |
|------|------|---------------|
| Webhook | Trigger | POST /webhook/invoice-mcp-v2 |
| Prepare Data | Code Node | Formats Anthropic API request with base64 document |
| HTTP Request | HTTP Request | POST to https://api.anthropic.com/v1/messages |
| Parse JSON | Code Node | Cleans response, validates dates, outputs flat object |
| Save to Supabase | Supabase Node | UPDATE operation, match by file_name |

---

## 5. Data Models

### 5.1 Invoice Table Schema

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT,
    vendor_name TEXT,
    invoice_date DATE,
    due_date DATE,
    total_amount NUMERIC,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'approved', 'paid', 'rejected')),
    file_url TEXT,
    file_name TEXT,
    extracted_data JSONB,
    confidence NUMERIC,
    matched_po TEXT,
    flags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Invoice Line Items Table Schema

```sql
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT,
    quantity NUMERIC,
    unit_price NUMERIC,
    total NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 TypeScript Interfaces

```typescript
// Invoice Status Workflow
type InvoiceStatus = 'pending' | 'processed' | 'approved' | 'paid' | 'rejected';

// Main Invoice Interface
interface Invoice {
    id: string;
    invoice_number: string | null;
    vendor_name: string | null;
    invoice_date: string | null;
    due_date: string | null;
    total_amount: number | null;
    currency: string;
    status: InvoiceStatus;
    file_url: string | null;
    file_name: string | null;
    extracted_data: ExtractedData | null;
    confidence: number | null;
    matched_po: string | null;
    flags: string[];
    created_at: string;
    updated_at: string;
    uploaded_at: string;
}

// AI Extraction Result
interface ExtractedData {
    vendor: {
        name: string;
        address?: string;
        email?: string;
        phone?: string;
    };
    bill_to?: {
        name: string;
        address?: string;
    };
    invoice_number: string;
    invoice_date: string;
    due_date?: string;
    payment_terms?: string;
    line_items: LineItem[];
    subtotal: number;
    tax_rate?: number;
    tax_amount?: number;
    discount?: number;
    total: number;
    currency: string;
    notes?: string;
    payment_info?: {
        bank?: string;
        account?: string;
        routing?: string;
    };
}

// Line Item Detail
interface LineItem {
    id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}
```

### 5.4 n8n Data Flow

```
1. WEBHOOK INPUT:
{
    "body": {
        "file_base64": "JVBERi0xLjQKJeLjz9...",
        "mime_type": "application/pdf",
        "filename": "invoice-techpro-001.pdf",
        "source": "dashboard"
    }
}

2. PREPARE DATA OUTPUT (Anthropic API Request):
{
    "filename": "invoice-techpro-001.pdf",
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 4096,
    "messages": [{
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": "JVBERi0xLjQKJeLjz9..."
                }
            },
            {
                "type": "text",
                "text": "Extract these fields from the invoice..."
            }
        ]
    }]
}

3. HTTP REQUEST (Anthropic API Response):
{
    "content": [{
        "type": "text",
        "text": "{\"invoice_number\": \"INV-3337\", \"vendor_name\": \"Smith and Johnson Design Co.\", ...}"
    }],
    "model": "claude-sonnet-4-20250514",
    "stop_reason": "end_turn"
}

4. PARSE JSON OUTPUT (Cleaned & Validated):
{
    "filename": "invoice-techpro-001.pdf",
    "invoice_number": "INV-3337",
    "vendor_name": "Smith and Johnson Design Co.",
    "invoice_date": "2023-05-15",
    "due_date": "2023-06-14",
    "total_amount": 2500,
    "currency": "USD",
    "status": "processed",
    "confidence": 0.95
}

5. SUPABASE UPDATE:
WHERE file_name = 'invoice-techpro-001.pdf'
SET:
    invoice_number = $json.invoice_number
    vendor_name = $json.vendor_name
    total_amount = $json.total_amount
    ... (all fields)
```

---

## 6. User Stories & Requirements

### 6.1 Epic: Invoice Upload & Processing

#### US-001: Upload Invoice File
**As a** finance user
**I want to** upload invoice files (PDF, PNG, JPG)
**So that** they can be automatically processed

**Acceptance Criteria:**
- [ ] Drag-and-drop file upload interface
- [ ] Supported formats: PDF, PNG, JPG
- [ ] Maximum file size: 10MB
- [ ] Progress indicator during upload
- [ ] Error messages for invalid files

#### US-002: AI Extraction
**As a** system
**I want to** automatically extract invoice fields
**So that** users don't need to manually enter data

**Acceptance Criteria:**
- [ ] Extract: invoice_number, vendor_name, dates, amounts
- [ ] Extract: line items with description, quantity, unit_price
- [ ] Provide confidence score (0-1)
- [ ] Handle multiple invoice formats
- [ ] Process within 5 seconds

#### US-003: View Extraction Results
**As a** finance user
**I want to** see what data was extracted
**So that** I can verify accuracy

**Acceptance Criteria:**
- [ ] Display all extracted fields
- [ ] Show confidence score with visual indicator
- [ ] Highlight low-confidence fields
- [ ] Link to original file

### 6.2 Epic: Invoice Management

#### US-004: Invoice List View
**As a** finance user
**I want to** see all invoices in a list
**So that** I can manage them efficiently

**Acceptance Criteria:**
- [ ] Paginated table view (25 per page)
- [ ] Columns: Invoice #, Vendor, Date, Amount, Status
- [ ] Sort by any column
- [ ] Filter by status
- [ ] Search by invoice # or vendor name

#### US-005: Invoice Detail View
**As a** finance user
**I want to** view complete invoice details
**So that** I can review all information

**Acceptance Criteria:**
- [ ] Display all invoice fields
- [ ] Show line items table
- [ ] View original uploaded file
- [ ] Show extraction confidence
- [ ] Action buttons for status changes

#### US-006: Status Workflow
**As a** finance user
**I want to** update invoice status
**So that** I can track processing progress

**Acceptance Criteria:**
- [ ] Status options: Pending → Processed → Approved → Paid
- [ ] Reject option available at any stage
- [ ] Status change history (audit trail)
- [ ] Confirmation before status change

### 6.3 Epic: Dashboard & Analytics

#### US-007: Dashboard Overview
**As a** finance manager
**I want to** see key metrics at a glance
**So that** I can monitor invoice processing

**Acceptance Criteria:**
- [ ] Total invoices this month (with trend)
- [ ] Total amount processed
- [ ] Pending approval count
- [ ] Average processing time
- [ ] Recent invoices list
- [ ] Processing queue

#### US-008: Vendor Spend Analysis
**As a** finance manager
**I want to** see spending by vendor
**So that** I can analyze vendor relationships

**Acceptance Criteria:**
- [ ] Bar chart of top vendors by spend
- [ ] Time period filter
- [ ] Drill-down to vendor invoices

---

## 7. API Specifications

### 7.1 Frontend → n8n Webhook

**Endpoint:** `POST /webhook/invoice-mcp-v2`

**Request:**
```json
{
    "file_base64": "string (base64 encoded file content)",
    "mime_type": "string (application/pdf | image/png | image/jpeg)",
    "filename": "string (original filename)",
    "source": "string (dashboard)"
}
```

**Response:**
```json
{
    "message": "Workflow was started"
}
```

> Note: Processing is asynchronous. n8n updates Supabase directly.

### 7.2 Frontend → Supabase

#### Get All Invoices
```typescript
const { data, count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 24);
```

#### Get Invoice by ID
```typescript
const { data } = await supabase
    .from('invoices')
    .select(`*, line_items:invoice_line_items(*)`)
    .eq('id', invoiceId)
    .single();
```

#### Create Invoice (Initial)
```typescript
const { data } = await supabase
    .from('invoices')
    .insert({
        file_name: 'invoice.pdf',
        file_url: 'https://...',
        status: 'pending',
        currency: 'USD'
    })
    .select()
    .single();
```

#### Update Invoice Status
```typescript
const { data } = await supabase
    .from('invoices')
    .update({ status: 'approved' })
    .eq('id', invoiceId)
    .select()
    .single();
```

---

## 8. n8n Workflow Specifications

### 8.1 Workflow Configuration

**Workflow Name:** Invoice Processor v2 (MCP Architecture)
**Workflow ID:** dILMjCHvByghIv70
**Status:** Active (Published)

### 8.2 Workflow Architecture

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐    ┌─────────────────┐
│ Webhook  │───▶│ Prepare Data │───▶│ HTTP Request │───▶│ Parse JSON │───▶│ Save to Supabase│
│  (POST)  │    │  (Code Node) │    │ (Anthropic)  │    │(Code Node) │    │    (Update)     │
└──────────┘    └──────────────┘    └──────────────┘    └────────────┘    └─────────────────┘
```

### 8.3 Node Configurations

#### Node 1: Webhook
```yaml
Type: Webhook
HTTP Method: POST
Path: /webhook/invoice-mcp-v2
Response Mode: Immediately
Response Data: { "message": "Workflow was started" }
```

#### Node 2: Prepare Data (Code Node)
```yaml
Type: Code Node
Mode: Run Once for All Items
Language: JavaScript
```

```javascript
const input = $input.first().json;
const body = input.body || input;

const base64 = (body.file_base64 || '').replace(/^data:[^;]+;base64,/, '');
const mimeType = body.mime_type || 'application/pdf';
const filename = body.filename || 'invoice.pdf';

if (!base64 || base64.length === 0) {
  throw new Error("BASE64 IS EMPTY!");
}

const isImage = mimeType.startsWith('image/');

return [{
  json: {
    filename: filename,
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: [
        {
          type: isImage ? "image" : "document",
          source: {
            type: "base64",
            media_type: mimeType,
            data: base64
          }
        },
        {
          type: "text",
          text: "Extract these fields from the invoice and return ONLY valid JSON (no markdown, no code blocks): invoice_number, vendor_name, invoice_date (YYYY-MM-DD), due_date (YYYY-MM-DD), total_amount (number), currency, line_items (array with description, quantity, unit_price, amount), confidence (0-1)"
        }
      ]
    }]
  }
}];
```

#### Node 3: HTTP Request (Anthropic API)
```yaml
Type: HTTP Request
Method: POST
URL: https://api.anthropic.com/v1/messages
Authentication: Header Auth
  - Name: x-api-key
  - Value: {{ your Anthropic API key }}
Headers:
  - anthropic-version: 2023-06-01
Body Content Type: JSON
JSON Body: ={{ { "model": $json.model, "max_tokens": $json.max_tokens, "messages": $json.messages } }}
```

> **IMPORTANT**: Body Content Type MUST be `JSON`, NOT `Form Data`. Using Form Data will cause "Arrays are not supported" error.

#### Node 4: Parse JSON (Code Node)
```yaml
Type: Code Node
Mode: Run Once for Each Item
Language: JavaScript
```

```javascript
const response = $json;

if (response.error) {
  throw new Error('Claude Error: ' + response.error.message);
}

let text = response.content?.[0]?.text || '';
let clean = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

let data;
try {
  data = JSON.parse(clean);
} catch (e) {
  throw new Error('Failed to parse JSON: ' + clean.substring(0, 500));
}

const filename = $('Prepare Data').item.json.filename;

// Helper function to clean string values
function cleanString(val) {
  if (val === null || val === undefined) return null;
  const cleaned = String(val).trim();
  return cleaned === '' ? null : cleaned;
}

// Helper function to clean and validate dates
function cleanDate(val) {
  if (val === null || val === undefined) return null;
  const cleaned = String(val).trim();
  // Check if it looks like a valid date (YYYY-MM-DD)
  if (cleaned === '' || !/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return null;
  }
  return cleaned;
}

// Helper function to clean numbers
function cleanNumber(val) {
  if (val === null || val === undefined) return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

return {
  filename: filename,
  invoice_number: cleanString(data.invoice_number),
  vendor_name: cleanString(data.vendor_name),
  invoice_date: cleanDate(data.invoice_date),
  due_date: cleanDate(data.due_date),
  total_amount: cleanNumber(data.total_amount),
  currency: cleanString(data.currency) || 'USD',
  status: 'processed',
  confidence: cleanNumber(data.confidence)
};
```

#### Node 5: Save to Supabase
```yaml
Type: Supabase
Operation: Update
Table: invoices
Credential: mcp INVOICE (Host: https://uaixxcarczvtysifgpnz.supabase.co)

Select Conditions:
    - Field: file_name
    - Condition: Equals
    - Value: {{ $json.filename }}

Fields to Send:
    - invoice_number: {{ $json.invoice_number }}
    - vendor_name: {{ $json.vendor_name }}
    - invoice_date: {{ $json.invoice_date }}
    - due_date: {{ $json.due_date }}
    - total_amount: {{ $json.total_amount }}
    - currency: {{ $json.currency }}
    - status: {{ $json.status }}
    - confidence: {{ $json.confidence }}
```

### 8.4 Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| "BASE64 IS EMPTY" | Webhook payload not reaching Prepare Data correctly | Check webhook body structure: `body.file_base64` |
| "Arrays are not supported" | HTTP Request using Form Data instead of JSON | Change Body Content Type to `JSON` |
| "messages.0.content.0.document.source.base64.data: Field required" | Incorrect Anthropic API request structure | Ensure source has `type`, `media_type`, and `data` fields |
| "invalid input syntax for type date" | Date field contains newlines or invalid format | Use `cleanDate()` helper to validate YYYY-MM-DD format |
| "No output data returned" | Wrong Supabase URL in n8n credentials | Update Host to match frontend URL |
| Invoice fields are NULL | Update WHERE clause not matching | Verify file_name matches exactly |
| Workflow not triggered | Webhook not published | Publish the workflow in n8n |

### 8.5 Common Errors and Fixes

#### Error: "messages.0.content.0.document.source.base64.data: Field required"
**Cause**: The Anthropic API expects a specific structure for document/image uploads.

**Fix**: Ensure the request body has this exact structure:
```json
{
  "messages": [{
    "role": "user",
    "content": [
      {
        "type": "document",  // or "image" for images
        "source": {
          "type": "base64",
          "media_type": "application/pdf",
          "data": "JVBERi0xLjQK..."  // actual base64 string
        }
      }
    ]
  }]
}
```

#### Error: "invalid input syntax for type date"
**Cause**: Supabase DATE columns reject empty strings, newlines, or invalid formats.

**Fix**: Use the `cleanDate()` helper function that:
1. Trims whitespace
2. Validates YYYY-MM-DD format
3. Returns `null` for invalid dates (which Supabase accepts)

---

## 9. MCP Architecture Guidelines

### 9.1 Current vs MCP Architecture

**Current Architecture (Direct Integration):**
```
Frontend → n8n Webhook → AI Agent → Supabase Node → Database
```

**MCP Architecture (Tool-Based):**
```
Frontend → n8n Webhook → AI Agent → MCP Tools → MCP Server → Database
                              ↓
                         Tool Discovery
                              ↓
                    ┌─────────────────────┐
                    │   Available Tools   │
                    ├─────────────────────┤
                    │ • save_invoice      │
                    │ • get_invoice       │
                    │ • update_status     │
                    │ • send_notification │
                    │ • generate_pdf      │
                    └─────────────────────┘
```

### 9.2 Benefits of MCP

1. **Dynamic Tool Discovery**: AI agent discovers available tools at runtime
2. **Loose Coupling**: Tools can be added/removed without workflow changes
3. **Reusability**: Same MCP server can serve multiple workflows
4. **Standardization**: Follows Anthropic's Model Context Protocol standard

### 9.3 Implementing MCP (Future)

#### Step 1: Set Up MCP Server
```bash
# Install Supabase MCP Server
npm install @supabase/mcp-server-supabase

# Or create custom MCP server
npm install @anthropic-ai/mcp-sdk
```

#### Step 2: Define Tools
```typescript
// mcp-server/tools/invoice.ts
export const invoiceTools = {
    save_invoice: {
        description: "Save extracted invoice data to database",
        parameters: {
            invoice_number: { type: "string" },
            vendor_name: { type: "string" },
            total_amount: { type: "number" },
            // ... more fields
        },
        handler: async (params) => {
            return await supabase.from('invoices').upsert(params);
        }
    },

    get_invoice: {
        description: "Retrieve invoice by ID",
        parameters: {
            id: { type: "string", required: true }
        },
        handler: async ({ id }) => {
            return await supabase.from('invoices').select('*').eq('id', id);
        }
    },

    send_notification: {
        description: "Send notification about invoice",
        parameters: {
            invoice_id: { type: "string" },
            recipient: { type: "string" },
            type: { type: "string", enum: ["email", "slack"] }
        },
        handler: async (params) => {
            // Implementation
        }
    }
};
```

#### Step 3: Connect n8n to MCP
```yaml
# n8n Node Configuration
Type: MCP Client Tool
MCP Server URL: http://localhost:3001
Available Tools: [auto-discovered]
```

### 9.4 MCP Migration Path

| Phase | Description | Timeline |
|-------|-------------|----------|
| Phase 1 | Current setup working | ✅ Complete |
| Phase 2 | Add MCP server with Supabase tools | 2 weeks |
| Phase 3 | Migrate AI Agent to use MCP tools | 1 week |
| Phase 4 | Add notification tools | 1 week |
| Phase 5 | Add PDF generation tools | 1 week |

---

## 10. Future Enhancements

### 10.1 Planned Features

#### 10.1.1 Email Integration
**Priority:** High
**Description:** Automatically process invoices received via email

```
Email Inbox → n8n Email Trigger → Extract Attachment → Process Invoice
```

**Requirements:**
- [ ] IMAP/Gmail integration in n8n
- [ ] Email parsing for attachments
- [ ] Sender whitelist configuration
- [ ] Auto-reply confirmation

#### 10.1.2 Duplicate Detection
**Priority:** High
**Description:** Detect and flag duplicate invoices

**Requirements:**
- [ ] Match by invoice_number + vendor_name
- [ ] Fuzzy matching for similar amounts/dates
- [ ] Flag with "potential_duplicate" status
- [ ] Manual resolution workflow

#### 10.1.3 Purchase Order Matching
**Priority:** Medium
**Description:** Match invoices to purchase orders

**Requirements:**
- [ ] PO import/management
- [ ] Auto-match by PO number
- [ ] Three-way matching (PO, Receipt, Invoice)
- [ ] Variance detection and alerts

#### 10.1.4 Approval Workflow
**Priority:** Medium
**Description:** Multi-level approval based on amount

**Requirements:**
- [ ] Approval thresholds configuration
- [ ] Approver assignment
- [ ] Email notifications for pending approvals
- [ ] Approval history audit trail

#### 10.1.5 Export & Reporting
**Priority:** Low
**Description:** Export invoices and generate reports

**Requirements:**
- [ ] CSV/Excel export
- [ ] PDF report generation
- [ ] Scheduled reports
- [ ] Custom date range filtering

#### 10.1.6 Multi-Currency Support
**Priority:** Low
**Description:** Handle invoices in multiple currencies

**Requirements:**
- [ ] Currency detection from invoice
- [ ] Exchange rate API integration
- [ ] Convert to base currency for reporting
- [ ] Historical rate tracking

### 10.2 Technical Debt

| Item | Description | Priority |
|------|-------------|----------|
| Error Handling | Add comprehensive error boundaries | High |
| Loading States | Skeleton loaders for better UX | Medium |
| Caching | Implement React Query caching strategy | Medium |
| Tests | Add unit and integration tests | High |
| Logging | Structured logging for debugging | Medium |

---

## 11. Non-Functional Requirements

### 11.1 Performance

| Metric | Requirement | Current |
|--------|-------------|---------|
| Page Load Time | < 2 seconds | TBD |
| Invoice Processing | < 5 seconds | ~3 seconds |
| API Response Time | < 500ms | TBD |
| Concurrent Users | 50+ | TBD |

### 11.2 Security

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| HTTPS | ✅ | Supabase provides SSL |
| API Key Protection | ✅ | Environment variables |
| Row Level Security | ✅ | Supabase RLS enabled |
| Input Validation | ⚠️ | Partial (file type/size) |
| XSS Prevention | ✅ | React default escaping |

### 11.3 Reliability

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| Uptime | 99.9% | Supabase SLA |
| Data Backup | Daily | Supabase automatic |
| Error Recovery | Graceful | Partial implementation |
| Offline Support | Not required | - |

### 11.4 Scalability

| Aspect | Current Limit | Scale Strategy |
|--------|---------------|----------------|
| Database | 500MB (free tier) | Upgrade Supabase plan |
| Storage | 1GB (free tier) | Upgrade Supabase plan |
| n8n Executions | Unlimited (self-hosted) | - |
| API Calls | 1M/month (Anthropic) | Rate limiting |

---

## 12. Deployment Guide

### 12.1 Prerequisites

#### 12.1.1 Required Software
```bash
# Node.js (v18 or higher)
node --version  # Should be >= 18.0.0

# npm or yarn
npm --version   # Should be >= 9.0.0

# Git
git --version
```

#### 12.1.2 Required Accounts
| Service | Purpose | Sign Up |
|---------|---------|---------|
| Supabase | Database & Storage | https://supabase.com |
| Anthropic | AI API (Claude) | https://console.anthropic.com |
| n8n Cloud (optional) | Hosted workflows | https://n8n.io |

### 12.2 Local Development Setup

#### Step 1: Clone Repository
```bash
git clone <repository-url>
cd invoice-dashboard
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Configure Environment Variables
```bash
# Create .env file
cp .env.example .env

# Edit .env with your credentials
```

**.env Configuration:**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# n8n Webhook URL
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/invoice-mcp-v2
```

#### Step 4: Set Up Supabase

1. **Create New Project** at https://supabase.com/dashboard

2. **Run Database Migrations:**
```sql
-- Create invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT,
    vendor_name TEXT,
    invoice_date DATE,
    due_date DATE,
    total_amount NUMERIC,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'processed', 'approved', 'paid', 'rejected')),
    file_url TEXT,
    file_name TEXT,
    extracted_data JSONB,
    confidence NUMERIC,
    matched_po TEXT,
    flags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create line items table
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT,
    quantity NUMERIC,
    unit_price NUMERIC,
    total NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Create permissive policy (adjust for production)
CREATE POLICY "Allow all access to invoices" ON invoices
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to line items" ON invoice_line_items
    FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_vendor ON invoices(vendor_name);
CREATE INDEX idx_invoices_file_name ON invoices(file_name);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);
```

3. **Create Storage Bucket:**
```sql
-- In Supabase Dashboard > Storage > Create Bucket
-- Name: invoices
-- Public: Yes (for easy file access)
```

4. **Get API Keys:**
   - Go to Project Settings → API
   - Copy `URL` and `anon public` key to `.env`
   - Copy `service_role` key for n8n

#### Step 5: Set Up n8n

**Option A: Docker (Recommended for Local)**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Option B: npm**
```bash
npm install -g n8n
n8n start
```

**Option C: n8n Cloud**
- Sign up at https://n8n.io
- Create new workflow

#### Step 6: Configure n8n Workflow

1. **Import Workflow** (or create manually):
   - Open n8n at http://localhost:5678
   - Create new workflow named "Invoice Processor v2 (MCP Architecture)"

2. **Add Webhook Node:**
   - HTTP Method: POST
   - Path: `/webhook/invoice-mcp-v2`
   - Response Mode: Immediately
   - Response Data: `{ "message": "Workflow was started" }`

3. **Add AI Agent Node:**
   - Connect to Anthropic (add credential)
   - Model: Claude 3.5 Sonnet
   - Add system prompt for invoice extraction

4. **Add Supabase Node:**
   - Create credential with **correct Host URL**
   - Use **service_role** key (not anon key)
   - Operation: Update
   - Match by: `file_name`

5. **Publish Workflow:**
   - Toggle "Active" switch
   - Test with sample invoice

#### Step 7: Start Development Server
```bash
npm run dev
```

Access the application at: http://localhost:5173

### 12.3 Production Deployment

#### 12.3.1 Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_N8N_WEBHOOK_URL (use n8n Cloud URL)
```

#### 12.3.2 Frontend Deployment (Netlify)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 12.3.3 n8n Production Setup

**Option 1: n8n Cloud (Recommended)**
- Managed hosting with automatic updates
- Built-in SSL and security
- https://n8n.io/cloud

**Option 2: Self-Hosted (Docker Compose)**

```yaml
# docker-compose.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-secure-password
      - N8N_HOST=your-domain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://your-domain.com/
      - GENERIC_TIMEZONE=America/New_York
    volumes:
      - n8n_data:/home/node/.n8n

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs

volumes:
  n8n_data:
```

### 12.4 Environment Configuration

#### 12.4.1 Development
```bash
# .env.development
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/invoice-mcp-v2
```

#### 12.4.2 Staging
```bash
# .env.staging
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
VITE_N8N_WEBHOOK_URL=https://staging-n8n.your-domain.com/webhook/invoice-mcp-v2
```

#### 12.4.3 Production
```bash
# .env.production
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_N8N_WEBHOOK_URL=https://n8n.your-domain.com/webhook/invoice-mcp-v2
```

### 12.5 CI/CD Pipeline

#### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 12.6 Monitoring & Logging

#### 12.6.1 Supabase Monitoring
- **Dashboard**: Real-time metrics at https://supabase.com/dashboard
- **Logs**: SQL logs, Auth logs, Storage logs
- **Alerts**: Configure in Project Settings

#### 12.6.2 n8n Monitoring
- **Executions**: View all workflow runs
- **Error Logs**: Debug failed executions
- **Metrics**: Execution time, success rate

#### 12.6.3 Application Logging (Recommended)

```typescript
// src/utils/logger.ts
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
  info: (message: string, data?: unknown) => {
    console.info(`[INFO] ${message}`, data);
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service (Sentry, etc.)
  },
};
```

### 12.7 Backup & Recovery

#### 12.7.1 Database Backup
- **Automatic**: Supabase provides daily backups (Pro plan)
- **Manual**: Export via pg_dump
```bash
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

#### 12.7.2 n8n Workflow Backup
```bash
# Export all workflows
curl -X GET "http://localhost:5678/api/v1/workflows" \
  -H "X-N8N-API-KEY: your-api-key" \
  > workflows-backup.json
```

#### 12.7.3 Recovery Procedure
1. Restore database from backup
2. Import n8n workflows
3. Verify credentials are configured
4. Test webhook connectivity
5. Run smoke tests

---

## 13. Testing Strategy

### 13.1 Testing Pyramid

```
                    ┌─────────────┐
                    │    E2E      │  ← Few, slow, expensive
                    │   Tests     │
                    └─────────────┘
               ┌─────────────────────┐
               │   Integration       │  ← Some tests
               │      Tests          │
               └─────────────────────┘
          ┌─────────────────────────────┐
          │        Unit Tests           │  ← Many, fast, cheap
          └─────────────────────────────┘
```

### 13.2 Unit Tests

#### 13.2.1 Setup (Vitest)
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

#### 13.2.2 Component Tests

```typescript
// src/components/invoices/__tests__/InvoiceStatusBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { InvoiceStatusBadge } from '../InvoiceStatusBadge';

describe('InvoiceStatusBadge', () => {
  it('renders pending status correctly', () => {
    render(<InvoiceStatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders approved status with correct color', () => {
    render(<InvoiceStatusBadge status="approved" />);
    const badge = screen.getByText('Approved');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('renders rejected status', () => {
    render(<InvoiceStatusBadge status="rejected" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });
});
```

#### 13.2.3 Service Tests

```typescript
// src/services/__tests__/api.test.ts
import { describe, it, expect, vi } from 'vitest';
import { validateFile } from '../api';

describe('validateFile', () => {
  it('accepts valid PDF file', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('rejects files over 10MB', () => {
    const file = new File([''], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB

    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10MB');
  });

  it('rejects invalid file types', () => {
    const file = new File([''], 'test.exe', { type: 'application/x-msdownload' });

    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });
});
```

### 13.3 Integration Tests

#### 13.3.1 Supabase Integration

```typescript
// src/services/__tests__/supabase.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { invoiceService } from '../supabase';

describe('Invoice Service Integration', () => {
  let testInvoiceId: string;

  it('creates an invoice', async () => {
    const invoice = await invoiceService.create({
      file_name: 'test-invoice.pdf',
      status: 'pending',
      currency: 'USD',
    });

    expect(invoice.id).toBeDefined();
    expect(invoice.file_name).toBe('test-invoice.pdf');
    testInvoiceId = invoice.id;
  });

  it('retrieves invoice by ID', async () => {
    const invoice = await invoiceService.getById(testInvoiceId);

    expect(invoice.id).toBe(testInvoiceId);
    expect(invoice.file_name).toBe('test-invoice.pdf');
  });

  it('updates invoice status', async () => {
    const updated = await invoiceService.updateStatus(testInvoiceId, 'processed');

    expect(updated.status).toBe('processed');
  });

  afterAll(async () => {
    // Cleanup
    await invoiceService.delete(testInvoiceId);
  });
});
```

### 13.4 End-to-End Tests (Playwright)

#### 13.4.1 Setup
```bash
npm install -D @playwright/test
npx playwright install
```

**playwright.config.ts:**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### 13.4.2 E2E Test Examples

```typescript
// e2e/invoice-upload.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Invoice Upload Flow', () => {
  test('user can upload an invoice', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/upload');
    await expect(page.getByText('Upload Invoice')).toBeVisible();

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/sample-invoice.pdf');

    // Wait for processing
    await expect(page.getByText('Processing')).toBeVisible();
    await expect(page.getByText('processed successfully')).toBeVisible({ timeout: 30000 });

    // Verify redirect to invoice list
    await expect(page).toHaveURL(/\/invoices/);
  });

  test('user can view invoice details', async ({ page }) => {
    await page.goto('/invoices');

    // Click first invoice
    await page.getByRole('row').nth(1).click();

    // Verify detail page
    await expect(page.getByText('Invoice Details')).toBeVisible();
    await expect(page.getByText('Line Items')).toBeVisible();
  });

  test('user can change invoice status', async ({ page }) => {
    await page.goto('/invoices');
    await page.getByRole('row').nth(1).click();

    // Change status
    await page.getByRole('button', { name: 'Approve' }).click();

    // Verify status changed
    await expect(page.getByText('Approved')).toBeVisible();
  });
});
```

### 13.5 n8n Workflow Testing

#### 13.5.1 Manual Testing Checklist

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Valid PDF Upload | Upload sample PDF | Extracts all fields correctly |
| Valid PNG Upload | Upload invoice image | Extracts all fields correctly |
| Large File | Upload 9MB PDF | Processes successfully |
| Invalid Format | Upload .docx file | Returns error message |
| Missing Fields | Upload partial invoice | Extracts available fields, confidence < 1 |
| Duplicate Invoice | Upload same file twice | Both records created with unique IDs |

#### 13.5.2 Webhook Testing

```bash
# Test webhook directly
curl -X POST http://localhost:5678/webhook/invoice-mcp-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "file_base64": "JVBERi0xLjQK...",
    "mime_type": "application/pdf",
    "filename": "test-invoice.pdf",
    "source": "test"
  }'
```

### 13.6 Test Data Management

#### 13.6.1 Sample Invoices
Store test invoices in `e2e/fixtures/`:
- `sample-invoice.pdf` - Standard invoice
- `multi-page-invoice.pdf` - Multi-page invoice
- `handwritten-invoice.jpg` - Handwritten invoice
- `foreign-currency-invoice.pdf` - EUR currency

#### 13.6.2 Database Seeding

```typescript
// scripts/seed-test-data.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seedTestData() {
  const testInvoices = [
    {
      invoice_number: 'TEST-001',
      vendor_name: 'Test Vendor A',
      total_amount: 1000,
      status: 'pending',
      currency: 'USD',
    },
    {
      invoice_number: 'TEST-002',
      vendor_name: 'Test Vendor B',
      total_amount: 2500,
      status: 'processed',
      currency: 'USD',
    },
    // ... more test data
  ];

  const { data, error } = await supabase
    .from('invoices')
    .insert(testInvoices);

  if (error) throw error;
  console.log(`Seeded ${testInvoices.length} test invoices`);
}

seedTestData();
```

### 13.7 Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm test -- --coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e -- --ui

# All tests
npm run test:all
```

---

## 14. MCP Implementation Guide

### 14.1 What is MCP?

**Model Context Protocol (MCP)** is Anthropic's open standard for connecting AI models to external tools and data sources. Instead of hardcoding integrations, MCP allows AI agents to dynamically discover and use tools.

### 14.2 MCP Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MCP ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│   │   Client    │◀───────▶│ MCP Server  │◀───────▶│  Resources  │          │
│   │ (AI Agent)  │   MCP   │             │         │ (Database,  │          │
│   │             │ Protocol│             │         │  APIs, etc) │          │
│   └─────────────┘         └─────────────┘         └─────────────┘          │
│                                  │                                          │
│                                  ▼                                          │
│                           ┌─────────────┐                                   │
│                           │    Tools    │                                   │
│                           ├─────────────┤                                   │
│                           │ • save_invoice                                  │
│                           │ • get_invoice                                   │
│                           │ • update_status                                 │
│                           │ • send_email                                    │
│                           │ • generate_pdf                                  │
│                           └─────────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 14.3 MCP vs Current Architecture

| Aspect | Current (Direct) | MCP (Tool-Based) |
|--------|------------------|------------------|
| Integration | Hardcoded nodes | Dynamic tool discovery |
| Adding tools | Modify workflow | Add to MCP server |
| AI autonomy | Fixed path | Chooses tools dynamically |
| Reusability | Per workflow | Across all workflows |
| Maintenance | Update each node | Update MCP server once |

### 14.4 Step-by-Step MCP Implementation

#### Phase 1: Create MCP Server Project

```bash
# Create new project
mkdir invoice-mcp-server
cd invoice-mcp-server
npm init -y

# Install dependencies
npm install @anthropic-ai/sdk @supabase/supabase-js express zod
npm install -D typescript @types/node @types/express ts-node nodemon
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

#### Phase 2: Define Tool Schemas

```typescript
// src/tools/schemas.ts
import { z } from 'zod';

// Invoice schemas
export const InvoiceSchema = z.object({
  invoice_number: z.string().optional(),
  vendor_name: z.string().optional(),
  invoice_date: z.string().optional(),
  due_date: z.string().optional(),
  total_amount: z.number().optional(),
  currency: z.string().default('USD'),
  status: z.enum(['pending', 'processed', 'approved', 'paid', 'rejected']).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const SaveInvoiceSchema = z.object({
  file_name: z.string().describe('The filename to match for update'),
  data: InvoiceSchema.describe('Invoice data to save'),
});

export const GetInvoiceSchema = z.object({
  id: z.string().uuid().optional().describe('Invoice ID'),
  file_name: z.string().optional().describe('Invoice filename'),
});

export const UpdateStatusSchema = z.object({
  id: z.string().uuid().describe('Invoice ID'),
  status: z.enum(['pending', 'processed', 'approved', 'paid', 'rejected']),
});

export const SendNotificationSchema = z.object({
  invoice_id: z.string().uuid(),
  type: z.enum(['email', 'slack']),
  recipient: z.string(),
  message: z.string().optional(),
});
```

#### Phase 3: Implement Tool Handlers

```typescript
// src/tools/invoice-tools.ts
import { createClient } from '@supabase/supabase-js';
import {
  SaveInvoiceSchema,
  GetInvoiceSchema,
  UpdateStatusSchema,
  SendNotificationSchema
} from './schemas';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const invoiceTools = {
  // Tool: Save Invoice
  save_invoice: {
    name: 'save_invoice',
    description: 'Save or update invoice data in the database. Use this after extracting invoice information.',
    inputSchema: SaveInvoiceSchema,
    handler: async (input: z.infer<typeof SaveInvoiceSchema>) => {
      const { file_name, data } = input;

      const { data: result, error } = await supabase
        .from('invoices')
        .update({
          ...data,
          status: data.status || 'processed',
          updated_at: new Date().toISOString(),
        })
        .eq('file_name', file_name)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        invoice_id: result.id,
        message: `Invoice ${result.invoice_number || file_name} saved successfully`
      };
    },
  },

  // Tool: Get Invoice
  get_invoice: {
    name: 'get_invoice',
    description: 'Retrieve invoice details by ID or filename',
    inputSchema: GetInvoiceSchema,
    handler: async (input: z.infer<typeof GetInvoiceSchema>) => {
      let query = supabase.from('invoices').select('*');

      if (input.id) {
        query = query.eq('id', input.id);
      } else if (input.file_name) {
        query = query.eq('file_name', input.file_name);
      } else {
        return { success: false, error: 'Must provide id or file_name' };
      }

      const { data, error } = await query.single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, invoice: data };
    },
  },

  // Tool: Update Status
  update_status: {
    name: 'update_status',
    description: 'Update the status of an invoice (pending, processed, approved, paid, rejected)',
    inputSchema: UpdateStatusSchema,
    handler: async (input: z.infer<typeof UpdateStatusSchema>) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: input.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: `Invoice status updated to ${input.status}`
      };
    },
  },

  // Tool: Send Notification
  send_notification: {
    name: 'send_notification',
    description: 'Send a notification about an invoice via email or Slack',
    inputSchema: SendNotificationSchema,
    handler: async (input: z.infer<typeof SendNotificationSchema>) => {
      // Get invoice details
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', input.invoice_id)
        .single();

      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      if (input.type === 'email') {
        // Implement email sending (SendGrid, Resend, etc.)
        console.log(`Sending email to ${input.recipient} about invoice ${invoice.invoice_number}`);
        return { success: true, message: `Email sent to ${input.recipient}` };
      }

      if (input.type === 'slack') {
        // Implement Slack webhook
        console.log(`Sending Slack message about invoice ${invoice.invoice_number}`);
        return { success: true, message: 'Slack notification sent' };
      }

      return { success: false, error: 'Unknown notification type' };
    },
  },
};

export type InvoiceTools = typeof invoiceTools;
```

#### Phase 4: Create MCP Server

```typescript
// src/server.ts
import express from 'express';
import { invoiceTools } from './tools/invoice-tools';

const app = express();
app.use(express.json());

// MCP Tool Discovery Endpoint
app.get('/tools', (req, res) => {
  const tools = Object.values(invoiceTools).map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));

  res.json({ tools });
});

// MCP Tool Execution Endpoint
app.post('/tools/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const tool = invoiceTools[toolName as keyof typeof invoiceTools];

  if (!tool) {
    return res.status(404).json({ error: `Tool '${toolName}' not found` });
  }

  try {
    // Validate input
    const validatedInput = tool.inputSchema.parse(req.body);

    // Execute tool
    const result = await tool.handler(validatedInput);

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Tool execution failed', details: String(error) });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', tools: Object.keys(invoiceTools).length });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`Available tools: ${Object.keys(invoiceTools).join(', ')}`);
});
```

#### Phase 5: Configure n8n to Use MCP

**Option A: HTTP Request Node (Current Approach)**

```yaml
# n8n Node Configuration
Type: HTTP Request
Method: POST
URL: http://localhost:3001/tools/save_invoice
Body:
  file_name: {{ $('Webhook').item.json.body.filename }}
  data:
    invoice_number: {{ $json.invoice_number }}
    vendor_name: {{ $json.vendor_name }}
    total_amount: {{ $json.total_amount }}
    # ... other fields
```

**Option B: Custom n8n MCP Node (Advanced)**

Create a custom n8n node that auto-discovers tools:

```typescript
// n8n-nodes-mcp/nodes/McpClient/McpClient.node.ts
import { IExecuteFunctions, INodeExecutionData, INodeType } from 'n8n-workflow';

export class McpClient implements INodeType {
  description = {
    displayName: 'MCP Client',
    name: 'mcpClient',
    group: ['transform'],
    version: 1,
    description: 'Execute MCP tools',
    defaults: { name: 'MCP Client' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'MCP Server URL',
        name: 'serverUrl',
        type: 'string',
        default: 'http://localhost:3001',
      },
      {
        displayName: 'Tool Name',
        name: 'toolName',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getTools',
        },
        default: '',
      },
      {
        displayName: 'Tool Input',
        name: 'toolInput',
        type: 'json',
        default: '{}',
      },
    ],
  };

  methods = {
    loadOptions: {
      async getTools(this: IExecuteFunctions) {
        const serverUrl = this.getNodeParameter('serverUrl', 0) as string;
        const response = await this.helpers.httpRequest({
          method: 'GET',
          url: `${serverUrl}/tools`,
        });
        return response.tools.map((tool: any) => ({
          name: tool.name,
          value: tool.name,
          description: tool.description,
        }));
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const serverUrl = this.getNodeParameter('serverUrl', 0) as string;
    const toolName = this.getNodeParameter('toolName', 0) as string;
    const toolInput = this.getNodeParameter('toolInput', 0) as object;

    const result = await this.helpers.httpRequest({
      method: 'POST',
      url: `${serverUrl}/tools/${toolName}`,
      body: toolInput,
      json: true,
    });

    return [this.helpers.returnJsonArray(result)];
  }
}
```

#### Phase 6: Add More Tools

```typescript
// src/tools/pdf-tools.ts
export const pdfTools = {
  generate_invoice_pdf: {
    name: 'generate_invoice_pdf',
    description: 'Generate a PDF document from invoice data',
    inputSchema: z.object({
      invoice_id: z.string().uuid(),
      template: z.enum(['standard', 'detailed', 'summary']).default('standard'),
    }),
    handler: async (input) => {
      // Use puppeteer, pdfkit, or similar
      // Generate PDF and upload to storage
      return { success: true, pdf_url: '...' };
    },
  },
};

// src/tools/email-tools.ts
export const emailTools = {
  send_invoice_email: {
    name: 'send_invoice_email',
    description: 'Send invoice via email with PDF attachment',
    inputSchema: z.object({
      invoice_id: z.string().uuid(),
      recipient_email: z.string().email(),
      subject: z.string().optional(),
      message: z.string().optional(),
    }),
    handler: async (input) => {
      // Implement email sending
      return { success: true, message_id: '...' };
    },
  },
};

// src/tools/index.ts - Combine all tools
import { invoiceTools } from './invoice-tools';
import { pdfTools } from './pdf-tools';
import { emailTools } from './email-tools';

export const allTools = {
  ...invoiceTools,
  ...pdfTools,
  ...emailTools,
};
```

### 14.5 MCP Server Deployment

#### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  mcp-server:
    build: .
    ports:
      - "3001:3001"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 14.6 Complete MCP Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE MCP WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. INVOICE UPLOAD                                                          │
│     Frontend → Supabase (create record) → n8n Webhook                       │
│                                                                             │
│  2. AI PROCESSING                                                           │
│     n8n AI Agent receives image                                             │
│          ↓                                                                  │
│     Agent calls MCP: GET /tools (discovers available tools)                 │
│          ↓                                                                  │
│     Agent extracts invoice data                                             │
│          ↓                                                                  │
│     Agent decides: "I should use save_invoice tool"                         │
│          ↓                                                                  │
│     Agent calls MCP: POST /tools/save_invoice                               │
│                                                                             │
│  3. OPTIONAL ACTIONS (AI decides based on context)                          │
│     - If high value: Agent calls send_notification                          │
│     - If PDF needed: Agent calls generate_invoice_pdf                       │
│     - If duplicate: Agent calls update_status(rejected)                     │
│                                                                             │
│  4. RESULT                                                                  │
│     Frontend queries Supabase → Displays updated invoice                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 14.7 MCP Best Practices

#### 14.7.1 Tool Design Principles

| Principle | Description | Example |
|-----------|-------------|---------|
| Single Responsibility | One tool = one action | `save_invoice` only saves |
| Clear Descriptions | AI needs to understand when to use | "Use this after extracting..." |
| Validated Inputs | Use Zod schemas | Required fields, types |
| Meaningful Outputs | Return actionable results | `{ success, message, data }` |
| Error Handling | Graceful failures | Return error object, don't throw |

#### 14.7.2 Security Considerations

```typescript
// Implement rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/tools', limiter);

// Implement API key authentication
app.use('/tools', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.MCP_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
});
```

#### 14.7.3 Monitoring & Logging

```typescript
// Add request logging
app.use('/tools/:toolName', (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      tool: req.params.toolName,
      duration_ms: duration,
      status: res.statusCode,
    }));
  });

  next();
});
```

---

## 15. Appendix

### 15.1 Glossary

| Term | Definition |
|------|------------|
| MCP | Model Context Protocol - Anthropic's standard for AI tool integration |
| n8n | Open-source workflow automation platform |
| Supabase | Open-source Firebase alternative (PostgreSQL + APIs) |
| RLS | Row Level Security - PostgreSQL security feature |
| Webhook | HTTP callback for event-driven communication |

### 15.2 Reference Links

- [Supabase Documentation](https://supabase.com/docs)
- [n8n Documentation](https://docs.n8n.io)
- [Anthropic API Reference](https://docs.anthropic.com)
- [MCP Specification](https://github.com/anthropics/anthropic-cookbook/tree/main/misc/model_context_protocol)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### 15.3 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-01 | Initial system with basic extraction |
| 1.5 | 2026-01-15 | Added n8n workflow integration |
| 2.0 | 2026-02-03 | Fixed Supabase UPDATE, documented MCP architecture |
| 2.1 | 2026-02-03 | **Major n8n Workflow Refactor**: Replaced AI Agent node with direct HTTP Request to Anthropic API. Added Prepare Data node for proper request formatting. Fixed "Arrays are not supported" error by using JSON body type. Added date validation helpers to fix "invalid input syntax for type date" errors. Updated Parse JSON node to handle Claude's response format with markdown cleanup. |

### 15.4 Contact

For questions about this document or the system:
- **Technical Lead**: [Your Name]
- **Repository**: [GitHub URL]
- **Issue Tracker**: [GitHub Issues URL]

---

*This document is a living artifact and should be updated as the system evolves.*
