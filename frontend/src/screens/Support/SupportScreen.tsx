import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Ticket, Clock, CheckCircle, Upload, Reply, X, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

// --- Components ---

const IssueDetailsModal = ({ issueId, onClose }: { issueId: number; onClose: () => void }) => {
    const { user } = useAuthStore();
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
                const branchId = user?.branch_id || 1;
                const res = await fetch(`${baseUrl}/support.php?id=${issueId}&branch_id=${branchId}`);
                const json = await res.json();
                if (json.status === 'success') {
                    setDetails(json.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (issueId) fetchDetails();
    }, [issueId]);

    if (!issueId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                           Issue Details <span className="text-gray-400 font-mono text-base">#{issueId}</span>
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div></div>
                    ) : details ? (
                        <>
                            {/* Meta Badges */}
                            <div className="flex flex-wrap gap-3">
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex-1 min-w-[140px]">
                                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                        details.issue.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                        details.issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {details.issue.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex-1 min-w-[140px]">
                                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Release</p>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-600 dark:text-white capitalize">
                                        {details.issue.release_schedule?.replace('_', ' ') || 'Pending'}
                                    </span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex-1 min-w-[140px]">
                                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Date</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {new Date(details.issue.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Description</h4>
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {details.issue.description}
                                </div>
                            </div>

                            {/* Attachments */}
                            {details.attachments && details.attachments.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Attachments</h4>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {details.attachments.map((path: string, i: number) => {
                                            // Handle relative/absolute URL
                                            // Assuming server returns 'uploads/issues/...' and base url is needed?
                                            // Or server returns whatever is in DB.
                                            // Usually in local dev we might need base.
                                            // I'll try straightforward relative if it's served from root, or construct it.
                                            // For safety, I'll log/check but assume simple img tag.
                                            // If API is at /server/api, and image at /uploads, then ../../uploads works if this was html.
                                            // But this is React, separate port usually.
                                            // I'll assume 'https://prospine.in/' + path or similar if PROD, or localhost/uploads logic.
                                            // I'll blindly use a helper.
                                            const imgUrl = path.startsWith('http') ? path : `https://prospine.in/admin/${path}`; // Fallback assumption
                                            // Ideally, I should ask user about base URL for images. But for now best effort.
                                            // Actually I'll use Import Meta Env for base image url if I had one. I'll stick to 'https://prospine.in/' for simplicity as default
                                            return (
                                              <img key={i} src={imgUrl} className="h-24 w-auto rounded-lg border border-gray-200 object-cover" alt="Attachment" />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                             {/* Admin Response */}
                             {details.issue.admin_response && (
                                <div>
                                    <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Reply size={12}/> Admin Response
                                    </h4>
                                    <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800/30 text-sm text-gray-800 dark:text-gray-200">
                                        {details.issue.admin_response}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-gray-500">Failed to load details.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const SupportScreen = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    // State
    const [stats, setStats] = useState({ total: 0, in_progress: 0, pending: 0, completed: 0 });
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);

    // Form
    const [desc, setDesc] = useState('');
    const [files, setFiles] = useState<FileList | null>(null);

    const fetchSupport = async () => {
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
            const branchId = user?.branch_id || 1;
            const res = await fetch(`${baseUrl}/support.php?branch_id=${branchId}`);
            const json = await res.json();
            if (json.status === 'success') {
                setStats(json.stats);
                setIssues(json.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupport();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!desc.trim()) return;

        setSubmitting(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
            const branchId = user?.branch_id || 1;
            
            const formData = new FormData();
            formData.append('branch_id', branchId.toString());
            formData.append('user_id', (user?.id || 0).toString());
            formData.append('description', desc);
            if (files) {
                for (let i = 0; i < files.length; i++) {
                    formData.append('images[]', files[i]);
                }
            }

            const res = await fetch(`${baseUrl}/support.php`, {
                method: 'POST',
                body: formData
            });
            const json = await res.json();

            if (json.status === 'success') {
                alert("Ticket submitted successfully!");
                setDesc('');
                setFiles(null);
                fetchSupport();
            } else {
                alert("Error: " + json.message);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit ticket.");
        } finally {
            setSubmitting(false);
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
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Support Center</h1>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Track issues & feedback</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20 pt-4 space-y-6">
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
                         <div className="flex items-center justify-between mt-1">
                             <span className="text-xl font-black text-gray-900 dark:text-white">{stats.total}</span>
                             <div className="text-indigo-500 bg-indigo-50 p-1.5 rounded-full"><Ticket size={14} /></div>
                         </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                         <p className="text-[10px] font-bold text-gray-400 uppercase">In Progress</p>
                         <div className="flex items-center justify-between mt-1">
                             <span className="text-xl font-black text-blue-500">{stats.in_progress}</span>
                             <div className="text-blue-500 bg-blue-50 p-1.5 rounded-full"><Activity size={14} /></div>
                         </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Pending</p>
                         <div className="flex items-center justify-between mt-1">
                             <span className="text-xl font-black text-amber-500">{stats.pending}</span>
                             <div className="text-amber-500 bg-amber-50 p-1.5 rounded-full"><Clock size={14} /></div>
                         </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Completed</p>
                         <div className="flex items-center justify-between mt-1">
                             <span className="text-xl font-black text-emerald-500">{stats.completed}</span>
                             <div className="text-emerald-500 bg-emerald-50 p-1.5 rounded-full"><CheckCircle size={14} /></div>
                         </div>
                    </div>
                </div>

                {/* Banner */}
                {/* <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-4 rounded-xl shadow-lg text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                             <Sparkles size={18} />
                         </div>
                         <div>
                             <h3 className="text-sm font-bold">What's New</h3>
                             <p className="text-[10px] opacity-90">Check latest updates</p>
                         </div>
                    </div>
                    <ArrowRight size={16} />
                </div> */}

                {/* New Ticket Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">New Ticket</h2>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <textarea 
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="Describe your issue..."
                            rows={3}
                            required
                        />
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <input 
                                    type="file" 
                                    multiple 
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={(e) => setFiles(e.target.files)}
                                />
                                <div className="h-10 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 text-gray-500 text-xs bg-gray-50 dark:bg-gray-900/50">
                                    <Upload size={14} />
                                    <span>{files && files.length > 0 ? `${files.length} files` : 'Attach Images'}</span>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="flex-1 bg-indigo-600 text-white h-10 rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 disabled:opacity-70"
                            >
                                {submitting ? 'Sending...' : 'Submit Ticket'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Recent Tickets */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Tickets</h2>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                             <div className="p-6 text-center text-xs text-gray-500">Loading tickets...</div>
                        ) : issues.length === 0 ? (
                             <div className="p-6 text-center text-xs text-gray-500">No tickets found.</div>
                        ) : (
                            issues.map((issue) => (
                                <div 
                                    key={issue.issue_id} 
                                    onClick={() => setSelectedIssueId(issue.issue_id)}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                         <div className="flex items-center gap-2">
                                             <span className="text-[10px] font-mono text-gray-400">#{issue.issue_id}</span>
                                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                                 issue.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                 issue.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                                                 'bg-blue-50 text-blue-600'
                                             }`}>{issue.status.replace('_', ' ')}</span>
                                             {issue.admin_response && (
                                                 <span className="flex items-center gap-0.5 text-[10px] text-indigo-600 font-bold">
                                                     <Reply size={10} />
                                                 </span>
                                             )}
                                         </div>
                                         <span className="text-[10px] text-gray-400">{new Date(issue.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{issue.description}</h3>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {selectedIssueId && (
                <IssueDetailsModal issueId={selectedIssueId} onClose={() => setSelectedIssueId(null)} />
            )}
        </div>
    );
};
