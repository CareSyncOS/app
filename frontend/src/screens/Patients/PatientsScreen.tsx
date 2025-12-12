import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, Activity, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';

interface Patient {
  patient_id: string;
  patient_name: string;
  phone_number: string;
  age: number;
  gender: string;
  treatment_type: string;
  status: string;
  total_amount: number;
  due_amount: number;
}

interface PatientStats {
  total: number;
  active: number;
  completed: number;
  inactive: number;
}

const PatientsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Debounce ref
  const timeoutRef = useRef<number | null>(null);

  const fetchPatients = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    
    try {
      const currentPage = reset ? 1 : page;
      const query = new URLSearchParams({
        page: currentPage.toString(),
        search: search
      });

      const res = await fetch(`${API_URL}/patients.php?${query.toString()}`);
      const json = await res.json();
      
      if (json.status === 'success') {
        if (reset) {
          setPatients(json.data);
        } else {
          setPatients(prev => [...prev, ...json.data]);
        }
        
        // Update stats if available (and usually on first load or search reset)
        if (json.stats) {
            setStats(json.stats);
        }
        
        setHasMore(json.data.length === 20);
        if (!reset) setPage(prev => prev + 1);
        else setPage(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search Effect
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = window.setTimeout(() => {
      fetchPatients(true);
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [search]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 pt-[var(--safe-area-inset-top,32px)] mt-0 shadow-sm sticky top-0 z-10 transition-colors">

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Patients</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search patients..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        
        {/* Stats Card */}
        {stats && (
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden mb-2">
                 <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
                 
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-sm uppercase tracking-wide opacity-90 flex items-center gap-2">
                         <Users size={16} /> Patient Overview
                     </h3>
                 </div>
                 
                 <div className="grid grid-cols-4 gap-2 text-center divide-x divide-white/20">
                     <div>
                         <p className="text-2xl font-bold">{stats.total}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Total</p>
                     </div>
                     <div>
                         <p className="text-2xl font-bold">{stats.active}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Active</p>
                     </div>
                     <div>
                         <p className="text-2xl font-bold text-yellow-300">{stats.inactive}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Inactive</p>
                     </div>
                     <div>
                         <p className="text-2xl font-bold text-green-300">{stats.completed}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Completed</p>
                     </div>
                 </div>
            </div>
        )}

        {patients.length === 0 && !loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No patients found.
          </div>
        ) : (
          patients.map((patient) => (
            <div 
                key={patient.patient_id} 
                onClick={() => navigate(`/patients/${patient.patient_id}`)}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold uppercase
                  ${patient.gender === 'Female' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}
                `}>
                  {patient.patient_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{patient.patient_name}</h3>
                      {patient.due_amount > 0 && (
                          <span className="text-xs font-bold text-red-600 dark:text-red-400 whitespace-nowrap ml-2">
                             Due: {formatCurrency(patient.due_amount)}
                          </span>
                      )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                       <Activity size={12} className="text-teal-500" /> {patient.treatment_type}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase
                        ${patient.status === 'active' || patient.status === 'ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}
                    `}>
                        {patient.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
            </div>
          ))
        )}

        {/* Load More Trigger */}
        {hasMore && patients.length > 0 && (
          <button 
            onClick={() => fetchPatients(false)}
            disabled={loading}
            className="w-full py-3 text-teal-600 dark:text-teal-400 font-medium text-sm disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientsScreen;
