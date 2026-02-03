const fs = require('fs');
const path = require('path');

function escapeText(text) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '\\') result += '\\\\';
    else if (c === '(') result += '\\(';
    else if (c === ')') result += '\\)';
    else result += c;
  }
  return result;
}

function generatePDF(invoiceData) {
  const { invoiceNumber, date, dueDate, vendor, customer, items, subtotal, tax, total } = invoiceData;

  let content = [];
  content.push('INVOICE');
  content.push('');
  content.push('Invoice #: ' + invoiceNumber);
  content.push('Date: ' + date);
  content.push('Due Date: ' + dueDate);
  content.push('');
  content.push('From:');
  content.push(vendor.name);
  content.push(vendor.address);
  content.push(vendor.email);
  content.push('');
  content.push('Bill To:');
  content.push(customer.name);
  content.push(customer.address);
  content.push(customer.email);
  content.push('');
  content.push('Items:');
  items.forEach((item, i) => {
    content.push((i+1) + '. ' + item.description + ' - $' + item.amount.toFixed(2));
  });
  content.push('');
  content.push('Subtotal: $' + subtotal.toFixed(2));
  content.push('Tax: $' + tax.toFixed(2));
  content.push('Total: $' + total.toFixed(2));

  const textStream = content.map((line, i) =>
    'BT /F1 12 Tf 50 ' + (750 - i * 16) + ' Td (' + escapeText(line) + ') Tj ET'
  ).join('\n');

  const streamLength = textStream.length;

  return '%PDF-1.4\n' +
'1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
'2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
'3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n' +
'4 0 obj\n<< /Length ' + streamLength + ' >>\nstream\n' + textStream + '\nendstream\nendobj\n' +
'5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n' +
'xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000266 00000 n\n0000000' + (320 + streamLength) + ' 00000 n\n' +
'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + (380 + streamLength) + '\n%%EOF';
}

const invoices = [
  {
    invoiceNumber: 'INV-2024-001',
    date: 'January 15, 2024',
    dueDate: 'February 15, 2024',
    vendor: { name: 'TechPro Solutions Inc.', address: '123 Innovation Drive, San Francisco, CA', email: 'billing@techpro.com' },
    customer: { name: 'Acme Corporation', address: '456 Business Ave, New York, NY', email: 'accounts@acme.com' },
    items: [
      { description: 'Web Development Services', amount: 2500.00 },
      { description: 'Cloud Hosting 12 months', amount: 600.00 },
      { description: 'SSL Certificate', amount: 100.00 }
    ],
    subtotal: 3200.00, tax: 320.00, total: 3520.00
  },
  {
    invoiceNumber: 'INV-2024-002',
    date: 'January 20, 2024',
    dueDate: 'February 20, 2024',
    vendor: { name: 'Creative Marketing Agency', address: '789 Design Street, Los Angeles, CA', email: 'invoices@creative.com' },
    customer: { name: 'Global Retail Ltd.', address: '321 Commerce Blvd, Chicago, IL', email: 'finance@globalretail.com' },
    items: [
      { description: 'Brand Strategy Consultation', amount: 1500.00 },
      { description: 'Logo Design Package', amount: 800.00 },
      { description: 'Social Media Campaign', amount: 1200.00 }
    ],
    subtotal: 3500.00, tax: 350.00, total: 3850.00
  },
  {
    invoiceNumber: 'INV-2024-003',
    date: 'January 25, 2024',
    dueDate: 'February 25, 2024',
    vendor: { name: 'Office Essentials Co.', address: '555 Supply Lane, Seattle, WA', email: 'orders@officeessentials.com' },
    customer: { name: 'StartUp Ventures', address: '888 Innovation Park, Austin, TX', email: 'admin@startupventures.io' },
    items: [
      { description: 'Ergonomic Office Chairs x5', amount: 1250.00 },
      { description: 'Standing Desks x5', amount: 1500.00 },
      { description: 'Monitor Arms x10', amount: 400.00 }
    ],
    subtotal: 3150.00, tax: 252.00, total: 3402.00
  }
];

const samplesDir = path.join(__dirname, 'public', 'samples');
fs.mkdirSync(samplesDir, { recursive: true });

fs.writeFileSync(path.join(samplesDir, 'invoice-techpro-001.pdf'), generatePDF(invoices[0]));
fs.writeFileSync(path.join(samplesDir, 'invoice-marketing-002.pdf'), generatePDF(invoices[1]));
fs.writeFileSync(path.join(samplesDir, 'invoice-office-003.pdf'), generatePDF(invoices[2]));

console.log('Created 3 sample invoices in public/samples/');
console.log('Files:');
console.log('  - invoice-techpro-001.pdf (TechPro Solutions - $3,520)');
console.log('  - invoice-marketing-002.pdf (Creative Marketing - $3,850)');
console.log('  - invoice-office-003.pdf (Office Essentials - $3,402)');
