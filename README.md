# InvoiceAI Pro - Invoice Processing Dashboard

AI-powered invoice processing dashboard built with React, TypeScript, and Supabase. Features intelligent data extraction using Claude AI through n8n workflows.

## Features

- Drag & drop invoice upload (PDF, PNG, JPG)
- AI-powered data extraction via Claude
- Real-time dashboard analytics
- Invoice search and filtering
- Status-based approval workflow
- Vendor spend analytics
- Responsive design with dark mode

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Automation**: n8n workflows
- **AI**: Claude (via n8n integration)
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- n8n instance (local or cloud)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/invoice-dashboard.git
cd invoice-dashboard

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
# n8n Webhook
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/process-invoice-pro

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared UI components
│   ├── dashboard/       # Dashboard widgets
│   ├── invoices/        # Invoice-related components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # API and database services
├── types/               # TypeScript definitions
└── utils/               # Utility functions
```

## Database Schema

### invoices table

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100),
  vendor_name VARCHAR(255),
  invoice_date DATE,
  due_date DATE,
  total_amount DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  file_url TEXT,
  file_name VARCHAR(255),
  extracted_data JSONB,
  confidence INTEGER,
  matched_po VARCHAR(100),
  flags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### invoice_line_items table

```sql
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT,
  quantity DECIMAL(10,2),
  unit_price DECIMAL(12,2),
  total DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## License

MIT
