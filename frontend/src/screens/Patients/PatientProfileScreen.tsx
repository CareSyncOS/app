import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Phone, Mail, MapPin, Activity, CreditCard, Stethoscope, Briefcase, UserPlus, Clock, PenTool, Printer, FlaskConical, IndianRupee } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
const ADMIN_URL = 'https://prospine.in/admin';

interface PatientDetail {
  basic: {
    patient_id: string;
    patient_uid: string;
    name: string;
    photo: string;
    status: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    address: string;
    reg_id: string;
    created_at: string;
    referral: string;
    occupation: string;
    chief_complaint: string;
    remarks: string;
    assigned_doctor: string;
  };
  financials: {
    total_billed: number;
    paid: number;
    due: number;
    percentage: number;
  };
  treatment: {
    type: string;
    days: number;
    start_date: string;
    end_date: string;
    cost_per_day: number;
    total_cost: number;
  };
  consultation: {
    type: string;
    date: string;
    amount: number;
    notes: string;
    prescription: string;
  };
  attendance: {
    total_present: number;
    history: Array<{ attendance_date: string; remarks: string }>;
  };
}

const PatientProfileScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [data, setData] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'treatment' | 'financial'>('info');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`${API_URL}/patient_details.php?patient_id=${id}&branch_id=${user?.role === 'admin' ? 1 : 1}`);
        const json = await response.json();
        if (json.status === 'success') {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch patient details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div className="p-4 text-center">Patient not found</div>;

  const { basic, financials, treatment, consultation, attendance } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors pb-safe">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-4 pt-[var(--safe-area-inset-top,32px)] mt-0 shadow-sm sticky top-0 z-10 flex items-center gap-3 transition-colors">

        <button onClick={() => navigate(-1)} className="p-1 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">{basic.name}</h1>
            <p className="text-xs text-start text-gray-500 dark:text-gray-400">#{basic.patient_uid}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-24">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-90"></div>
            <div className="relative pt-12 flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-lg mb-3">
                    <img 
                        src={basic.photo ? `${ADMIN_URL}/${basic.photo}` : `https://ui-avatars.com/api/?name=${basic.name}&background=0D9488&color=fff`} 
                        alt={basic.name} 
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{basic.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border
                        ${basic.status.toLowerCase() === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {basic.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">• {basic.gender}, {basic.age} yrs</span>
                </div>

                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-600">
                    <Stethoscope size={14} className="text-teal-600 dark:text-teal-400" />
                    <span>Dr. {basic.assigned_doctor}</span>
                </div>

                <div className="flex gap-4 mt-6 w-full justify-center">
                    <a href={`tel:${basic.phone}`} className="flex flex-col items-center gap-1 w-16 group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-active:scale-95 transition-transform shadow-sm">
                            <Phone size={20} />
                        </div>
                        <span className="text-[10px] font-medium text-gray-500">Call</span>
                    </a>
                    <a href={`sms:${basic.phone}`} className="flex flex-col items-center gap-1 w-16 group">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center group-active:scale-95 transition-transform shadow-sm">
                            <Mail size={20} />
                        </div>
                        <span className="text-[10px] font-medium text-gray-500">Message</span>
                    </a>
                </div>
            </div>
        </div>

        {/* Action Grid (Drawer Items) */}
        <div className="grid grid-cols-4 gap-2">
            <ActionButton label="Edit Plan" icon={<PenTool size={16} />} color="purple" />
            <ActionButton label="Bill" icon={<Printer size={16} />} color="gray" />
            <ActionButton label="Add Test" icon={<FlaskConical size={16} />} color="teal" />
            <ActionButton label="Pay Dues" icon={<IndianRupee size={16} />} color="indigo" />
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Data" icon={<User size={14} />} />
            <TabButton active={activeTab === 'treatment'} onClick={() => setActiveTab('treatment')} label="Plan" icon={<Activity size={14} />} />
            <TabButton active={activeTab === 'financial'} onClick={() => setActiveTab('financial')} label="Finance" icon={<CreditCard size={14} />} />
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
            <div className="space-y-4 animate-fade-in">
                <Section title="Demographics">
                    <div className="grid grid-cols-2 gap-4">
                         <InfoItem icon={<Briefcase size={14} />} label="Occupation" value={basic.occupation} />
                         <InfoItem icon={<UserPlus size={14} />} label="Referred By" value={basic.referral} />
                         <InfoItem icon={<Clock size={14} />} label="Registered" value={formatDate(basic.created_at)} />
                         <InfoItem icon={<MapPin size={14} />} label="Address" value={basic.address} className="col-span-2" />
                    </div>
                </Section>
                <Section title="Clinical Notes">
                     <div className="space-y-3">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800/30">
                            <p className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase mb-1">Chief Complaint</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{basic.chief_complaint || 'None recorded'}</p>
                        </div>
                        {basic.remarks && (
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Remarks</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{basic.remarks}"</p>
                            </div>
                        )}
                     </div>
                </Section>
            </div>
        )}

        {activeTab === 'treatment' && (
            <div className="space-y-4 animate-fade-in">
                <Section title="Active Plan">
                    <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-bold text-teal-700 dark:text-teal-400">{treatment.type} Plan</h3>
                         <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 text-xs font-bold rounded-full">
                            {attendance.total_present}/{treatment.days} Days
                         </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <StatBox label="Start Date" value={formatDate(treatment.start_date)} />
                        <StatBox label="End Date" value={formatDate(treatment.end_date)} />
                        <StatBox label="Cost/Day" value={formatCurrency(treatment.cost_per_day)} />
                        <StatBox label="Total Cost" value={formatCurrency(treatment.total_cost)} />
                    </div>
                </Section>

                <Section title="Last Consultation">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                         <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">{consultation.type}</span>
                            <span className="text-xs text-gray-500">{formatDate(consultation.date)}</span>
                         </div>
                         {consultation.notes ? (
                            <div className="text-sm text-gray-600 dark:text-gray-300 italic border-l-2 border-teal-500 pl-3">
                                "{consultation.notes}"
                            </div>
                         ) : <span className="text-xs text-gray-400">No notes</span>}
                    </div>
                </Section>

                <Section title={`Attendance (${attendance.total_present})`}>
                    <div className="grid grid-cols-4 gap-2">
                        {attendance.history.map((att, idx) => (
                            <div key={idx} className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-green-800 dark:text-green-300 font-bold uppercase">{new Date(att.attendance_date).toLocaleString('default', { month: 'short' })}</p>
                                <p className="text-lg font-bold text-green-700 dark:text-green-400 leading-none">{new Date(att.attendance_date).getDate()}</p>
                            </div>
                        ))}
                        {attendance.history.length === 0 && <span className="text-sm text-gray-500 col-span-4">No attendance records.</span>}
                    </div>
                </Section>
            </div>
        )}

        {activeTab === 'financial' && (
            <div className="space-y-4 animate-fade-in">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CreditCard size={100} />
                    </div>
                    <p className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">Total Due Balance</p>
                    <p className="text-4xl font-bold mb-6">{formatCurrency(financials.due)}</p>
                    
                    <div className="grid grid-cols-2 gap-8 border-t border-gray-700 pt-6">
                        <div>
                            <p className="text-gray-400 text-xs mb-1">Total Billed</p>
                            <p className="font-semibold text-lg">{formatCurrency(financials.total_billed)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-xs mb-1">Total Paid</p>
                            <p className="font-semibold text-lg text-green-400">{formatCurrency(financials.paid)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-gray-800 dark:text-white">Payment Progress</span>
                        <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{financials.percentage}%</span>
                     </div>
                     <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" style={{ width: `${financials.percentage}%` }}></div>
                     </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        {financials.due > 0 ? `Please collect ${formatCurrency(financials.due)} from patient.` : 'Payment complete.'}
                     </p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

// Components
const TabButton = ({ active, onClick, label, icon }: any) => (
    <button 
        onClick={onClick} 
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all
        ${active ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-300 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
    >
        {icon} {label}
    </button>
);

const Section = ({ title, children }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-widest">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const InfoItem = ({ icon, label, value, className = '' }: any) => (
    <div className={`flex items-start gap-3 ${className}`}>
        <div className="mt-0.5 text-gray-400 dark:text-gray-500">{icon}</div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white break-words leading-tight">{value || 'N/A'}</p>
        </div>
    </div>
);

const StatBox = ({ label, value }: any) => (
    <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">{label}</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm">{value || '-'}</p>
    </div>
);

const ActionButton = ({ label, icon, color }: { label: string, icon: any, color: 'purple' | 'gray' | 'teal' | 'indigo' }) => {
    // Colors mappings could be expanded
    const colorClasses = {
        purple: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
        gray: 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600',
        teal: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
    }[color] || 'bg-gray-50 text-gray-700';

    return (
        <button 
            onClick={() => alert('Feature coming soon!')}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border ${colorClasses} hover:brightness-95 transition-all active:scale-95`}
        >
            {icon}
            <span className="text-[10px] font-bold uppercase">{label}</span>
        </button>
    );
};

export default PatientProfileScreen;
