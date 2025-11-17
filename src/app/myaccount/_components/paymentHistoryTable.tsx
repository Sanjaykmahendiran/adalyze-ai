"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ReceiptText, X } from "lucide-react";
import Cookies from "js-cookie";
import { Card } from "@/components/ui/card";
import InvoicePdf from "./invoice-pdf";
import { axiosInstance } from "@/configs/axios";

const userId = Cookies.get("userId") || "";

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

interface TransactionTableProps {
  userDetails: any;
}

export default function TransactionTable({ userDetails }: TransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        const response = await axiosInstance.get(`?gofor=paymenthistory&user_id=${userId}`);
        const data = response.data;
        setTransactions(data || []);
      } catch (error) {
        console.error("Error fetching payment history:", error);
      }
    };
    fetchData();
  }, []);

  const handleViewInvoice = (transaction: Transaction) => setSelectedTransaction(transaction);
  const handleBackToList = () => setSelectedTransaction(null);

  const filteredTransactions = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.order_id.toLowerCase().includes(term) ||
      t.plan_name.toLowerCase().includes(term) ||
      t.amount.toLowerCase().includes(term) ||
      t.type.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (order_status: number) => {
    if (order_status === 1) return <Badge className="bg-green-600 text-white">Completed</Badge>;
    if (order_status === 0) return <Badge className="bg-red-600 text-white">Failed</Badge>;
    return <Badge className="bg-yellow-500 text-black">Pending</Badge>;
  };

  return (
    <Card className="rounded-2xl bg-black lg:mt-14 w-full p-4 sm:p-6 relative overflow-hidden">
      {!selectedTransaction ? (
        <>
          {/* Header */}
          <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-white">Payment History</h1>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Search transactions"
                  className="pl-10 pr-4 py-2 rounded-md text-sm w-full bg-[#171717] text-gray-200 placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block border rounded-lg overflow-x-auto border-[#1e1e1e]">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-white/80">
                <ReceiptText className="w-18 h-18 text-primary mb-2" />
                <span className="text-lg">No transactions found</span>
              </div>
            ) : (
              <Table className="w-full min-w-[800px]">
                <TableHeader>
                  <TableRow className="bg-[#171717]">
                    <TableHead className="text-left px-4 py-3 font-semibold text-gray-300">
                      Plan
                    </TableHead>
                    <TableHead className="text-left px-4 py-3 font-semibold text-gray-300">
                      Payment ID
                    </TableHead>
                    <TableHead className="text-left px-4 py-3 font-semibold text-gray-300">
                      Date
                    </TableHead>
                    <TableHead className="text-right px-4 py-3 font-semibold text-gray-300">
                      Amount
                    </TableHead>
                    <TableHead className="text-center px-4 py-3 font-semibold text-gray-300">
                      Status
                    </TableHead>
                    <TableHead className="text-center px-4 py-3 font-semibold text-gray-300">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((t) => (
                    <TableRow key={t.id} className="bg-[#1e1e1e] hover:bg-[#2c2c2c]">
                      <TableCell className="px-4 py-3">
                        <div>
                          <div className="font-medium text-white">{t.plan_name}</div>
                          <div className="text-sm text-gray-400">{t.type}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium">{t.payment_id}</TableCell>
                      <TableCell className="px-4 py-3">
                        {new Date(t.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">{t.currency} {t.amount}</TableCell>
                      <TableCell className="px-4 py-3 text-center">{getStatusBadge(t.order_status)}</TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        {t.order_status === 1 ? (
                          <button
                            className="text-primary hover:text-orange-700 transition-colors duration-200 cursor-pointer"
                            onClick={() => handleViewInvoice(t)}
                          >
                            View Invoice
                          </button>
                        ) : t.order_status === 2 ? (
                          <span className="text-gray-500 text-sm">Processing</span>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden mt-4">
            {filteredTransactions.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400">
                <ReceiptText className="w-18 h-18 text-primary mb-2" />
                <span className="text-lg">No transactions found</span>
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <div key={t.id} className="border rounded-lg p-4 shadow-md bg-[#1e1e1e]">
                  <div className="text-lg font-semibold mb-2 text-white">{t.plan_name}</div>
                  <p className="text-sm text-gray-300">Type: {t.type}</p>
                  <p className="text-sm text-gray-300">Order ID: {t.order_id}</p>
                  <p className="text-sm text-gray-300">
                    Date: {new Date(t.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-300">Amount: {t.currency}{t.amount}</p>
                  <p className="text-sm text-gray-300">Payment Method: {t.type}</p>
                  <div className="flex items-center justify-between mt-3">
                    {getStatusBadge(t.order_status)}
                    {t.order_status === 1 && (
                      <button
                        className="text-blue-500 hover:text-blue-700 text-sm transition-colors duration-200"
                        onClick={() => handleViewInvoice(t)}
                      >
                        View Invoice
                      </button>
                    )}
                    {t.order_status === 2 && (
                      <span className="text-gray-500 text-sm">Processing</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <button
              className="text-gray-400 hover:text-white cursor-pointer transition-colors duration-300 flex items-center gap-1"
              onClick={handleBackToList}
            >
              <X size={18} />
              <span className="text-sm">Back</span>
            </button>
          </div>
          <InvoicePdf transaction={selectedTransaction} userDetails={userDetails} />
        </div>
      )}
    </Card>
  );
}
