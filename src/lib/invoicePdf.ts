import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Invoice, Customer } from "./data";

export function generateInvoicePdf(invoice: Invoice, customer?: Customer | null): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // Harmonious Color Palette
  const softGreen: [number, number, number] = [135, 154, 119];  // #879A77 Brand Sage Green
  const deepGreen: [number, number, number] = [22, 163, 74];    // #16A34A Emerald for Paid
  const charcoal: [number, number, number] = [90, 95, 100];     // #5A5F64 Subtext
  const lightGray: [number, number, number] = [226, 232, 240];  // #E2E8F0 Borders
  const black: [number, number, number] = [17, 24, 39];         // #111827 Text Primary
  const cardBg: [number, number, number] = [250, 249, 246];     // #FAF9F6 Warm Beige Card

  // Format currency with standard Helvetica-safe "Rs. " prefix
  const formatRs = (num: number) => `Rs. ${num.toLocaleString("en-IN")}`;

  // 1. Sleek Top Accent Banner
  doc.setFillColor(...softGreen);
  doc.rect(0, 0, pageWidth, 3, "F");

  y += 4;

  // 2. Company Brand & Info (Left Column)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...black);
  doc.text("TAPSH", margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...softGreen);
  doc.text("TAP. CONNECT. GROW.", margin, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);
  doc.text("TAPSH Technologies Private Limited", margin, y + 10);
  doc.text("Email: tapsh.support@gmail.com  |  WhatsApp: +91 7977469926", margin, y + 14.5);
  doc.text("Location: Kanyakumari, Tamil Nadu, India", margin, y + 19);

  // 3. Invoice Meta Header (Right Column) - STRICTLY NO DUE DATE & NO GST
  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...black);
  doc.text("INVOICE", rightX, y, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...softGreen);
  doc.text(invoice.invoiceNumber, rightX, y + 5, { align: "right" });

  // Issue Date only
  const issueDateStr = new Date(invoice.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);
  doc.text(`Issue Date: ${issueDateStr}`, rightX, y + 10, { align: "right" });

  // Payment Mode
  const pMode = invoice.paymentMethod || invoice.paymentMethods?.[0] || "UPI";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...black);
  doc.text(`Payment Mode: ${pMode}`, rightX, y + 14.5, { align: "right" });

  // Status Badge
  const statusColor: [number, number, number] = 
    invoice.status === "PAID" ? deepGreen :
    invoice.status === "PARTIAL" ? [37, 99, 235] : [217, 119, 6];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...statusColor);
  doc.text(`Status: ${invoice.status}`, rightX, y + 19, { align: "right" });

  // Tapsh Hub Used Indicator
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  if (invoice.tapshHubUsed) {
    doc.setTextColor(...deepGreen);
    doc.text("Tapsh Hub: Deployed", rightX, y + 23.5, { align: "right" });
  } else {
    doc.setTextColor(...charcoal);
    doc.text("Tapsh Hub: Hardware Only", rightX, y + 23.5, { align: "right" });
  }

  y += 28;

  // 4. Billed To Client Card
  const clientName = invoice.customerDetails?.businessName || customer?.businessName || invoice.customerName || "Valued Enterprise Client";
  const contactPerson = invoice.customerDetails?.contactPerson || customer?.contactPerson || "Primary Contact";
  const address = invoice.customerDetails?.address || customer?.address || "Commercial Premises";
  const city = invoice.customerDetails?.city || customer?.city || "India";
  const phone = invoice.customerDetails?.phone || customer?.phone || "";
  const email = invoice.customerDetails?.email || customer?.email || "";

  doc.setFillColor(...cardBg);
  doc.setDrawColor(...lightGray);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 23, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...charcoal);
  doc.text("BILLED TO CLIENT:", margin + 5, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...black);
  doc.text(clientName, margin + 5, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...charcoal);
  doc.text(`Attn: ${contactPerson}  |  ${address}, ${city}`, margin + 5, y + 14.5);
  doc.text(`Phone: ${phone || "N/A"}  |  Email: ${email || "N/A"}`, margin + 5, y + 19);

  y += 27;

  // 5. Line Items Table with Flawless Alignment & Helvetica Currency
  const tableData = invoice.items.map((item, index) => [
    (index + 1).toString(),
    item.productName,
    item.quantity.toString(),
    formatRs(item.unitPrice),
    formatRs(item.total)
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Item Description", "Qty", "Unit Price", "Total Amount"]],
    body: tableData,
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      textColor: black,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
      lineWidth: 0.1,
      lineColor: [230, 230, 230]
    },
    headStyles: {
      fillColor: softGreen,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 }
    },
    alternateRowStyles: {
      fillColor: [252, 252, 250]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto", halign: "left" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 36, halign: "right", fontStyle: "bold" }
    },
    didParseCell: function (data) {
      // Ensure table header text alignment strictly matches the column alignment below it
      if (data.section === "head") {
        if (data.column.index === 0 || data.column.index === 2) {
          data.cell.styles.halign = "center";
        } else if (data.column.index === 3 || data.column.index === 4) {
          data.cell.styles.halign = "right";
        } else {
          data.cell.styles.halign = "left";
        }
      }
    },
    margin: { left: margin, right: margin }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
  y = finalY + 8;

  // Page break check if near bottom
  if (y > pageHeight - 55) {
    doc.addPage();
    y = margin;
  }

  // 6. Bottom Split: Clean Payment Mode (Left) & Precision Totals Card (Right)
  const totalsCardWidth = 74;
  const totalsCardX = pageWidth - margin - totalsCardWidth;

  // Left Side: Payment Mode & Notes ONLY (Strictly NO bank statement / account numbers)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...black);
  doc.text("PAYMENT INFORMATION", margin, y + 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);
  doc.text(`Payment Mode: `, margin, y + 7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...black);
  doc.text(pMode, margin + 24, y + 7.5);

  if (invoice.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...charcoal);
    doc.text(`Notes: ${invoice.notes}`, margin, y + 13.5, {
      maxWidth: totalsCardX - margin - 8
    });
  }

  // Right Side: Beautiful Financial Breakdown Card
  const rowCount = 3 + (invoice.discount > 0 ? 1 : 0) + (invoice.deliveryCharges > 0 ? 1 : 0);
  const cardHeight = rowCount * 6 + 10;

  doc.setFillColor(...cardBg);
  doc.setDrawColor(...lightGray);
  doc.roundedRect(totalsCardX, y - 2, totalsCardWidth, cardHeight, 2, 2, "FD");

  let ty = y + 3.5;
  const cardPadding = 4.5;
  const labelX = totalsCardX + cardPadding;
  const valX = totalsCardX + totalsCardWidth - cardPadding;

  const renderSummaryRow = (label: string, value: string, isBold = false, valColor = black) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    doc.text(label, labelX, ty);
    doc.setTextColor(...valColor);
    doc.text(value, valX, ty, { align: "right" });
    ty += 5.8;
  };

  renderSummaryRow("Subtotal:", formatRs(invoice.subtotal));

  if (invoice.discount > 0) {
    renderSummaryRow("Discount:", `- ${formatRs(invoice.discount)}`, false, deepGreen);
  }

  if (invoice.deliveryCharges && invoice.deliveryCharges > 0) {
    renderSummaryRow("Delivery Charges:", formatRs(invoice.deliveryCharges));
  }

  // Divider Line
  doc.setDrawColor(...lightGray);
  doc.line(labelX, ty - 1, valX, ty - 1);
  ty += 2;

  renderSummaryRow("Total Amount:", formatRs(invoice.total), true, black);
  renderSummaryRow("Amount Paid:", formatRs(invoice.amountPaid), false, deepGreen);

  const balanceDue = invoice.total - invoice.amountPaid;
  renderSummaryRow(
    "Balance Due:", 
    formatRs(Math.max(0, balanceDue)), 
    true, 
    balanceDue > 0 ? [220, 38, 38] : deepGreen
  );

  // 7. Clean Footer Notice
  const footerY = pageHeight - 9;
  doc.setDrawColor(...lightGray);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...charcoal);
  doc.text(
    "Thank you for your business. This is an authenticated computer-generated invoice issued by TAPSH Technologies.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return doc;
}

export function downloadInvoicePdf(invoice: Invoice, customer?: Customer | null): void {
  const doc = generateInvoicePdf(invoice, customer);
  const cleanNumber = invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`TAPSH_Invoice_${cleanNumber}.pdf`);
}
