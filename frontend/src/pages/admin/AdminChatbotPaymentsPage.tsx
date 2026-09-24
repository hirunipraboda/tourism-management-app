import React, { useEffect, useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  X,
  DollarSign,
  User,
  Calendar,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { ChatbotPaymentItem } from '../../types/adminTypes';

export const AdminChatbotPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<ChatbotPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPayment, setSelectedPayment] = useState<ChatbotPaymentItem | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchChatbotPayments(searchQuery, selectedStatus);
      setPayments(data);
    } catch (err) {
      console.error('Failed to load chatbot payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPayments();
  };

  const totalRevenue = useMemo(() => {
    return payments
      .filter((p) => p.status === 'Completed' || p.status === 'Successful')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const usageRate = useMemo(() => {
    if (payments.length === 0) return '0%';
    const completed = payments.filter((p) => p.status === 'Completed' || p.status === 'Successful').length;
    return `${((completed / payments.length) * 100).toFixed(1)}%`;
  }, [payments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Chatbot Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor AI Travel Guide package purchases, transaction records, and securely masked payment details.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Purchases</span>
          <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
            {payments.length}
          </div>
          <p className="text-[11px] text-slate-400">Guide tier subscriptions</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Completed Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading">
            ${totalRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">Processed successfully</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Usage Rate</span>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 font-heading">
            {usageRate}
          </div>
          <p className="text-[11px] text-slate-400">Active package utilization</p>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by tourist name, email, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#16A6A1]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Successful', 'Pending', 'Failed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedStatus === status
                  ? 'bg-[#0B3A53] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Transaction ID</th>
                <th className="py-4 px-5">Traveler</th>
                <th className="py-4 px-5">Package Tier</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Payment Method</th>
                <th className="py-4 px-5">Card Details</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No chatbot payment transactions found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isDone = p.status === 'Completed' || p.status === 'Successful';
                  const isPending = p.status === 'Pending';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-[#0B3A53]">{p.id}</td>
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-800">{p.userName}</div>
                        <div className="text-[11px] text-slate-400">{p.userEmail}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-extrabold text-slate-800">{p.packageName}</span>
                        <div className="text-[10px] text-slate-400">{p.queriesAllowed || 50} queries</div>
                      </td>
                      <td className="py-4 px-5 font-black text-[#146C86]">
                        ${p.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-[11px] text-slate-600">
                        {p.maskedCardNumber || 'N/A'}
                      </td>
                      <td className="py-4 px-5 text-slate-500 text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                          {!isDone && !isPending && <XCircle className="w-3 h-3 text-rose-600" />}
                          <span>{p.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="p-2 hover:bg-slate-100 text-slate-600 hover:text-[#0B3A53] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="View Payment Details"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="font-bold text-[11px]">Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-[#16A6A1]" />
                <h2 className="text-lg font-black text-[#0B3A53] font-heading">
                  Transaction Receipt Details
                </h2>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-xs text-sky-950">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Masked Data Compliance</span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed">
                  Only PCI-DSS compliant masked identifiers are retained. CVV and raw PAN are never exposed or stored in platform records.
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Order ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Customer:</span>
                  <span className="font-bold text-slate-800">{selectedPayment.userName} ({selectedPayment.userEmail})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Package Tier:</span>
                  <span className="font-extrabold text-[#0B3A53]">{selectedPayment.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Queries Credited:</span>
                  <span className="font-bold text-emerald-700">{selectedPayment.queriesAllowed || 50} queries</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Payment Method:</span>
                  <span className="font-bold text-slate-800">{selectedPayment.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Masked Card:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPayment.maskedCardNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Amount Charged:</span>
                  <span className="font-black text-lg text-[#146C86]">${selectedPayment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Transaction Time:</span>
                  <span className="font-bold text-slate-700">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Status:</span>
                  <span className="font-extrabold uppercase text-emerald-700">{selectedPayment.status}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
