"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import AdalyzeLogo from "@/assets/adlyze-black-logo.png";

interface Transaction {
  id: string;
  order_id: string;
  payment_id: string;
  razorpay_signature: string;
  package_id: number;
  type: string;
  amount: string;
  currency: string;
  date: string;
  order_status: number;
  plan_name: string;
}

interface InvoicePdfProps {
  transaction: Transaction;
  userDetails: any;
}

export default function InvoicePdf({ transaction, userDetails }: InvoicePdfProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice-${transaction.order_id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const formatInvoiceDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const generateInvoiceNumber = () => {
    const year = new Date(transaction.date).getFullYear();
    return `INV-${transaction.id}-${year}-${transaction.package_id}`;
  };

  return (
    <div className="space-y-4">
      {/* A4-width screen wrapper: 794px ≈ A4 width at 96 PPI */}
      <div className="overflow-x-auto">
        <div className="mx-auto" style={{ width: "794px" }}>
          <div
            ref={invoiceRef}
            // Do not change UI: same inner styling, only constrained to A4 width via parent wrapper
            className="bg-white p-8 font-sans"
            style={{ color: "#000000", backgroundColor: "#ffffff" }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <Image src={AdalyzeLogo} alt="Adalyze Logo" width={200} height={60} />
                <div className="text-sm space-y-1 mt-4" style={{ color: "#374151" }}>
                  <p className="font-medium">Techades eBiz Arena</p>
                  <p>9A, 1st Floor, Chinnakannara Street, Mayiladuthurai</p>
                  <p>TamilNadu, India, 609001</p>
                  <p>GSTIN : 33AZTPK2721N1ZZ</p>
                </div>
              </div>
            </div>

            {/* Billing & Payment Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-bold mb-3" style={{ color: "#111827" }}>
                  BILLED TO
                </h3>
                <div className="text-sm space-y-1" style={{ color: "#374151" }}>
                  <p className="font-medium">{userDetails?.name || userDetails?.username || "N/A"}</p>
                  <p>{userDetails?.email || "N/A"}</p>
                  {userDetails?.phone && <p>{userDetails.phone}</p>}
                  {userDetails?.city && <p>{userDetails.city}</p>}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold mb-4" style={{ color: "#111827" }}>
                  INVOICE
                </h2>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Invoice #</span> {generateInvoiceNumber()}
                  </p>
                  <p>
                    <span className="font-medium">Invoice Date</span> {formatInvoiceDate(transaction.date)}
                  </p>
                  <p>
                    <span className="font-medium">Invoice Amount</span> {transaction.currency} {transaction.amount}
                  </p>
                  <p>
                    <span className="font-medium">Order ID</span> {transaction.order_id}
                  </p>
                  <p>
                    <span className="font-medium">Payment ID</span> {transaction.payment_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="pt-6 mb-6" style={{ borderTop: "1px solid #e5e7eb" }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold" style={{ color: "#111827" }}>
                  DESCRIPTION
                </h3>
                <h3 className="text-sm font-bold" style={{ color: "#111827" }}>
                  AMOUNT ({transaction.currency})
                </h3>
              </div>
              <div
                className="flex justify-between items-center py-4"
                style={{ borderBottom: "1px solid #f3f4f6" }}
              >
                <div>
                  <p className="font-medium" style={{ color: "#374151" }}>
                    {transaction.plan_name}
                  </p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>
                    {transaction.type} Plan
                  </p>
                </div>
                <p className="font-medium" style={{ color: "#374151" }}>
                  {transaction.currency} {transaction.amount}
                </p>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-8">
              <div className="flex justify-between items-center">
                <span style={{ color: "#374151" }}>Sub Total</span>
                <span style={{ color: "#374151" }}>
                  {transaction.currency} {transaction.amount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: "#374151" }}>Tax</span>
                <span style={{ color: "#374151" }}>
                  {transaction.currency} 0.00
                </span>
              </div>
              <div
                className="flex justify-between items-center text-lg font-bold pt-2"
                style={{ borderTop: "1px solid #e5e7eb" }}
              >
                <span style={{ color: "#111827" }}>Total</span>
                <span style={{ color: "#111827" }}>
                  {transaction.currency} {transaction.amount}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-8 text-center space-y-4">
              <h4 className="text-lg font-medium" style={{ color: "#1f2937" }}>
                Thank you for choosing Adalyze AI
              </h4>
              <div className="text-xs space-y-2" style={{ color: "#6b7280" }}>
                <p>This is a system-generated invoice and does not require a signature.</p>
                <p>For any queries regarding this invoice, please contact our support team.</p>
                <p>All amounts are in {transaction.currency}.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 text-center" style={{ borderTop: "1px solid #e5e7eb" }}>
              <p className="text-xs" style={{ color: "#6b7280" }}>
                Techades eBiz Arena | 9A, 1st Floor, Chinnakannara Street, Mayiladuthurai, TamilNadu,
                India - 609001
              </p>
              <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                Website:{" "}
                <a
                  href="https://adalyze.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#db4900", textDecoration: "underline" }}
                >
                  https://adalyze.app
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-end">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200"
          style={{ backgroundColor: "#db4900", color: "#ffffff", border: "none", cursor: "pointer" }}
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>
    </div>
  );
}
