import { useState, useEffect } from 'react';
import {
  Search,
  ArrowLeft,
  Plus,
  X,
  Wallet,
  CreditCard,
  Banknote,
  Smartphone,
  History as HistoryIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

// Interfaces
interface BillingRecord {
  patient_id: number;
  patient_name: string;
  patient_uid: string | null;
  patient_photo_path: string | null;
  total_billed: number;
  total_paid: number;
  total_due: number;
  status: string;
}

interface PaymentTransaction {
  payment_id: number;
  payment_date: string;
  amount: number;
  mode: string;
  remarks: string;
}

interface BillingDetail {
  patient_id: number;
  patient_name: string;
  phone_number: string;
  assigned_doctor: string;
  total_amount: number;
  total_paid: number;
  due_amount: number;
  today_paid: number;
  payments: PaymentTransaction[];
}

export const BillingScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // List State
  const [patients, setPatients] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Detail State
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<BillingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  // --- Fetch List ---
  const fetchList = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
      const branchId = user?.branch_id || 1;
      const params = new URLSearchParams({
        branch_id: branchId.toString(),
        search: searchQuery,
        status: statusFilter === 'all' ? '' : statusFilter,
        limit: '50'
      });

      const res = await fetch(`${baseUrl}/billing.php?${params.toString()}`);
      const data = await res.json();
      if (data.status === 'success') {
        setPatients(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchList, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  // --- Fetch Detail ---
  const fetchDetail = async (id: number) => {
    setDetailLoading(true);
    setDetailData(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
      const res = await fetch(`${baseUrl}/billing_details.php?patient_id=${id}`);
      const data = await res.json();
      if (data.status === 'success') {
        setDetailData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePatientClick = (id: number) => {
    setSelectedPatientId(id);
    fetchDetail(id);
  };

  // --- Submit Payment ---
  const handleAddPayment = async () => {
    if (!detailData || !paymentAmount) return;
    setProcessing(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
      const payload = {
        patient_id: detailData.patient_id,
        amount: parseFloat(paymentAmount),
        mode: paymentMode,
        remarks: paymentRemarks,
        employee_id: user?.employee_id || 1
      };

      const res = await fetch(`${baseUrl}/add_payment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (result.status === 'success') {
        setShowPaymentModal(false);
        setPaymentAmount('');
        setPaymentRemarks('');
        // Refresh details & list
        fetchDetail(detailData.patient_id);
        fetchList();
      } else {
        alert(result.message || 'Payment failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setProcessing(false);
    }
  };

  // Helper
  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-20 relative">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 pt-[var(--safe-area-inset-top,32px)] mt-0 sticky top-0 z-10 flex items-center gap-3">

        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Billing</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track payments & dues</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 space-y-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
         <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Search patient..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm border-none focus:ring-2 focus:ring-teal-500 dark:text-white"
             />
         </div>
         <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map(s => (
               <button
                 key={s}
                 onClick={() => setStatusFilter(s)}
                 className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${
                   statusFilter === s
                     ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-400'
                     : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                 }`}
               >
                 {s}
               </button>
            ))}
         </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {loading ? (
           <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
        ) : patients.length > 0 ? (
           patients.map(p => (
             <div 
               key={p.patient_id}
               onClick={() => handlePatientClick(p.patient_id)}
               className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-all cursor-pointer"
             >
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{p.patient_name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">UID: {p.patient_uid || p.patient_id}</p>
                   </div>
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                      p.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                   }`}>
                      {p.status}
                   </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                   <div>
                      <p className="text-[10px] text-gray-500 uppercase">Billed</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(p.total_billed)}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-gray-500 uppercase">Paid</p>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(p.total_paid)}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-gray-500 uppercase">Due</p>
                      <p className={`text-sm font-bold ${p.total_due > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                         {formatCurrency(p.total_due)}
                      </p>
                   </div>
                </div>
             </div>
           ))
        ) : (
           <div className="text-center py-12 text-gray-500">No records found</div>
        )}
      </div>

      {/* DETAIL DRAWER / FULL SCREEN MODAL */}
      {selectedPatientId && (
         <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Nav */}
            <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center gap-3 shrink-0">
               <button onClick={() => setSelectedPatientId(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
               </button>
               <h1 className="text-lg font-bold text-gray-900 dark:text-white">Patient Details</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
               {detailLoading || !detailData ? (
                  <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
               ) : (
                  <div className="space-y-6 pb-20">
                     {/* Info Card */}
                     <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start">
                           <div>
                              <h2 className="text-2xl font-bold">{detailData.patient_name}</h2>
                              <p className="opacity-90 text-sm">#{selectedPatientId} • {detailData.phone_number}</p>
                           </div>
                           <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                              <Wallet size={24} className="text-white" />
                           </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="bg-black/20 rounded-xl p-3">
                               <p className="text-xs opacity-70 uppercase">Total Due</p>
                               <p className="text-xl font-bold">₹{detailData.due_amount.toLocaleString()}</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3">
                               <p className="text-xs opacity-70 uppercase">Paid So Far</p>
                               <p className="text-xl font-bold">₹{detailData.total_paid.toLocaleString()}</p>
                            </div>
                        </div>
                     </div>

                     {/* Stats Row */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                           <p className="text-xs text-gray-500 uppercase">Paid Today</p>
                           <p className="text-lg font-bold text-green-600">₹{detailData.today_paid.toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                           <p className="text-xs text-gray-500 uppercase">Total Bill</p>
                           <p className="text-lg font-bold text-gray-900 dark:text-white">₹{detailData.total_amount.toLocaleString()}</p>
                        </div>
                     </div>

                     {/* Payment History */}
                     <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                           <HistoryIcon size={18} className="text-teal-600" /> Transaction History
                        </h3>
                        <div className="space-y-3">
                           {detailData.payments.length > 0 ? (
                              detailData.payments.map((tx) => (
                                 <div key={tx.payment_id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                                          {tx.mode === 'cash' ? <Banknote size={18} /> : 
                                           tx.mode === 'upi' ? <Smartphone size={18} /> : <CreditCard size={18} />}
                                       </div>
                                       <div>
                                          <p className="font-semibold text-gray-900 dark:text-white">{tx.remarks || 'Payment'}</p>
                                          <p className="text-xs text-gray-500">{new Date(tx.payment_date).toLocaleDateString()} • <span className="capitalize">{tx.mode}</span></p>
                                       </div>
                                    </div>
                                    <span className="font-bold text-green-600">+₹{tx.amount}</span>
                                 </div>
                              ))
                           ) : (
                              <div className="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                 <p className="text-gray-500 text-sm">No transactions found</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* FAB: Add Payment */}
            <div className="absolute bottom-6 right-6">
               <button 
                 onClick={() => setShowPaymentModal(true)}
                 className="w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg shadow-teal-600/30 flex items-center justify-center transition-transform active:scale-95"
               >
                 <Plus size={28} />
               </button>
            </div>
         </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
           <div className="relative bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Payment</h3>
                 <button onClick={() => setShowPaymentModal(false)}><X size={20} className="text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Amount</label>
                    <input 
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full text-2xl font-bold p-2 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none border-b-2 border-teal-500 focus:border-teal-600 transition-colors"
                      autoFocus
                    />
                 </div>
                 
                 <div>
                    <label className="text-xs font-medium text-gray-500 uppercase block mb-2">Payment Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['cash', 'upi', 'card', 'other'].map(m => (
                          <button
                            key={m}
                            onClick={() => setPaymentMode(m)}
                            className={`py-2 text-sm font-medium rounded-lg capitalize border transition-all ${
                               paymentMode === m 
                                 ? 'bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' 
                                 : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {m}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Remarks</label>
                    <textarea 
                      value={paymentRemarks}
                      onChange={(e) => setPaymentRemarks(e.target.value)}
                      placeholder="e.g. Cleared dues"
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm border-none focus:ring-1 focus:ring-teal-500"
                    />
                 </div>

                 <button 
                    onClick={handleAddPayment}
                    disabled={processing || !paymentAmount}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl mt-2 disabled:opacity-50 transition-colors shadow-lg shadow-teal-600/20"
                 >
                    {processing ? 'Processing...' : 'Collect Payment'}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
