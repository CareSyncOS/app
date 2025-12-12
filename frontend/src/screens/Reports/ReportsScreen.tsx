import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Filter, 
  FlaskConical, UserPlus, Users, MessageSquare,
  DollarSign, Activity, CheckCircle, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

// --- Types ---
interface ReportTotals {
    [key: string]: number | string;
}

interface ReportItem {
    [key: string]: any;
}

// --- Components ---

const StatCard = ({ label, value, subLabel, colorClass, icon: Icon }: any) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${colorClass} text-white shadow-lg`}>
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 opacity-90">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Icon size={14} />
                </div>
                <span className="font-bold text-[10px] uppercase tracking-wider">{label}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{value}</h2>
            <p className="text-[11px] font-medium opacity-80 mt-1">{subLabel}</p>
        </div>
    </div>
);

const TabButton = ({ active, label, onClick, icon: Icon }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            active 
            ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 dark:shadow-none' 
            : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
    >
        <Icon size={16} />
        <span className="hidden sm:inline">{label}</span>
    </button>
);

export const ReportsScreen = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    // State
    const [activeTab, setActiveTab] = useState<'tests' | 'registration' | 'patients' | 'inquiry'>('tests');
    const [loading, setLoading] = useState(false);
    
    // Dates (Defaults to current month)
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Data
    const [data, setData] = useState<ReportItem[]>([]);
    const [totals, setTotals] = useState<ReportTotals | null>(null);

    // Fetch Data
    const fetchReport = async () => {
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
            const branchId = user?.branch_id || 1;
            
            const params = new URLSearchParams({
                branch_id: branchId.toString(),
                type: activeTab,
                start_date: startDate,
                end_date: endDate
            });

            const res = await fetch(`${baseUrl}/reports.php?${params.toString()}`);
            const json = await res.json();
            
            if (json.status === 'success') {
                setData(json.data);
                setTotals(json.totals);
            } else {
                console.error("API Error:", json);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [activeTab, startDate, endDate]);

    const formatCurrency = (n: any) => {
        const num = Number(n);
        return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
    };

    // --- Render Content Based on Tab ---
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-teal-600">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-current"></div>
                    <p className="mt-4 text-sm font-medium animate-pulse">Generating Report...</p>
                </div>
            );
        }

        if (!data.length) {
            return (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                     <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Filter size={24} />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Records Found</h3>
                     <p className="text-sm text-gray-500">Try adjusting the date range.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'tests':
                return (
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard 
                                label="Total Revenue" 
                                value={formatCurrency(totals?.total_sum)} 
                                subLabel="Gross billing amount" 
                                colorClass="bg-gradient-to-br from-indigo-600 to-violet-600" 
                                icon={DollarSign}
                            />
                            <StatCard 
                                label="Collected" 
                                value={formatCurrency(totals?.paid_sum)} 
                                subLabel="Successfully received" 
                                colorClass="bg-gradient-to-br from-emerald-500 to-teal-600" 
                                icon={CheckCircle}
                            />
                            <StatCard 
                                label="Outstanding" 
                                value={formatCurrency(totals?.due_sum)} 
                                subLabel="Pending payments" 
                                colorClass="bg-gradient-to-br from-rose-500 to-orange-500" 
                                icon={Clock}
                            />
                        </div>
                        
                        {/* List */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                           {data.map((item: any, index: number) => (
                               <div key={item.test_id || index} className="p-4 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                   <div className="flex justify-between items-start mb-2">
                                       <div>
                                           <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.patient_name || 'Unknown'}</h4>
                                           <div className="flex items-center gap-2 mt-1">
                                               <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
                                                    {item.test_name}
                                               </span>
                                           </div>
                                       </div>
                                       <div className="text-right">
                                           <p className="font-bold text-teal-600">{formatCurrency(item.total_amount)}</p>
                                           <p className="text-[10px] text-gray-400">{new Date(item.assigned_test_date).toLocaleDateString()}</p>
                                       </div>
                                   </div>
                                   <div className="flex items-center justify-between text-xs text-gray-500">
                                       <span className="flex items-center gap-1"><FlaskConical size={12}/> {item.test_done_by}</span>
                                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                           item.test_status === 'completed' ? 'bg-green-100 text-green-700' : 
                                           item.test_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                       }`}>
                                           {item.test_status}
                                       </span>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                );

            case 'registration':
                return (
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard 
                                label="Consulted Rev" 
                                value={formatCurrency(totals?.consulted_sum)} 
                                subLabel="Completed consultations" 
                                colorClass="bg-gradient-to-br from-indigo-600 to-violet-600" 
                                icon={UserPlus}
                            />
                            <StatCard 
                                label="Pending Rev" 
                                value={formatCurrency(totals?.pending_sum)} 
                                subLabel="Awaiting consultation" 
                                colorClass="bg-gradient-to-br from-amber-500 to-orange-600" 
                                icon={Clock}
                            />
                            <StatCard 
                                label="Closed Rev" 
                                value={formatCurrency(totals?.closed_sum)} 
                                subLabel="Finalized cases" 
                                colorClass="bg-gradient-to-br from-emerald-500 to-teal-600" 
                                icon={CheckCircle}
                            />
                        </div>

                         {/* List */}
                         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                           {data.map((item: any, index: number) => (
                               <div key={item.registration_id || index} className="p-4 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                   <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-3 items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                                item.status === 'consulted' ? 'bg-emerald-500' : 'bg-amber-500'
                                            }`}>
                                                {(item.patient_name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.patient_name || 'Unknown'}</h4>
                                                <p className="text-[10px] text-gray-500">{item.gender} • {item.age} Y</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.consultation_amount)}</p>
                                            <p className="text-[10px] text-gray-400 capitalize">{item.payment_method}</p>
                                        </div>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg mt-2 flex justify-between items-center">
                                         <p className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{item.chief_complain || 'No complaints'}</p>
                                         <span className={`text-[10px] font-bold uppercase ${
                                             item.status === 'consulted' ? 'text-emerald-600' : 'text-amber-600'
                                         }`}>{item.status}</span>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                );
            
            case 'patients':
                return (
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard 
                                label="Total Billed" 
                                value={formatCurrency(totals?.total_sum)} 
                                subLabel="Gross patient revenue" 
                                colorClass="bg-gradient-to-br from-indigo-600 to-violet-600" 
                                icon={DollarSign}
                            />
                            <StatCard 
                                label="Total Paid" 
                                value={formatCurrency(totals?.paid_sum)} 
                                subLabel="Collected amount" 
                                colorClass="bg-gradient-to-br from-emerald-500 to-teal-600" 
                                icon={CheckCircle}
                            />
                            <StatCard 
                                label="Total Due" 
                                value={formatCurrency(totals?.due_sum)} 
                                subLabel="Outstanding balance" 
                                colorClass="bg-gradient-to-br from-rose-500 to-orange-500" 
                                icon={Clock}
                            />
                        </div>

                         {/* List */}
                         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                           {data.map((item: any, index: number) => (
                               <div key={item.patient_id || index} className="p-4 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                   <div className="flex justify-between items-start mb-2">
                                       <div>
                                           <div className="flex items-center gap-2">
                                               <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.patient_name || 'Unknown'}</h4>
                                               <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded">#{item.patient_id}</span>
                                           </div>
                                           <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                <Activity size={12} className="text-teal-500" />
                                                {item.treatment_type}
                                           </div>
                                       </div>
                                       <div className="text-right">
                                           <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.total_amount)}</p>
                                           <div className="flex gap-2 justify-end mt-1 text-[10px]">
                                                <span className="text-emerald-600 font-bold">Pd: {formatCurrency(item.advance_payment)}</span>
                                                {Number(item.due_amount) > 0 && (
                                                    <span className="text-rose-500 font-bold">Due: {formatCurrency(item.due_amount)}</span>
                                                )}
                                           </div>
                                       </div>
                                   </div>
                                   <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
                                       <div className="flex items-center gap-1 text-xs text-gray-400">
                                           <UserPlus size={12} />
                                           {item.assigned_doctor}
                                       </div>
                                       <p className="text-[10px] text-gray-400">{new Date(item.start_date).toLocaleDateString()}</p>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                );

            case 'inquiry':
                return (
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard 
                                label="Total Inquiries" 
                                value={totals?.total_inquiries || 0} 
                                subLabel="All recorded" 
                                colorClass="bg-gradient-to-br from-indigo-600 to-violet-600" 
                                icon={MessageSquare}
                            />
                            <StatCard 
                                label="Converted" 
                                value={totals?.registered_count || 0} 
                                subLabel="Registered" 
                                colorClass="bg-gradient-to-br from-emerald-500 to-teal-600" 
                                icon={UserPlus}
                            />
                            <StatCard 
                                label="New / Pending" 
                                value={totals?.new_count || 0} 
                                subLabel="Awaiting Action" 
                                colorClass="bg-gradient-to-br from-amber-500 to-orange-600" 
                                icon={Clock}
                            />
                        </div>

                         {/* List */}
                         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                           {data.map((item: any, index: number) => (
                               <div key={item.inquiry_id || index} className="p-4 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                   <div className="flex justify-between items-start mb-2">
                                       <div className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                                item.status === 'registered' ? 'bg-emerald-500' : 'bg-gray-400'
                                            }`}>
                                                {(item.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.name || 'Unknown'}</h4>
                                                <p className="text-[10px] text-gray-500">{item.phone_number}</p>
                                            </div>
                                       </div>
                                       <div className="text-right">
                                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                               item.status === 'registered' ? 'bg-emerald-100 text-emerald-700' : 
                                               item.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                           }`}>
                                               {item.status}
                                           </span>
                                       </div>
                                   </div>
                                   <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                                       <span className="text-gray-400 font-bold uppercase text-[10px]">Complaint: </span>
                                       <span className="text-gray-700 dark:text-gray-300">{item.chief_complain}</span>
                                   </div>
                                   <div className="mt-2 text-[10px] text-right text-gray-400">
                                       Source: {item.referralSource} • {new Date(item.created_at).toLocaleDateString()}
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900">
            
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-4 py-3 pt-[var(--safe-area-inset-top,32px)] mt-0 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 sticky top-0 z-10 shrink-0 shadow-sm">

                <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Reports</h1>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {activeTab === 'tests' ? 'Lab revenue & status' : 
                         activeTab === 'registration' ? 'Registrations & consultations' :
                         activeTab === 'patients' ? 'Patient billing overview' : 'Inquiries & conversions'}
                    </p>
                </div>
            </div>

            {/* Controls Section */}
            <div className="px-4 py-3 space-y-3 shrink-0">
                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <TabButton active={activeTab === 'tests'} label="Tests" onClick={() => setActiveTab('tests')} icon={FlaskConical} />
                    <TabButton active={activeTab === 'registration'} label="Reg" onClick={() => setActiveTab('registration')} icon={UserPlus} />
                    <TabButton active={activeTab === 'patients'} label="Patients" onClick={() => setActiveTab('patients')} icon={Users} />
                    <TabButton active={activeTab === 'inquiry'} label="Inquiry" onClick={() => setActiveTab('inquiry')} icon={MessageSquare} />
                </div>
                
                {/* Date Filter */}
                <div className="flex gap-2 items-center bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                   <div className="flex-1 relative">
                       <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"><Calendar size={14}/></span>
                       <input 
                         type="date" 
                         value={startDate} 
                         onChange={(e) => setStartDate(e.target.value)} 
                         className="w-full pl-8 pr-2 py-1.5 text-xs font-bold bg-transparent border-none outline-none text-gray-700 dark:text-gray-200"
                       />
                   </div>
                   <div className="text-gray-300 dark:text-gray-600">→</div>
                   <div className="flex-1 relative">
                       <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"><Calendar size={14}/></span>
                       <input 
                         type="date" 
                         value={endDate} 
                         onChange={(e) => setEndDate(e.target.value)} 
                         className="w-full pl-8 pr-2 py-1.5 text-xs font-bold bg-transparent border-none outline-none text-gray-700 dark:text-gray-200"
                       />
                   </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-20">
                {renderContent()}
            </div>
            
        </div>
    );
};
