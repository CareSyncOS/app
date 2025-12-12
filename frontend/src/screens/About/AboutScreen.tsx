import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Star, Rocket, User, Grid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AboutScreen = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'features' | 'roadmap'>('features');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
                const res = await fetch(`${baseUrl}/app_info.php`);
                const json = await res.json();
                if (json.status === 'success') {
                    setData(json.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="px-4 py-3 pt-[var(--safe-area-inset-top,32px)] mt-0 flex items-center gap-3 sticky top-0 z-10 shrink-0">

                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm transition-colors text-gray-700 dark:text-gray-200">
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-8 pb-20">
                
                {/* Single Main Card */}
                <div className="mx-auto w-full max-w-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden">
                    
                    {/* Card Header */}
                    <div className="relative pt-8 pb-6 px-6 text-center border-b border-gray-100 dark:border-gray-700/50">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent -z-10"></div>
                        
                        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg transform -rotate-6 mb-4 ring-4 ring-white dark:ring-gray-800">
                            <Star className="text-white" size={40} fill="currentColor" />
                        </div>
                        
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">ProSpine</h1>
                        
                        <div className="flex items-center justify-center gap-2 mt-2">
                             <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800/50">
                                 <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">v{data.current.version}</p>
                             </div>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <User size={12} />
                            <span>Developed by <span className="text-gray-600 dark:text-gray-300 font-bold">{data.current.developer}</span></span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="p-2 bg-gray-50/50 dark:bg-gray-900/50 m-4 rounded-xl flex gap-1 relative">
                        <button 
                            onClick={() => setActiveTab('features')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                                activeTab === 'features' 
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' 
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            <Grid size={14} /> My Features
                        </button>
                        <button 
                            onClick={() => setActiveTab('roadmap')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                                activeTab === 'roadmap' 
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-pink-500 dark:text-white' 
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            <Rocket size={14} /> What's Next
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="px-6 pb-8 min-h-[300px]">
                        {activeTab === 'features' ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <p className="text-xs text-gray-500 text-center mb-4 leading-relaxed px-4">
                                    {data.current.description}
                                </p>
                                <div className="space-y-3">
                                    {data.current.features.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-500 group-hover:scale-110 transition-transform">
                                                <CheckCircle2 size={14} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.title}</h4>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 rounded-xl text-white shadow-lg shadow-pink-500/20">
                                     <div className="flex justify-between items-start">
                                         <div>
                                             <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Coming Soon</p>
                                             <h3 className="text-lg font-black mt-1">{data.upcoming.version}</h3>
                                         </div>
                                         <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                             <Rocket size={16} className="text-white" />
                                         </div>
                                     </div>
                                     <p className="text-xs mt-3 font-medium opacity-90">{data.upcoming.headline}</p>
                                     <p className="text-[10px] mt-1 opacity-70">ETA: {data.upcoming.release_date}</p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Planned Updates</h4>
                                    <div className="space-y-4 pl-2 border-l-2 border-dashed border-gray-100 dark:border-gray-700">
                                        {data.upcoming.features.map((feature: string, idx: number) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-gray-800 border-2 border-pink-400"></div>
                                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{feature}</p>
                                            </div>
                                        ))}
                                        <div className="relative pl-6 opacity-50">
                                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                            <p className="text-[10px] italic text-gray-400">More to come...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 text-center">
                         <p className="text-[10px] text-gray-400 font-medium">© 2025 ProSpine</p>
                    </div>
                </div>

            </div>
        </div>
    );
};
