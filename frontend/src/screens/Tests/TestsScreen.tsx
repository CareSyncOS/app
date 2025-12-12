import { useState, useEffect } from 'react';
import { 
  Search, ArrowLeft, FlaskConical, Calendar, DollarSign, 
  User, Phone, Users, Cake, Stethoscope, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

// Types
interface TestHeader {
  test_id: number;
  test_uid: string;
  patient_name: string;
  age: number;
  gender: string;
  phone_number: string;
  alternate_phone_no: string | null;
  dob: string | null;
  parents: string | null;
  relation: string | null;
  test_name: string; 
  total_amount: number;
  advance_amount: number;
  due_amount: number;
  discount: number;
  payment_status: string;
  test_status: string;
  created_at: string;
  items?: TestItem[]; 
}

interface TestItem {
  item_id: number;
  test_name: string;
  limb: string | null;
  assigned_test_date: string;
  test_done_by: string;
  referred_by: string | null;
  total_amount: number;
  discount: number;
  advance_amount: number;
  due_amount: number;
  payment_method: string;
  test_status: string;
  payment_status: string;
}

interface TestStats {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
}

export const TestsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // List State
  const [tests, setTests] = useState<TestHeader[]>([]);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail State
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<TestHeader | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // --- Fetch List ---
  const fetchTests = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
      const branchId = user?.branch_id || 1;
      const params = new URLSearchParams({
        branch_id: branchId.toString(),
        search,
        test_status: statusFilter === 'all' ? '' : statusFilter,
        limit: '50'
      });
      
      const res = await fetch(`${baseUrl}/tests.php?${params.toString()}`);
      const json = await res.json();
      if (json.status === 'success') {
        setTests(json.data);
        if (json.stats) {
            setStats(json.stats);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchTests, 500);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  // --- Fetch Detail ---
  const fetchDetail = async (id: number) => {
    setDetailLoading(true);
    setDetailData(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
      const res = await fetch(`${baseUrl}/test_details.php?id=${id}`);
      const json = await res.json();
      if (json.status === 'success') {
        setDetailData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCardClick = (id: number) => {
    setSelectedTestId(id);
    fetchDetail(id);
  };

  const formatCurrency = (n: number | undefined | null) => {
      if (n === undefined || n === null || isNaN(n)) return '₹0';
      return `₹${Number(n).toLocaleString('en-IN')}`;
  };

  // Helper Components for Detail View
  const InfoRow = ({ label, value, icon: Icon }: { label: string, value: string | null | undefined, icon: any }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-400">
            <Icon size={14} />
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{value || 'N/A'}</p>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-20 relative">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 pt-[var(--safe-area-inset-top,32px)] mt-0 sticky top-0 z-10 flex items-center gap-3">

        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div>
           <h1 className="text-lg font-bold text-gray-900 dark:text-white">Tests Overview</h1>
           <p className="text-xs text-gray-500 dark:text-gray-400">Manage lab tests</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-3 space-y-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Search patient or test..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm border-none focus:ring-2 focus:ring-teal-500 dark:text-white"
             />
          </div>
          <div className="flex gap-2 text-xs overflow-x-auto no-scrollbar">
             {['all', 'pending', 'completed', 'cancelled'].map(s => (
                <button 
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg border capitalize whitespace-nowrap transition-colors ${
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
         
         {/* Stats Card */}
         {stats && (
            <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden mb-2">
                 <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
                 
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-sm uppercase tracking-wide opacity-90 flex items-center gap-2">
                         <FlaskConical size={16} /> Global Stats
                     </h3>
                 </div>
                 
                 <div className="grid grid-cols-4 gap-2 text-center divide-x divide-white/20">
                     <div className="px-1">
                         <p className="text-xl font-bold">{stats.total}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Total</p>
                     </div>
                     <div className="px-1">
                         <p className="text-xl font-bold text-yellow-300">{stats.pending}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Pending</p>
                     </div>
                     <div className="px-1">
                         <p className="text-xl font-bold text-green-300">{stats.completed}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Completed</p>
                     </div>
                     <div className="px-1">
                         <p className="text-xl font-bold text-red-300">{stats.cancelled}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Cancelled</p>
                     </div>
                 </div>
            </div>
         )}


         {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
         ) : tests.length > 0 ? (
            tests.map(t => (
               <div 
                 key={t.test_id} 
                 onClick={() => handleCardClick(t.test_id)}
                 className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
               >
                  <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl ${
                     t.test_status === 'completed' ? 'bg-green-100 text-green-700' :
                     t.test_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                     'bg-red-100 text-red-700'
                  }`}>
                     {t.test_status}
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                     <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 shrink-0">
                        <FlaskConical size={20} />
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{t.patient_name}</h3>
                        <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1 uppercase tracking-wide">{t.test_name || 'No Test Name'}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{t.test_uid || `#${t.test_id}`} • {new Date(t.created_at).toLocaleDateString()}</p>
                     </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-gray-50 dark:border-gray-700">
                     <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase">Total</p>
                        <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(t.total_amount)}</p>
                     </div>
                     <div className="text-center border-l border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] text-gray-400 uppercase">Paid</p>
                        <p className="font-bold text-green-600">{formatCurrency(t.advance_amount)}</p>
                     </div>
                     <div className="text-center border-l border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] text-gray-400 uppercase">Due</p>
                        <p className={`font-bold ${t.due_amount > 0 ? 'text-red-500' : 'text-gray-400'}`}>{formatCurrency(t.due_amount)}</p>
                     </div>
                  </div>
               </div>
            ))
         ) : (
            <div className="text-center py-20 text-gray-400">No tests found</div>
         )}
      </div>

      {/* FULL SCREEN DETAIL MODAL */}
      {selectedTestId && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col animate-in slide-in-from-right duration-200">
           {/* Modal Header */}
           <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 sticky top-0 z-10">
               <button onClick={() => setSelectedTestId(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                   <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
               </button>
               <div>
                   <h2 className="text-lg font-bold text-gray-900 dark:text-white">Test Details</h2>
               </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 bg-gray-50 dark:bg-gray-900/50">
              {detailLoading || !detailData ? (
                 <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    
                    {/* Patient Information Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4 border-b border-gray-50 dark:border-gray-700 pb-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                                <User size={16} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Patient Information</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                            <InfoRow label="Patient Name" value={detailData.patient_name} icon={User} />
                            <InfoRow label="Age / Gender" value={`${detailData.age} Y / ${detailData.gender}`} icon={Users} />
                            <InfoRow label="Phone" value={detailData.phone_number} icon={Phone} />
                            <InfoRow label="Alt Phone" value={detailData.alternate_phone_no} icon={Phone} />
                            <InfoRow label="DOB" value={detailData.dob} icon={Cake} />
                            <InfoRow label="Parent/Guardian" value={`${detailData.parents} (${detailData.relation})`} icon={Users} />
                        </div>
                    </div>

                    {/* Financial Summary Card - Global */}
                    <div className="bg-gradient-to-tr from-teal-700 to-teal-600 rounded-xl p-5 text-white shadow-lg md:col-span-2">
                         <div className="flex items-center gap-2 mb-4 opacity-90">
                             <DollarSign size={18} />
                             <span className="font-bold text-sm uppercase tracking-wide">Financial Overview</span>
                         </div>
                         <div className="grid grid-cols-4 gap-2 text-center">
                              <div>
                                  <p className="text-[10px] uppercase opacity-70 mb-1">Total</p>
                                  <p className="text-xl font-bold">{formatCurrency(detailData.total_amount)}</p>
                              </div>
                              <div className="border-l border-white/20">
                                  <p className="text-[10px] uppercase opacity-70 mb-1">Discount</p>
                                  <p className="text-xl font-bold">{formatCurrency(detailData.discount)}</p>
                              </div>
                              <div className="border-l border-white/20">
                                  <p className="text-[10px] uppercase opacity-70 mb-1">Paid</p>
                                  <p className="text-xl font-bold">{formatCurrency(detailData.advance_amount)}</p>
                              </div>
                              <div className="border-l border-white/20">
                                  <p className="text-[10px] uppercase opacity-70 mb-1">Due</p>
                                  <p className="text-xl font-bold">{formatCurrency(detailData.due_amount)}</p>
                              </div>
                         </div>
                    </div>

                    {/* TEST ITEMS LIST */}
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">Test Items ({detailData.items?.length || 0})</h4>
                        
                        {detailData.items && detailData.items.map((item) => (

                            <div key={item.item_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                {/* Item Header */}
                                <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="mt-1 w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                                            <FlaskConical size={16} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{item.test_name}</h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Calendar size={10} /> {item.assigned_test_date}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                        item.test_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {item.test_status}
                                    </span>
                                </div>

                                {/* Clinical Details Grid */}
                                <div className="p-4 bg-gray-50/30 dark:bg-gray-800 text-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                                        {item.limb && <InfoRow label="Limb" value={item.limb} icon={Activity} />}
                                        <InfoRow label="Performed By" value={item.test_done_by} icon={User} />
                                        <div className="col-span-1 sm:col-span-2">
                                            <InfoRow label="Referred By" value={item.referred_by} icon={Stethoscope} />
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Details - Explicit Row */}
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 grid grid-cols-4 gap-2 items-center text-center">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(item.total_amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Paid</p>
                                        <p className="text-sm font-bold text-green-600">{formatCurrency(item.advance_amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Due</p>
                                        <p className="text-sm font-bold text-red-500">{formatCurrency(item.due_amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Method</p>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase truncate">{item.payment_method}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {!detailData.items?.length && (
                            <div className="p-8 text-center bg-white rounded-xl border border-dashed text-gray-400">No test items found.</div>
                        )}
                    </div>

                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
