import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Invoice, Customer } from "./data";

export function generateInvoicePdf(invoice: Invoice, customer?: Customer | null): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4" // 210mm x 297mm
  });

  const pageWidth = doc.internal.pageSize.getWidth();   // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 16;
  let y = margin;

  // Curated Color Palette
  const softGreen: [number, number, number] = [135, 154, 119];  // #879A77 Brand Sage Green
  const deepGreen: [number, number, number] = [22, 163, 74];    // #16A34A Emerald for Paid
  const charcoal: [number, number, number] = [90, 95, 100];     // #5A5F64 Subtext
  const lightGray: [number, number, number] = [226, 232, 240];  // #E2E8F0 Card Borders
  const dividerGray: [number, number, number] = [210, 215, 222];// Subtle Dividers
  const black: [number, number, number] = [17, 24, 39];         // #111827 Text Primary
  const cardBg: [number, number, number] = [250, 249, 246];     // #FAF9F6 Warm Beige Card

  // Format currency with standard Helvetica-safe "Rs. " prefix (eliminates mangled characters)
  const formatRs = (num: number) => `Rs. ${num.toLocaleString("en-IN")}`;

  // 1. Sleek Top Accent Banner
  doc.setFillColor(...softGreen);
  doc.rect(0, 0, pageWidth, 4, "F");

  y += 5;

  // 2. Company Brand & Info (Left Column)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...black);
  doc.text("TAPSH", margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...softGreen);
  doc.text("TAP. CONNECT. GROW.", margin, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);
  doc.text("TAPSH Technologies Private Limited", margin, y + 11.5);
  doc.text("Email: tapsh.support@gmail.com  |  WhatsApp: +91 7977469926", margin, y + 16.5);
  doc.text("Location: Kanyakumari, Tamil Nadu, India", margin, y + 21.5);

  // 3. Invoice Meta Header (Right Column) - STRICTLY NO DUE DATE & NO GST
  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...black);
  doc.text("INVOICE", rightX, y, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...softGreen);
  doc.text(invoice.invoiceNumber, rightX, y + 6, { align: "right" });

  // Issue Date only
  const issueDateStr = new Date(invoice.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...charcoal);
  doc.text(`Issue Date: ${issueDateStr}`, rightX, y + 12, { align: "right" });

  // Payment Mode
  const pMode = invoice.paymentMethod || invoice.paymentMethods?.[0] || "UPI";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...black);
  doc.text(`Payment Mode: ${pMode}`, rightX, y + 17, { align: "right" });

  // Status Badge
  const statusColor: [number, number, number] = 
    invoice.status === "PAID" ? deepGreen :
    invoice.status === "PARTIAL" ? [37, 99, 235] : [217, 119, 6];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...statusColor);
  doc.text(`Status: ${invoice.status}`, rightX, y + 22, { align: "right" });

  // Tapsh Hub Used Indicator
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  if (invoice.tapshHubUsed) {
    doc.setTextColor(...deepGreen);
    doc.text("Tapsh Hub: Deployed", rightX, y + 27, { align: "right" });
  } else {
    doc.setTextColor(...charcoal);
    doc.text("Tapsh Hub: Hardware Only", rightX, y + 27, { align: "right" });
  }

  y += 33;

  // Horizontal Accent Divider
  doc.setDrawColor(...dividerGray);
  doc.setLineWidth(0.2);
  doc.line(margin, y, rightX, y);
  y += 5;

  // 4. Billed To Client Card
  const clientName = invoice.customerDetails?.businessName || customer?.businessName || invoice.customerName || "Valued Enterprise Client";
  const contactPerson = invoice.customerDetails?.contactPerson || customer?.contactPerson || "Primary Contact";
  const address = invoice.customerDetails?.address || customer?.address || "Commercial Premises";
  const city = invoice.customerDetails?.city || customer?.city || "India";
  const phone = invoice.customerDetails?.phone || customer?.phone || "";
  const email = invoice.customerDetails?.email || customer?.email || "";

  doc.setFillColor(...cardBg);
  doc.setDrawColor(...lightGray);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 26, 2.5, 2.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...charcoal);
  doc.text("BILLED TO CLIENT:", margin + 6, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...black);
  doc.text(clientName, margin + 6, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);
  doc.text(`Attn: ${contactPerson}  |  ${address}, ${city}`, margin + 6, y + 17);
  doc.text(`Phone: ${phone || "N/A"}  |  Email: ${email || "N/A"}`, margin + 6, y + 22);

  y += 32;

  // 5. Line Items Table with Generous Row Spacing and Perfect Alignment
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
      valign: "middle",
      cellPadding: { top: 3.8, bottom: 3.8, left: 3, right: 3 },
      lineWidth: 0.15,
      lineColor: [225, 230, 235]
    },
    headStyles: {
      fillColor: softGreen,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      valign: "middle",
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 }
    },
    alternateRowStyles: {
      fillColor: [253, 253, 251]
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: "auto", halign: "left" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 26, halign: "right" },
      4: { cellWidth: 28, halign: "right", fontStyle: "bold" }
    },
    didParseCell: function (data) {
      // Strictly match header text alignment with row data alignment below it
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
  if (y > pageHeight - 75) {
    doc.addPage();
    y = margin + 5;
  }

  // 6. Bottom Balanced Split: Payment Info & Terms (Left) vs Financial Summary Card (Right)
  const totalsCardWidth = 74;
  const totalsCardX = pageWidth - margin - totalsCardWidth;
  const leftColWidth = totalsCardX - margin - 8;

  // Clean, Sanitize legacy notes (Strictly eliminate any GST text)
  const cleanNotes = invoice.notes
    ? invoice.notes
        .replace(/compliant\s+with\s+indian\s+18%\s+gst\s+taxation\s+regulations\.?/gi, "")
        .replace(/18%\s*gst/gi, "")
        .replace(/\bgst\b/gi, "")
        .replace(/\btaxation\b/gi, "")
        .trim()
    : "";

  // Left Column Box 1: Payment Details Card
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...lightGray);
  doc.roundedRect(margin, y, leftColWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...charcoal);
  doc.text("PAYMENT INFORMATION", margin + 5, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);
  const modeLabel = "Payment Mode: ";
  doc.text(modeLabel, margin + 5, y + 12);
  const modeLabelWidth = doc.getTextWidth(modeLabel);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...black);
  doc.text(pMode, margin + 5 + modeLabelWidth, y + 12);

  if (cleanNotes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...charcoal);
    doc.text(`Notes: ${cleanNotes}`, margin + 5, y + 18, {
      maxWidth: leftColWidth - 10
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...charcoal);
    doc.text("Transaction completed via authorized commercial channel.", margin + 5, y + 18);
  }

  // Left Column Box 2: Terms & Product Guarantee
  const termsY = y + 28;
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...lightGray);
  doc.roundedRect(margin, termsY, leftColWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...charcoal);
  doc.text("TERMS & CONDITIONS", margin + 5, termsY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...charcoal);
  doc.text("1. All hardware includes standard TAPSH digital cloud NFC routing.", margin + 5, termsY + 11.5);
  doc.text("2. Physical products carry instant replacement guarantee for transit defects.", margin + 5, termsY + 16.5);
  doc.text("3. For assistance, contact tapsh.support@gmail.com or WhatsApp +91 7977469926.", margin + 5, termsY + 21.5);

  // Right Side: Beautiful Financial Breakdown Card
  const rowCount = 3 + (invoice.discount > 0 ? 1 : 0) + (invoice.deliveryCharges > 0 ? 1 : 0);
  const cardHeight = rowCount * 7 + 12;

  doc.setFillColor(...cardBg);
  doc.setDrawColor(...lightGray);
  doc.roundedRect(totalsCardX, y, totalsCardWidth, cardHeight, 2.5, 2.5, "FD");

  let ty = y + 6.5;
  const labelX = totalsCardX + 5;
  const valX = totalsCardX + totalsCardWidth - 4;

  const renderSummaryRow = (label: string, value: string, isBold = false, valColor = black, fontSize = 8.5) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...charcoal);
    doc.text(label, labelX, ty);
    doc.setTextColor(...valColor);
    doc.text(value, valX, ty, { align: "right" });
    ty += 6.5;
  };

  renderSummaryRow("Subtotal:", formatRs(invoice.subtotal));

  if (invoice.discount > 0) {
    renderSummaryRow("Discount:", `- ${formatRs(invoice.discount)}`, false, deepGreen);
  }

  if (invoice.deliveryCharges && invoice.deliveryCharges > 0) {
    renderSummaryRow("Delivery Charges:", formatRs(invoice.deliveryCharges));
  }

  // Centered Inner Divider Line with equal padding
  ty += 0.5;
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.2);
  doc.line(labelX, ty, valX, ty);
  ty += 5;

  renderSummaryRow("Total Amount:", formatRs(invoice.total), true, black, 9.5);
  renderSummaryRow("Amount Paid:", formatRs(invoice.amountPaid), false, deepGreen, 8.5);

  const balanceDue = invoice.total - invoice.amountPaid;
  renderSummaryRow(
    "Balance Due:", 
    formatRs(Math.max(0, balanceDue)), 
    true, 
    balanceDue > 0 ? [220, 38, 38] : deepGreen,
    9
  );

  // Right Side Item 2: Corporate Executive Authorized Signatory Block
  const sigX = totalsCardX;
  const sigWidth = totalsCardWidth;
  const sigY = Math.max(y + cardHeight + 8, termsY + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...charcoal);
  doc.text("For TAPSH Technologies Private Limited", sigX, sigY + 4);

  // Clean, aligned signature line
  doc.setDrawColor(...dividerGray);
  doc.setLineWidth(0.3);
  doc.line(sigX, sigY + 18, sigX + sigWidth, sigY + 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...black);
  doc.text("Authorized Signatory", sigX, sigY + 22.5);

  // 7. Clean Balanced Footer Notice at Bottom of A4
  const footerY = pageHeight - 12;
  doc.setDrawColor(...lightGray);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...charcoal);
  doc.text(
    "Thank you for your business. This is an authenticated computer-generated invoice issued by TAPSH Technologies.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text(
    "© 2026 TAPSH Technologies Private Limited  •  Official Business Receipt  •  www.tapsh.in",
    pageWidth / 2,
    footerY + 4.5,
    { align: "center" }
  );

  return doc;
}

export function downloadInvoicePdf(invoice: Invoice, customer?: Customer | null): void {
  const doc = generateInvoicePdf(invoice, customer);
  const cleanNumber = invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`TAPSH_Invoice_${cleanNumber}.pdf`);
}
