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
  Compass,
  MapPin,
  RefreshCw,
  Check,
  Sparkles,
  ArrowUpRight,
  Luggage,
  Receipt,
  Layers,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { UnifiedPaymentItem, UnifiedPaymentResponse } from '../../types/adminTypes';

export const AdminChatbotPaymentsPage: React.FC = () => {
  // Tab: 'ALL' | 'TRAVEL_PACKAGE' | 'AI_CHATBOT'
  const [selectedTypeTab, setSelectedTypeTab] = useState<'ALL' | 'TRAVEL_PACKAGE' | 'AI_CHATBOT'>('ALL');

  // Payments & Metrics State from Database
  const [payments, setPayments] = useState<UnifiedPaymentItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    packageRevenue: 0,
    chatbotRevenue: 0,
    totalTransactions: 0,
    packageCount: 0,
    chatbotCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals
  const [selectedPayment, setSelectedPayment] = useState<UnifiedPaymentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // ── Load All Payments from PostgreSQL Database ─────────────────────────────
  const loadPayments = async () => {
    setLoading(true);
    try {
      const res: UnifiedPaymentResponse = await adminService.fetchUnifiedPayments(
        selectedTypeTab,
        selectedStatus,
        searchQuery
      );
      setPayments(res.payments || []);
      if (res.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to load user payments from database', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [selectedTypeTab, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPayments();
  };

  // ── Filtered Payments for current active tab ───────────────────────────────
  const filteredPayments = useMemo(() => {
    if (selectedTypeTab === 'ALL') return payments;
    return payments.filter((p) => p.type === selectedTypeTab);
  }, [payments, selectedTypeTab]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0B3A53] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Refresh Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#16A6A1] mb-1">
            Admin / User Financial Records
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            User Payments & Package Purchases
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Live database ledger automatically recording all customer payments completed for AI chatbot subscriptions and travel package purchases.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => {
              loadPayments();
              showToast('Transactions refreshed from database.');
            }}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2"
            title="Refresh payment records from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#16A6A1] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processed Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Total User Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading">
            ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">All completed transactions</p>
        </div>

        {/* Travel Package Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Travel Package Purchases
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
            ${metrics.packageRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{metrics.packageCount} booked tour packages</p>
        </div>

        {/* AI Chatbot Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            AI Chatbot Subscriptions
          </span>
          <div className="text-2xl sm:text-3xl font-black text-teal-600 font-heading">
            ${metrics.chatbotRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{metrics.chatbotCount} total chatbot users</p>
        </div>

        {/* Total Payments Count */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Total Transactions
          </span>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 font-heading">
            {metrics.totalTransactions}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Recorded in PostgreSQL database</p>
        </div>
      </div>

      {/* Tab Selectors (All Payments / Travel Packages / AI Chatbot) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setSelectedTypeTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedTypeTab === 'ALL'
                ? 'bg-[#0B3A53] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All User Payments ({metrics.totalTransactions})</span>
          </button>

          <button
            onClick={() => setSelectedTypeTab('TRAVEL_PACKAGE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedTypeTab === 'TRAVEL_PACKAGE'
                ? 'bg-[#0B3A53] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Luggage className="w-3.5 h-3.5" />
            <span>Travel Packages ({metrics.packageCount})</span>
          </button>

          <button
            onClick={() => setSelectedTypeTab('AI_CHATBOT')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedTypeTab === 'AI_CHATBOT'
                ? 'bg-[#0B3A53] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Chatbot Purchases ({metrics.chatbotCount})</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Successful', 'Pending', 'Failed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedStatus === status
                  ? 'bg-[#16A6A1] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
          <button
            onClick={() => loadPayments()}
            className="p-2 text-slate-500 hover:text-[#0B3A53] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh database payments"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by order ID, traveler name, email, or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#16A6A1]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <span className="text-xs font-bold text-slate-400">
          Showing {filteredPayments.length} payments recorded in database
        </span>
      </div>

      {/* Unified Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Transaction / Order ID</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Traveler</th>
                <th className="py-4 px-5">Purchased Item / Tier</th>
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
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#16A6A1]" />
                    Loading user payments and transactions from database...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No payment transactions found in database matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isPackage = p.type === 'TRAVEL_PACKAGE';
                  const isDone = p.status === 'Completed' || p.status === 'Successful' || p.paymentStatus === 'Paid';
                  const isPending = p.status === 'Pending' || p.paymentStatus === 'Pending';
                  const amount = Number(p.amount) || 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Transaction ID */}
                      <td className="py-4 px-5">
                        <span
                          onClick={() => setSelectedPayment(p)}
                          className="font-mono font-bold text-[#0B3A53] hover:underline cursor-pointer"
                        >
                          {p.bookingRef || p.id}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {new Date(p.date).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                            isPackage
                              ? 'bg-blue-50 text-blue-800 border border-blue-200/60'
                              : 'bg-teal-50 text-teal-800 border border-teal-200/60'
                          }`}
                        >
                          {isPackage ? <Luggage className="w-3 h-3 text-blue-600" /> : <Sparkles className="w-3 h-3 text-teal-600" />}
                          <span>{p.category}</span>
                        </span>
                      </td>

                      {/* Traveler */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-800">{p.customerName}</div>
                        <div className="text-[11px] text-slate-400">{p.customerEmail}</div>
                      </td>

                      {/* Purchased Item */}
                      <td className="py-4 px-5 max-w-[220px]">
                        <div className="font-black text-slate-800 truncate" title={p.itemTitle}>
                          {p.itemTitle}
                        </div>
                        <div className="text-[10px] text-slate-400">{p.detailsSummary}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5">
                        <span className={`font-black text-base ${amount > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                          ${amount.toFixed(2)}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] whitespace-nowrap">
                          {p.paymentMethod}
                        </span>
                      </td>

                      {/* Masked Card Details */}
                      <td className="py-4 px-5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                          <span>{p.cardDetails || p.maskedCardNumber || 'N/A'}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5 text-slate-500 text-[11px]">
                        {new Date(p.date).toLocaleDateString()}{' '}
                        <span className="text-[10px] text-slate-400">
                          {new Date(p.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Status */}
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
                          <span>{isDone ? 'COMPLETED' : isPending ? 'PENDING' : 'FAILED'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-3 py-1.5 hover:bg-[#0B3A53] hover:text-white text-[#0B3A53] bg-slate-100 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 font-bold text-[11px]"
                          title="View Payment Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
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

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TRANSACTION RECEIPT / DETAILS MODAL                                      */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B3A53] text-white flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#0B3A53] font-heading">
                    Payment Transaction Receipt
                  </h2>
                  <p className="text-[11px] font-mono text-slate-400">
                    ID: {selectedPayment.bookingRef || selectedPayment.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-xs text-sky-900">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Verified PCI-DSS Transaction</span>
                </div>
                <p className="text-[11px] text-sky-800 leading-relaxed font-medium">
                  Transaction safely recorded and linked in the system database. Raw PAN and CVV remain strictly protected under cryptographic isolation.
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 font-semibold">Payment Category</span>
                  <span className="font-extrabold text-[#0B3A53]">{selectedPayment.category}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 font-semibold">Customer / Traveler</span>
                  <span className="font-extrabold text-slate-800">{selectedPayment.customerName}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 font-semibold">Customer Email</span>
                  <span className="font-medium text-slate-700">{selectedPayment.customerEmail}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 font-semibold">Purchased Item / Package</span>
                  <span className="font-extrabold text-[#16A6A1]">{selectedPayment.itemTitle}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 font-semibold">Details / Specifications</span>
                  <span className="font-bold text-slate-700">{selectedPayment.detailsSummary}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 font-semibold">Amount Processed</span>
                  <span className="font-black text-emerald-600 text-sm">${Number(selectedPayment.amount).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 font-semibold">Payment Method</span>
                  <span className="font-bold text-slate-800">{selectedPayment.paymentMethod}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 font-semibold">Masked Card Identifier</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPayment.cardDetails || selectedPayment.maskedCardNumber || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-semibold">Payment Status</span>
                  <span className="font-black text-emerald-600 uppercase">{selectedPayment.status || selectedPayment.paymentStatus}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

