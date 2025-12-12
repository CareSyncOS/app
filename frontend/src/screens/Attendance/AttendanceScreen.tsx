import { useState, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface AttendanceRecord {
  patient_id: number;
  patient_name: string;
  patient_uid: string | null;
  patient_photo_path: string | null;
  phone_number: string;
  treatment_type: string;
  treatment_days: number;
  session_count: number;
  is_present: boolean;
  attended_date: string | null;
  cost_per_day: number;
  effective_balance: number;
  due_amount?: number;
}

interface AttendanceStats {
    total_active: number;
    present: number;
    absent: number;
}

export const AttendanceScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<AttendanceRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Confirmation State
  const [showConfirm, setShowConfirm] = useState(false);

  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [historyData, setHistoryData] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const branchId = user?.branch_id || 1;
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
      const params = new URLSearchParams({
        branch_id: branchId.toString(),
        date: selectedDate,
        search: searchQuery,
        status: filter,
        limit: '50' // Fetch more for scrolling
      });

      const response = await fetch(`${baseUrl}/attendance.php?${params.toString()}`);
      const data = await response.json();

      if (data.status === 'success') {
        setPatients(data.data);
        if (data.stats) {
            setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (patientId: number) => {
    setHistoryLoading(true);
    setHistoryData(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
      const response = await fetch(`${baseUrl}/attendance_history.php?patient_id=${patientId}`);
      const data = await response.json();
      if (data.status === 'success') {
        setHistoryData(data.data);
      }
    } catch (error) {
      console.error('History fetch error', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleCardClick = (patient: AttendanceRecord) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
    setCurrentMonth(new Date()); // Reset calendar to current month
    fetchHistory(patient.patient_id);
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendance();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filter, selectedDate]);

  const handleMarkClick = (patient: AttendanceRecord) => {
    // Check balance
    // Logic: if effective balance >= cost_per_day, ask for confirmation (Auto Mark)
    // Else, open payment modal
    
    // Note: effective_balance can be negative if they owe money.
    const hasBalance = patient.effective_balance >= patient.cost_per_day;
    
    setSelectedPatient(patient);
    setPaymentAmount('');
    setPaymentMode('');
    setRemarks('');

    if (hasBalance) {
      // Auto Mark confirmation
      setShowConfirm(true);
    } else {
      // Payment Required
      const needed = Math.max(0, patient.cost_per_day - patient.effective_balance);
      setPaymentAmount(Math.ceil(needed).toString()); // Suggest amount
      setShowPaymentModal(true);
    }
  };

  const submitAttendance = async (withPayment: boolean) => {
    if (!selectedPatient) return;
    setProcessing(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
      
      const payload = {
        patient_id: selectedPatient.patient_id,
        employee_id: user?.employee_id || 1, // Fallback
        payment_amount: withPayment ? parseFloat(paymentAmount) : 0,
        mode: withPayment ? paymentMode : '',
        remarks: remarks
      };

      const response = await fetch(`${baseUrl}/mark_attendance.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        // Success Toast could be here
        setShowPaymentModal(false);
        setShowConfirm(false);
        fetchAttendance(); // Refresh list
      } else {
        alert(result.message || 'Error marking attendance');
      }

    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit attendance');
    } finally {
      setProcessing(false);
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    // Handle specific path logic if needed, e.g. path starts with /
    return `https://prospine.in/proadmin/admin/${path.replace(/^\//, '')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 pt-[var(--safe-area-inset-top,32px)] mt-0">

        <div className="px-4 py-3 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')}
                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Daily Visits</h1>
           </div>
           
           {/* Date Navigation */}
           <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1">
                 <button 
                   onClick={() => changeDate(-1)}
                   className="p-1 px-2 text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
                 >
                   <ChevronLeft size={16} />
                 </button>
                 
                 <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200 w-24 justify-center">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                 </div>

                 <button 
                   onClick={() => changeDate(1)}
                   className="p-1 px-2 text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
                 >
                   <ChevronRight size={16} />
                 </button>
           </div>
        </div>

        {/* Search & Filter */}
        <div className="px-4 pb-3 space-y-3">
           {/* Search */}
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input
               type="text"
               placeholder="Search patient..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500 dark:text-white"
             />
           </div>

           {/* Filter Tabs */}
           <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
              {(['all', 'present', 'absent'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                    filter === f 
                      ? 'bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-400 shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        
        {/* Stats Card */}
        {stats && (
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden mb-2">
                 <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
                 
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-sm uppercase tracking-wide opacity-90 flex items-center gap-2">
                         <Calendar size={16} /> Daily Overview
                     </h3>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2 text-center divide-x divide-white/20">
                     <div className="px-2">
                         <p className="text-2xl font-bold">{stats.total_active}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Scheduled</p>
                     </div>
                     <div className="px-2">
                         <p className="text-2xl font-bold">{stats.present}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Present</p>
                     </div>
                     <div className="px-2">
                         <p className="text-2xl font-bold text-yellow-300">{stats.absent}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Pending</p>
                     </div>
                 </div>
            </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : patients.length > 0 ? (
          patients.map((patient) => {
            const progress = patient.treatment_days > 0 
                ? Math.min(100, (patient.session_count / patient.treatment_days) * 100) 
                : 0;

            return (
              <div 
                key={patient.patient_id}
                onClick={() => handleCardClick(patient)}
                className={`rounded-xl p-4 border transition-all active:scale-[0.98] cursor-pointer ${
                  patient.is_present 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' 
                    : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm'
                }`}
              >
                <div className="flex gap-4">
                  {/* Photo */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400 font-bold overflow-hidden">
                       {patient.patient_photo_path ? (
                         <img src={getImageUrl(patient.patient_photo_path) || ''} alt="" className="w-full h-full object-cover" />
                       ) : (
                         patient.patient_name.charAt(0).toUpperCase()
                       )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{patient.patient_name}</h3>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                           <span>#{patient.patient_uid || patient.patient_id}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                           <span className="uppercase">{patient.treatment_type}</span>
                        </div>
                      </div>
                      
                      {patient.is_present ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                           <CheckCircle size={12} /> Present
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md dark:bg-gray-700">Absent</span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                       <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{patient.session_count} / {patient.treatment_days || '∞'}</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${patient.is_present ? 'bg-green-500' : 'bg-teal-500'}`} 
                            style={{ width: `${progress}%` }}
                          ></div>
                       </div>
                    </div>
                    
                    {/* Action Footer */}
                    {!patient.is_present && (
                       <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                          <div className={`text-xs font-medium ${patient.effective_balance < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                             Bal: ₹{patient.effective_balance.toFixed(0)}
                          </div>
                          
                          
                          <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               handleMarkClick(patient);
                             }}
                             className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform"
                          >
                             <CheckCircle size={14} /> Mark Present
                          </button>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
             <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
               <Calendar size={32} className="text-gray-400" />
             </div>
             <p className="text-gray-500 dark:text-gray-400">No patients found</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal (Auto Mark) */}
      {showConfirm && selectedPatient && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
             <div className="relative bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in zoom-in-95">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mark Attendance?</h3>
                    <p className="text-sm text-gray-500 mt-2">
                       This will mark <b>{selectedPatient.patient_name}</b> as present for today. 
                       <br/>Balance is sufficient.
                    </p>
                </div>
                <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm text-gray-500 font-medium">Cancel</button>
                    <button 
                       onClick={() => submitAttendance(false)}
                       disabled={processing}
                       className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg font-medium"
                    >
                       {processing ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
             </div>
         </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPatient && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
             <div className="relative bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Required</h3>
                         <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                            <AlertCircle size={12} />
                            Insufficient Balance
                         </p>
                    </div>
                    <button onClick={() => setShowPaymentModal(false)}><X size={20} className="text-gray-400" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                       <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Amount (₹)</label>
                       <input 
                         type="number"
                         value={paymentAmount}
                         onChange={(e) => setPaymentAmount(e.target.value)}
                         className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-lg font-bold"
                       />
                    </div>

                    <div>
                       <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Mode</label>
                       <div className="grid grid-cols-2 gap-2">
                          {['cash', 'upi', 'card', 'other'].map(m => (
                              <button
                                key={m}
                                onClick={() => setPaymentMode(m)}
                                className={`py-2 text-sm font-medium rounded-lg capitalize border ${
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
                         value={remarks}
                         onChange={(e) => setRemarks(e.target.value)}
                         rows={2}
                         className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm border-none focus:ring-0"
                         placeholder="Optional notes..."
                       />
                    </div>

                    <button 
                       onClick={() => submitAttendance(true)}
                       disabled={processing || !paymentAmount || !paymentMode}
                       className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {processing ? 'Processing...' : 'Pay & Mark Present'}
                    </button>
                </div>
             </div>
         </div>
      )}


      {/* Detail Modal with Calendar */}
      {showDetailModal && selectedPatient && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
             <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl flex flex-col animate-in zoom-in-95 max-h-[85vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{selectedPatient.patient_name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">#{selectedPatient.patient_uid || selectedPatient.patient_id} • {selectedPatient.treatment_type}</p>
                    </div>
                    <button onClick={() => setShowDetailModal(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {historyLoading ? (
                        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
                    ) : historyData ? (
                        <>
                           {/* Stats */}
                           <div className="grid grid-cols-3 gap-2">
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl text-center">
                                 <div className="text-xs text-gray-500 uppercase">Total</div>
                                 <div className="font-bold text-gray-900 dark:text-white">{historyData.stats.total_days}</div>
                              </div>
                              <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl text-center">
                                 <div className="text-xs text-teal-600 dark:text-teal-400 uppercase">Present</div>
                                 <div className="font-bold text-teal-700 dark:text-teal-300">{historyData.stats.present_count}</div>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl text-center">
                                 <div className="text-xs text-gray-500 uppercase">Remaining</div>
                                 <div className="font-bold text-gray-900 dark:text-white">{historyData.stats.remaining}</div>
                              </div>
                           </div>

                           {/* Calendar Grid */}
                           <div>
                              <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">Attendance History</h4>
                                  <div className="flex gap-1">
                                      <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronLeft size={16} /></button>
                                      <span className="text-sm font-medium w-32 text-center">
                                          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                      </span>
                                      <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronRight size={16} /></button>
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
                                  {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="text-gray-400 py-1">{d}</div>)}
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                  {(() => {
                                      const year = currentMonth.getFullYear();
                                      const month = currentMonth.getMonth();
                                      const firstDay = new Date(year, month, 1).getDay();
                                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                                      const days = [];
                                      
                                      // Empty slots
                                      for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
                                      
                                      // Days
                                      for (let d = 1; d <= daysInMonth; d++) {
                                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                          const isPresent = historyData.history.some((h: any) => h.attendance_date === dateStr);
                                          const isToday = dateStr === new Date().toISOString().split('T')[0];

                                          days.push(
                                              <div 
                                                key={d} 
                                                className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium relative
                                                    ${isPresent 
                                                        ? 'bg-green-500 text-white shadow-sm' 
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                                    }
                                                    ${isToday ? 'ring-2 ring-teal-500 z-10' : ''}
                                                `}
                                                title={dateStr}
                                              >
                                                {d}
                                              </div>
                                          );
                                      }
                                      return days;
                                  })()}
                              </div>
                              <div className="flex gap-4 mt-4 text-xs">
                                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Present</div>
                                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-sm"></span> Absent</div>
                              </div>
                           </div>
                        </>
                     ) : (
                        <div className="text-gray-500 text-center">No loaded data</div>
                     )}
                </div>
             </div>
         </div>
      )}

    </div>
  );
};
