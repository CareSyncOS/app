import * as React from 'react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks';
import { 
  UserPlus, FlaskConical, Wallet, 
  Sun, Moon, RefreshCw, Calendar, User, Clock, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';

interface DashboardStats {
  registration: {
    today: { registration: number; appointments: number };
    total: { registration: number; in_queue: number };
  };
  inquiry: {
    today: { general: number; test_inquiry: number };
    total: { general: number; test_inquiry: number };
  };
  patients: {
    today: { enrolled: number; ongoing: number };
    total: { enrolled: number; discharged: number };
  };
  tests: {
    today: { scheduled: number; conducted: number };
    total: { in_queue: number; conducted: number };
  };
  payments: {
    today: { 
      received: number; 
      dues: number;
      breakdown: { registrations: number; tests: number; treatments: number };
    };
    total: { received: number; dues: number };
  };
  schedule: Array<{
    patient_name: string;
    appointment_time: string;
    status: string;
    type?: string;
  }>;
}

const DashboardScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch_id: user?.role === 'admin' ? 1 : 1 }),
      });
      const json = await response.json();
      if (json.status === 'success') {
        setStats(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // White Card Component matching user screenshot
  const StatCard = ({ 
    title, icon: Icon, colorClass, iconBgClass,
    mainValue, subLabel,
    details 
  }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between">
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${iconBgClass}`}>
                    <Icon size={20} className={colorClass} />
                </div>
                <h3 className="font-bold text-gray-400 dark:text-gray-400 text-xs uppercase tracking-wider">{title}</h3>
            </div>
            
            <div className="mb-6">
                <h2 className={`text-3xl font-bold text-gray-900 dark:text-white mb-1`}>{mainValue}</h2>
                <p className="text-xs text-gray-500 font-medium">{subLabel}</p>
            </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 space-y-2">
            {details.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 px-6 py-4 pt-[var(--safe-area-inset-top,env(safe-area-inset-top))] mt-0 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors duration-200">

        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Overview</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
             <Calendar size={12} /> {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleRefresh} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 ${refreshing ? 'animate-spin' : ''}`}>
             <RefreshCw size={20} />
          </button>
          <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-sm">
             {user?.name?.charAt(0) || <User size={16} />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
         {stats && (
             <>
                 {/* CARDS GRID */}
                 <div className="flex flex-col gap-4">
                     
                     {/* 1. PAYMENTS (Today's Collection) */}
                     <StatCard 
                        title="Today's Collection" 
                        icon={Wallet} 
                        colorClass="text-green-600"
                        iconBgClass="bg-green-50 dark:bg-green-900/20"
                        mainValue={formatCurrency(stats.payments.today.received)}
                        subLabel="Total Received Today"
                        details={[
                            { label: 'New Registrations', value: formatCurrency(stats.payments.today.breakdown.registrations) },
                            { label: 'Diagnostic Tests', value: formatCurrency(stats.payments.today.breakdown.tests) },
                            { label: 'Treatments', value: formatCurrency(stats.payments.today.breakdown.treatments) },
                        ]}
                     />

                     {/* 2. REGISTRATIONS */}
                     <StatCard 
                        title="Registrations" 
                        icon={UserPlus} 
                        colorClass="text-blue-600"
                        iconBgClass="bg-blue-50 dark:bg-blue-900/20"
                        mainValue={stats.registration.today.registration}
                        subLabel="Registered Today"
                        details={[
                            { label: 'Appointments', value: stats.registration.today.appointments },
                            { label: 'In Queue', value: stats.registration.total.in_queue } // Keeping InQueue as useful context
                        ]}
                     />

                     {/* 3. TESTS */}
                     <StatCard 
                        title="Diagnostic Tests" 
                        icon={FlaskConical} 
                        colorClass="text-purple-600"
                        iconBgClass="bg-purple-50 dark:bg-purple-900/20"
                        mainValue={stats.tests.today.scheduled}
                        subLabel="Scheduled Today"
                        details={[
                            { label: 'Conducted Today', value: stats.tests.today.conducted },
                            { label: 'Pending Queue', value: stats.tests.total.in_queue }
                        ]}
                     />

                 </div>

                 {/* Appointments Section */}
                 <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock size={18} /> Upcoming Appointments
                        </h3>
                        <button 
                          onClick={() => navigate('/appointments')}
                          className="text-teal-600 dark:text-teal-400 text-sm font-medium"
                        >
                          View All
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {(!stats.schedule || stats.schedule.length === 0) ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border-dashed border border-gray-200 dark:border-gray-700">
                                <p className="text-gray-400">No upcoming appointments</p>
                            </div>
                        ) : (
                            stats.schedule.map((appt, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                            {appt.appointment_time.slice(0, 5)}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{appt.patient_name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                                appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {appt.status}
                                            </span>
                                            {appt.type && <span className="text-xs text-gray-500 capitalize">• {appt.type}</span>}
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-teal-600">
                                        <CheckCircle size={20} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                 </div>

             </>
         )}
      </div>
    </div>
  );
};

export default DashboardScreen;
