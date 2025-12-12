import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  User,
  Phone,
  Calendar,
  MapPin,
  IndianRupee,
  ClipboardList,
  X,
  Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface Registration {
  registration_id: number;
  patient_name: string;
  phone_number: string;
  age: number | string;
  gender: string;
  consultation_type: string;
  reffered_by: string;
  chief_complain: string;
  consultation_amount: number | string;
  created_at: string;
  status: string;
  patient_photo_path: string | null;
  patient_uid: string | null;
  is_patient_created: number;
  // Detail fields
  email?: string;
  address?: string;
  doctor_notes?: string;
  prescription?: string;
  follow_up_date?: string;
  remarks?: string;
  payment_method?: string;
}

interface RegistrationStats {
  total: number;
  pending: number;
  consulted: number;
  cancelled: number;
}

const DetailRow = ({ icon: Icon, label, value, className = '' }: { icon: any, label: string, value: React.ReactNode, className?: string }) => {
  if (!value) return null;
  return (
    <div className={`flex gap-3 ${className}`}>
      <div className="mt-0.5 text-gray-400 shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium text-gray-500 uppercase mb-0.5">{label}</div>
        <div className="text-sm text-gray-900 dark:text-gray-100">{value}</div>
      </div>
    </div>
  );
};

export const RegistrationScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Helper to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fetch Logic
  const fetchRegistrations = async (pageNum: number, search: string) => {
    setLoading(true);
    try {
      const branchId = user?.branch_id || 1;
      const params = new URLSearchParams({
        branch_id: branchId.toString(),
        page: pageNum.toString(),
        limit: '15',
        search: search
      });

      // Use VITE_API_BASE_URL from env or default
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
      const response = await fetch(`${baseUrl}/registrations.php?${params.toString()}`);
      const data = await response.json();

      if (data.status === 'success') {
        setRegistrations(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
        setTotalPages(data.pagination.pages);
        if (data.stats) {
            setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchRegistrations(1, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRegistrations(nextPage, searchQuery);
    }
  };

  const handleCardClick = async (reg: Registration) => {
    setSelectedRegistration(reg); // Show partial data immediately
    setDetailLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
      const response = await fetch(`${baseUrl}/registrations.php?id=${reg.registration_id}&branch_id=${user?.branch_id || 1}`);
      const data = await response.json();
      if (data.status === 'success') {
        setSelectedRegistration(data.data);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'consulted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'closed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    return `https://prospine.in/proadmin/admin/${path}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 pt-[var(--safe-area-inset-top,32px)] mt-0">

        <div className="px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Registrations</h1>
        </div>
        
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        
        {/* Stats Card */}
        {stats && (
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden mb-2">
                 <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
                 
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-sm uppercase tracking-wide opacity-90 flex items-center gap-2">
                         <ClipboardList size={16} /> Overview
                     </h3>
                 </div>
                 
                 <div className="grid grid-cols-4 gap-2 text-center divide-x divide-white/20">
                     <div>
                         <p className="text-2xl font-bold">{stats.total}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Total</p>
                     </div>
                     <div>
                         <p className="text-2xl font-bold">{stats.pending}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Pending</p>
                     </div>
                     <div>
                         <p className="text-2xl font-bold text-green-300">{stats.consulted}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Consulted</p>
                     </div>
                     <div>
                         <p className="text-2xl font-bold text-red-300">{stats.cancelled}</p>
                         <p className="text-[10px] font-medium opacity-80 uppercase mt-1">Cancelled</p>
                     </div>
                 </div>
            </div>
        )}

        {loading && page === 1 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : registrations.length > 0 ? (
          <>
            {registrations.map((reg) => (
              <div 
                key={reg.registration_id}
                onClick={() => handleCardClick(reg)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer border border-gray-100 dark:border-gray-700"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-lg overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                      {reg.patient_photo_path ? (
                        <img src={getImageUrl(reg.patient_photo_path) || ''} alt={reg.patient_name} className="w-full h-full object-cover" />
                      ) : (
                        reg.patient_name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                       <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{reg.patient_name}</h3>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                             {reg.patient_uid ? `#${reg.patient_uid}` : `ID: ${reg.registration_id}`}
                             <span className="mx-1">•</span>
                             {formatDate(reg.created_at)}
                          </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reg.status)}`}>
                        {reg.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} />
                        <span className="truncate">{reg.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <User size={12} />
                         <span>{reg.age} Yrs / {reg.gender}</span>
                      </div>
                       <div className="flex items-center gap-1.5 col-span-2">
                         <Stethoscope size={12} />
                         <span className="truncate">{reg.chief_complain}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination / Load More */}
            {page < totalPages && (
               <div className="flex justify-center pt-2">
                 <button 
                   onClick={loadMore}
                   className="px-6 py-2 bg-white dark:bg-gray-800 text-teal-600 text-sm font-medium rounded-full shadow-sm border border-gray-200 dark:border-gray-700"
                 >
                   Load More
                 </button>
               </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No registrations found</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedRegistration(null)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
              <div>
                 <h2 className="text-lg font-bold text-gray-900 dark:text-white">Details</h2>
                 <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">{selectedRegistration.patient_name}</p>
                    {selectedRegistration.status && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${getStatusColor(selectedRegistration.status)}`}>
                        {selectedRegistration.status}
                      </span>
                    )}
                 </div>
              </div>
              <button 
                onClick={() => setSelectedRegistration(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Patient Status Banner */}
            <div className={`px-6 py-2.5 text-xs font-medium border-b border-gray-100 dark:border-gray-700 flex items-center justify-center ${selectedRegistration.is_patient_created ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
              {selectedRegistration.is_patient_created ? '✓ Patient Record Exists' : '⚠ No Patient Record'}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              {detailLoading ? (
                 <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                 </div>
              ) : (
                <>
                  {/* Info Section */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Personal Info</h3>
                     <DetailRow icon={User} label="Patient Name" value={selectedRegistration.patient_name} />
                     <DetailRow icon={Phone} label="Phone" value={
                        <a href={`tel:${selectedRegistration.phone_number}`} className="text-teal-600 dark:text-teal-400 hover:underline">
                          {selectedRegistration.phone_number}
                        </a>
                     } />
                     <DetailRow icon={User} label="Age / Gender" value={`${selectedRegistration.age} Yrs / ${selectedRegistration.gender}`} />
                     {selectedRegistration.email && <DetailRow icon={User} label="Email" value={selectedRegistration.email} />}
                     {selectedRegistration.address && <DetailRow icon={MapPin} label="Address" value={selectedRegistration.address} />}
                  </div>

                  {/* Clinical Section */}
                   <div className="space-y-4">
                     <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Clinical Details</h3>
                     <DetailRow icon={Stethoscope} label="Chief Complaint" value={selectedRegistration.chief_complain} />
                     <DetailRow icon={ClipboardList} label="Consultation Type" value={selectedRegistration.consultation_type} />
                     <DetailRow icon={User} label="Referred By" value={selectedRegistration.reffered_by} />
                     <DetailRow icon={IndianRupee} label="Amount" value={selectedRegistration.consultation_amount ? `₹ ${selectedRegistration.consultation_amount}` : null} />
                     <DetailRow icon={IndianRupee} label="Payment Method" value={selectedRegistration.payment_method} />
                     <DetailRow icon={Calendar} label="Date" value={formatDate(selectedRegistration.created_at)} />
                     <DetailRow icon={Calendar} label="Follow Up" value={selectedRegistration.follow_up_date} />
                  </div>

                  {/* Notes Section - Only show if present */}
                  {(selectedRegistration.doctor_notes || selectedRegistration.prescription || selectedRegistration.remarks) && (
                    <div className="space-y-4">
                       <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Notes & Remarks</h3>
                       {selectedRegistration.doctor_notes && (
                         <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Doctor Notes</div>
                            <div className="text-sm dark:text-gray-200 whitespace-pre-wrap">{selectedRegistration.doctor_notes}</div>
                         </div>
                       )}
                        {selectedRegistration.prescription && (
                         <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg">
                            <div className="text-xs font-medium text-blue-500 uppercase mb-1">Prescription</div>
                            <div className="text-sm dark:text-gray-200 whitespace-pre-wrap">{selectedRegistration.prescription}</div>
                         </div>
                       )}
                       {selectedRegistration.remarks && (
                         <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg">
                            <div className="text-xs font-medium text-yellow-600 uppercase mb-1">Remarks</div>
                            <div className="text-sm dark:text-gray-200 whitespace-pre-wrap">{selectedRegistration.remarks}</div>
                         </div>
                       )}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationScreen; // Ensure default export
