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
  const margin = 15;
  let y = margin;

  // Primary Colors
  const softGreen: [number, number, number] = [135, 154, 119]; // #879A77
  const charcoal: [number, number, number] = [115, 120, 124];  // #73787C
  const black: [number, number, number] = [20, 20, 20];

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...softGreen);
  doc.rect(margin, y, pageWidth - (margin * 2), 2, "F");
  y += 7;

  // 2. Company Brand & Info (Left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...black);
  doc.text("TAPSH", margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...softGreen);
  doc.text("TAP. CONNECT. GROW.", margin, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);
  doc.text("TAPSH Technologies Private Limited", margin, y + 10);
  doc.text("GSTIN: 29AAACT9812M1Z5", margin, y + 14);
  doc.text("Email: tapsh.support@gmail.com • WhatsApp: +91 7977469926", margin, y + 18);
  doc.text("Location: Kanyakumari, Tamil Nadu, India", margin, y + 22);

  // 3. Invoice Header (Right)
  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...black);
  doc.text("TAX INVOICE", rightX, y, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...softGreen);
  doc.text(invoice.invoiceNumber, rightX, y + 5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);
  doc.text(`Issue Date: ${new Date(invoice.date).toLocaleDateString()}`, rightX, y + 10, { align: "right" });
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, rightX, y + 14, { align: "right" });
  
  // Status Badge
  const statusColor: [number, number, number] = 
    invoice.status === "PAID" ? [22, 163, 74] :
    invoice.status === "PARTIAL" ? [37, 99, 235] : [217, 119, 6];
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...statusColor);
  doc.text(`STATUS: ${invoice.status}`, rightX, y + 19, { align: "right" });

  // "Tapsh Hub used: Yes / No" Badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  if (invoice.tapshHubUsed) {
    doc.setTextColor(22, 163, 74);
    doc.text("Tapsh Hub Used: YES", rightX, y + 24, { align: "right" });
  } else {
    doc.setTextColor(...charcoal);
    doc.text("Tapsh Hub Used: NO", rightX, y + 24, { align: "right" });
  }

  y += 30;

  // 4. Billed To Card
  const clientName = invoice.customerDetails?.businessName || customer?.businessName || invoice.customerName || "Valued Enterprise Client";
  const contactPerson = invoice.customerDetails?.contactPerson || customer?.contactPerson || "Primary Contact";
  const address = invoice.customerDetails?.address || customer?.address || "Commercial Premises";
  const city = invoice.customerDetails?.city || customer?.city || "India";
  const phone = invoice.customerDetails?.phone || customer?.phone || "";
  const email = invoice.customerDetails?.email || customer?.email || "";

  doc.setFillColor(250, 248, 245); // #FAF8F5
  doc.setDrawColor(225, 225, 225);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...charcoal);
  doc.text("BILLED TO CLIENT:", margin + 4, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...black);
  doc.text(clientName, margin + 4, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoal);
  doc.text(`Attn: ${contactPerson}  |  ${address}, ${city}`, margin + 4, y + 15);
  doc.text(`Phone: ${phone || "N/A"}  |  Email: ${email || "N/A"}`, margin + 4, y + 19.5);

  y += 28;

  // 5. Line Items Table (jsPDF-AutoTable)
  const tableData = invoice.items.map((item, index) => [
    (index + 1).toString(),
    item.productName,
    item.quantity.toString(),
    `₹${item.unitPrice.toLocaleString()}`,
    `₹${item.total.toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Item Description", "Qty", "Unit Price", "Total Amount"]],
    body: tableData,
    theme: "striped",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      textColor: black,
      cellPadding: 3
    },
    headStyles: {
      fillColor: softGreen,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left"
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 32, halign: "right", fontStyle: "bold" }
    },
    margin: { left: margin, right: margin }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
  y = finalY + 8;

  // Check if we need space for totals and instructions
  if (y > 230) {
    doc.addPage();
    y = margin;
  }

  // 6. Bottom Split: Payment Instructions (Left) & Totals (Right)
  const rightColWidth = 70;
  const rightColX = pageWidth - margin - rightColWidth;

  // Payment Instructions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...black);
  doc.text("PAYMENT INSTRUCTIONS & BANK DETAILS", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...charcoal);
  doc.text("Direct UPI VPA: tapsh@upi", margin, y + 5);
  doc.text("Bank Name: HDFC Bank Ltd. (Commercial Branch)", margin, y + 9);
  doc.text("Account Number: 50200088192831", margin, y + 13);
  doc.text("IFSC Code: HDFC0000128", margin, y + 17);
  if (invoice.notes) {
    doc.text(`Notes: ${invoice.notes}`, margin, y + 22);
  }

  // Totals Box (Right)
  doc.setFillColor(250, 248, 245);
  doc.setDrawColor(225, 225, 225);
  doc.roundedRect(rightColX, y - 3, rightColWidth, 42, 2, 2, "FD");

  let ty = y + 2;
  const printRow = (label: string, value: string, isBold: boolean = false, textColor = black) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    doc.text(label, rightColX + 3, ty);
    doc.setTextColor(...textColor);
    doc.text(value, rightColX + rightColWidth - 3, ty, { align: "right" });
    ty += 5.5;
  };

  printRow("Subtotal:", `₹${invoice.subtotal.toLocaleString()}`);
  if (invoice.discount > 0) {
    printRow("Discount:", `-₹${invoice.discount.toLocaleString()}`, false, [22, 163, 74]);
  }
  printRow("18% GST:", `₹${invoice.taxAmount.toLocaleString()}`);

  doc.setDrawColor(200, 200, 200);
  doc.line(rightColX + 3, ty - 1, rightColX + rightColWidth - 3, ty - 1);
  ty += 1.5;

  printRow("Total (INR):", `₹${invoice.total.toLocaleString()}`, true, black);
  printRow("Amount Paid:", `₹${invoice.amountPaid.toLocaleString()}`, false, [22, 163, 74]);

  const balanceDue = invoice.total - invoice.amountPaid;
  printRow("Balance Due:", `₹${balanceDue.toLocaleString()}`, true, balanceDue > 0 ? [220, 38, 38] : [22, 163, 74]);

  // 7. Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...charcoal);
  doc.text(
    "Thank you for your business. This is a computer-generated tax invoice issued by TAPSH Technologies.",
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
