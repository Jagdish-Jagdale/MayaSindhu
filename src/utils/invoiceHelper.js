/**
 * File: invoiceHelper.js
 * Description: Global helper utility defining tax invoice printing layout stylesheets, currency-to-words parser, and browser print triggers.
 * Work Done: Created centralized invoice helper module that handles both online and offline print tasks, manages tax rows, and calculates totals correctly.
 */

import toast from 'react-hot-toast';

export const handleDownloadInvoice = (order, isOffline = false, customerObj = {}) => {
  if (!order) return;

  const customerName = isOffline 
    ? (customerObj.fullName || order.customerName || '---')
    : (order.customerName || '---');
  
  // Construct address
  let customerAddress = 'Maharashtra<br/>India';
  if (isOffline) {
    customerAddress = customerObj.address || 'Maharashtra<br/>India';
  } else {
    if (order.shippingAddress) {
      const parts = [
        order.shippingAddress.address,
        order.shippingAddress.city,
        order.shippingAddress.state,
        order.shippingAddress.zip
      ].filter(Boolean);
      if (parts.length > 0) {
        customerAddress = parts.join('<br/>');
      }
    } else if (order.address) {
      customerAddress = order.address;
    }
  }

  const customerPhone = isOffline
    ? (customerObj.phone || '---')
    : (order.shippingAddress?.phone || order.phone || '---');

  const customerEmail = isOffline
    ? (customerObj.email || '---')
    : (order.email || '---');

  const now = new Date();
  const formattedTimestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error("Popup blocked! Please allow popups to download/print invoice.");
    return;
  }

  const items = order.items || [
    {
      name: order.productName || 'Handmade Creation',
      quantity: order.quantity || 1,
      rate: Number(order.total || 0) / (order.quantity || 1),
      amount: Number(order.total || 0)
    }
  ];

  const itemsHtml = items.map((item, index) => `
    <tr style="border-bottom: 1px solid #000;">
      <td style="border-right: 1px solid #000; padding: 10px 8px; font-size: 13px; text-align: center; vertical-align: top;">${index + 1}</td>
      <td style="border-right: 1px solid #000; padding: 10px 12px; font-size: 13px; text-align: left; vertical-align: top;">
        <div style="font-weight: bold; color: #000;">${item.name || item.productName || '---'}</div>
      </td>
      <td style="border-right: 1px solid #000; padding: 10px 8px; font-size: 13px; text-align: center; vertical-align: top;">${(item.quantity || 0).toFixed(2)}</td>
      <td style="border-right: 1px solid #000; padding: 10px 8px; font-size: 13px; text-align: right; vertical-align: top;">${(item.rate || item.price || 0).toFixed(2)}</td>
      <td style="padding: 10px 8px; font-size: 13px; text-align: right; vertical-align: top; font-weight: bold;">${(item.amount || item.subtotal || item.total || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const numToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + numToWords(n % 100) : '');
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? numToWords(n % 1000) : '');
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? numToWords(n % 100000) : '');
    return numToWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? numToWords(n % 10000000) : '');
  };
  const totalWords = (val) => {
    const parsedNum = parseInt(Math.round(val).toString(), 10);
    if (parsedNum === 0) return 'Zero';
    return 'Indian Rupee ' + numToWords(parsedNum).trim() + ' Only';
  };

  const formatDateVal = (val) => {
    if (!val) return '---';
    const date = val.toDate ? val.toDate() : new Date(val);
    if (isNaN(date.getTime())) return '---';
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const orderIdText = order.orderId || order.invoiceNumber || order.saleOrderNumber || order.id || '---';
  const subTotalAmount = Number(order.pricing?.subtotal || order.subTotal || order.total || 0);
  const taxPercent = Number(order.pricing?.tax || order.tax || 0);
  const grandTotalAmount = Number(order.pricing?.grandTotal || order.total || 0);

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - ${orderIdText}</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            color: #000;
            padding: 15mm 20mm;
            margin: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .company-name {
            font-size: 26px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 5px 0;
          }
          .company-details {
            font-size: 14px;
            line-height: 1.4;
            color: #000;
          }
          .invoice-title {
            font-size: 38px;
            font-family: Georgia, serif;
            font-weight: normal;
            text-transform: uppercase;
            text-align: right;
            letter-spacing: 2px;
            margin: 0;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 25px;
          }
          .info-cell {
            width: 50%;
            padding: 12px;
            vertical-align: top;
            font-size: 13px;
            line-height: 1.6;
          }
          .info-sub-table {
            width: 100%;
            border-collapse: collapse;
          }
          .info-sub-table td {
            padding: 3px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
            margin-bottom: 25px;
          }
          .items-table th {
            background-color: #f9fafb;
            font-size: 12px;
            font-weight: bold;
            text-transform: capitalize;
            padding: 10px 8px;
          }
          .bottom-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000;
          }
          .bottom-left-cell {
            width: 55%;
            border-right: 1.5px solid #000;
            padding: 15px;
            vertical-align: top;
            line-height: 1.5;
          }
          .bottom-right-cell {
            width: 45%;
            vertical-align: top;
            padding: 0;
          }
          .totals-table {
            width: 100%;
            border-collapse: collapse;
          }
          .totals-table td {
            padding: 10px 15px;
            font-size: 13px;
          }
          .totals-table tr.total-row {
            font-weight: bold;
            font-size: 14px;
            background-color: #f9fafb;
            border-top: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
          }
          .signature-cell {
            padding: 40px 15px 15px 15px;
            text-align: center;
          }
          .signature-line {
            font-family: monospace;
            font-size: 12px;
            margin-bottom: 5px;
            letter-spacing: -1px;
            color: #000;
          }
          .signature-text {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #000;
            margin-top: 50px;
            display: block;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="vertical-align: top; width: 60%;">
              <h1 class="company-name">${customerName}</h1>
              <div class="company-details">
                ${customerAddress}<br/>
                ${customerPhone}<br/>
                ${customerEmail}
              </div>
            </td>
            <td style="vertical-align: middle; text-align: right; width: 40%;">
              <h2 class="invoice-title">Tax Invoice</h2>
            </td>
          </tr>
        </table>

        <table class="info-table">
          <tr>
            <td class="info-cell" style="border-right: 1.5px solid #000; width: 50%;">
              <table class="info-sub-table">
                <tr>
                  <td style="width: 35%;">#</td>
                  <td style="width: 65%; font-weight: bold;">: ${orderIdText}</td>
                </tr>
                <tr>
                  <td>Invoice Date</td>
                  <td style="font-weight: bold;">: ${formatDateVal(order.invoiceDate || order.createdAt)}</td>
                </tr>
                <tr>
                  <td>Terms</td>
                  <td style="font-weight: bold;">: Due on Receipt</td>
                </tr>
                <tr>
                  <td>Due Date</td>
                  <td style="font-weight: bold;">: ${formatDateVal(order.invoiceDate || order.createdAt)}</td>
                </tr>
                <tr>
                  <td>P.O.#</td>
                  <td style="font-weight: bold;">: ${orderIdText}</td>
                </tr>
              </table>
            </td>
            <td class="info-cell" style="width: 50%;">
              <!-- Blank -->
            </td>
          </tr>
        </table>

        <table class="items-table">
          <thead>
            <tr style="border-bottom: 1.5px solid #000;">
              <th style="width: 6%; border-right: 1px solid #000; text-align: center;">Sr No</th>
              <th style="border-right: 1px solid #000; text-align: left; padding-left: 12px;">Item & Description</th>
              <th style="width: 12%; border-right: 1px solid #000; text-align: center;">Qty</th>
              <th style="width: 15%; border-right: 1px solid #000; text-align: right; padding-right: 12px;">Rate</th>
              <th style="width: 15%; text-align: right; padding-right: 12px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="bottom-table">
          <tr>
            <td class="bottom-left-cell">
              <div style="font-size: 11px; font-weight: bold; color: #555; text-transform: uppercase; margin-bottom: 4px;">Total In Words</div>
              <div style="font-size: 13px; font-weight: bold; font-style: italic; color: #000;">
                ${totalWords(grandTotalAmount)}
              </div>
            </td>
            <td class="bottom-right-cell">
              <table class="totals-table">
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="text-align: right; color: #333; width: 50%;">Sub Total</td>
                  <td style="text-align: right; font-weight: bold; color: #000; width: 50%;">${subTotalAmount.toFixed(2)}</td>
                </tr>
                ${taxPercent ? `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="text-align: right; color: #333;">Tax (${taxPercent}%)</td>
                  <td style="text-align: right; font-weight: bold; color: #000;">₹${(grandTotalAmount * (taxPercent / 100)).toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td style="text-align: right;">Total</td>
                  <td style="text-align: right; color: #000;">₹${grandTotalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" class="signature-cell">
                    <div class="signature-text">Authorized Signature</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 60px; font-size: 13px; font-weight: bold; color: #000; font-family: 'Times New Roman', Times, serif; letter-spacing: 0.5px;">
          Thanks for your business...!
        </div>

        <div style="position: fixed; bottom: 15mm; right: 20mm; font-size: 10px; color: #777; font-family: Arial, sans-serif; white-space: nowrap;">
          Downloaded: ${formattedTimestamp}
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
