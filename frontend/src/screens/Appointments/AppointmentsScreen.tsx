import * as React from 'react';
import { useEffect, useState } from 'react';
import { Phone, RefreshCw, ChevronLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';

interface Appointment {
  registration_id: string;
  patient_name: string;
  appointment_time: string;
  appointment_date: string;
  status: string;
  phone_number?: string;
  gender?: string;
  age?: number;
}

const AppointmentsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/appointments.php?branch_id=${user?.role === 'admin' ? 1 : 1}`);
      const json = await response.json();
      if (json.status === 'success') {
        setAppointments(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  // --- Statistics Logic ---
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  
  const todayStats = React.useMemo(() => {
    const todays = appointments.filter(a => a.appointment_date === todayStr);
    return {
        total: todays.length,
        consulted: todays.filter(a => a.status.toLowerCase() === 'consulted').length,
        pending: todays.filter(a => a.status.toLowerCase() === 'pending').length
    };
  }, [appointments, todayStr]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'pending': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'consulted': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'closed': return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  // Group by date
  const groupedAppointments = appointments.reduce((groups, appt) => {
    const date = appt.appointment_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appt);
    return groups;
  }, {} as Record<string, Appointment[]>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 pt-[var(--safe-area-inset-top,32px)] mt-0 shadow-sm sticky top-0 z-10 flex items-center justify-between transition-colors">

        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Appointments</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                 <Calendar size={10} /> This Week
            </p>
          </div>
        </div>
        <button 
          onClick={handleRefresh} 
          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {/* Today's Overview Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
             
             <h3 className="font-bold text-sm uppercase tracking-wide opacity-90 mb-4">Today's Overview</h3>
             
             <div className="flex items-center justify-between text-center divide-x divide-white/20">
                 <div className="flex-1">
                     <p className="text-3xl font-bold">{todayStats.total}</p>
                     <p className="text-xs font-medium opacity-80 uppercase mt-1">Total</p>
                 </div>
                 <div className="flex-1">
                     <p className="text-3xl font-bold">{todayStats.consulted}</p>
                     <p className="text-xs font-medium opacity-80 uppercase mt-1">Consulted</p>
                 </div>
                 <div className="flex-1">
                     <p className="text-3xl font-bold">{todayStats.pending}</p>
                     <p className="text-xs font-medium opacity-80 uppercase mt-1">Pending</p>
                 </div>
             </div>
        </div>

        {/* List */}
        <div className="space-y-6">
            {loading ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div></div>
            ) : appointments.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No appointments this week.
            </div>
            ) : (
            sortedDates.map((date) => (
                <div key={date} className="space-y-3">
                <div className="flex justify-between items-center px-1">
                     <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-wide">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {date === todayStr && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">Today</span>}
                     </h3>
                </div>
                {groupedAppointments[date].map((appt) => (
                    <div key={appt.registration_id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 transition-colors active:scale-[0.99] duration-100">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-xs border border-gray-100 dark:border-gray-600">
                                <span className="font-bold text-lg leading-none">{appt.appointment_time.slice(0, 5)}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-base">{appt.patient_name}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {appt.gender && <span className="capitalize">{appt.gender}</span>}
                                    {appt.age && <span className="w-1 h-1 rounded-full bg-gray-300"></span>}
                                    {appt.age && <span>{appt.age} yrs</span>}
                                </div>
                            </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${getStatusColor(appt.status)}`}>
                            {appt.status}
                        </span>
                    </div>
                    
                    {(appt.phone_number) && (
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-gray-700/50 pt-3 mt-1">
                            {appt.phone_number && (
                                <a href={`tel:${appt.phone_number}`} className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 -ml-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <Phone size={14} /> <span className="font-medium">{appt.phone_number}</span>
                                </a>
                            )}
                        </div>
                    )}
                    </div>
                ))}
                </div>
            ))
            )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsScreen;
