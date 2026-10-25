/**
 * Syllabus Experiment 5a:
 * Program using templating engine in ExpressJS.
 * FSD-2 Concept: Server-Side Rendering (SSR), Dynamic HTML Template Compilation, and Data Injection
 */

const express = require('express');
const app = express();
const PORT = 4007;

// Sample financial summary data to interpolate into the template
const studentFinancialData = {
  studentName: 'Ananya Verma',
  rollNo: '23B91A0501',
  month: 'October 2026',
  income: 18500,
  expenses: 7800,
  balance: 10700,
  transactions: [
    { desc: 'Monthly Pocket Allowance', type: 'Income', amount: 18500 },
    { desc: 'College Books & Lab Manuals', type: 'Expense', amount: 2400 },
    { desc: 'Hostel Mess & Canteen', type: 'Expense', amount: 3600 },
    { desc: 'Local Bus Transport', type: 'Expense', amount: 1800 }
  ]
};

// Express route demonstrating dynamic server-side template rendering
app.get('/report', (req, res) => {
  const rowsHtml = studentFinancialData.transactions.map(t => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${t.desc}</td>
      <td style="padding: 8px; border: 1px solid #ddd; color: ${t.type === 'Income' ? 'green' : 'red'};">${t.type}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${t.amount}</td>
    </tr>
  `).join('');

  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SpendWise — Monthly Financial Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 2rem; background: #f8fafc; }
        .card { background: white; padding: 2rem; border-radius: 8px; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h2 { color: #059669; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>SpendWise Financial Statement (SSR Template)</h2>
        <p><strong>Student:</strong> ${studentFinancialData.studentName} (${studentFinancialData.rollNo})</p>
        <p><strong>Billing Period:</strong> ${studentFinancialData.month}</p>
        <p><strong>Total Income:</strong> ₹${studentFinancialData.income} | <strong>Expenses:</strong> ₹${studentFinancialData.expenses}</p>
        <p><strong>Net Surplus:</strong> <span style="color: #059669; font-weight: bold;">₹${studentFinancialData.balance}</span></p>

        <h3>Transaction Breakdown</h3>
        <table>
          <thead>
            <tr style="background: #e2e8f0;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Description</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Type</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  res.send(template);
});

app.listen(PORT, () => {
  console.log(`[Experiment 5a] Templating Engine Server running at http://localhost:${PORT}/report`);
});
