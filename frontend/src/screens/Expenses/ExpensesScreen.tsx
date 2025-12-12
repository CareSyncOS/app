import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Plus, X, User, Hash, AlignLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

// --- Modals ---

const ExpenseDetailsModal = ({ expense, onClose }: { expense: any; onClose: () => void }) => {
    if (!expense) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expense Details</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Voucher No</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.voucher_no}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.expense_date}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Paid To</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.paid_to}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Done By</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.expense_done_by}</p>
                        </div>
                        <div className="col-span-2">
                             <p className="text-xs text-gray-500 font-bold uppercase mb-1">For</p>
                             <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.expense_for}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Amount</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white">₹{Number(expense.amount).toLocaleString()}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Payment Method</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{expense.payment_method}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Status</p>
                            <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${
                                expense.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                expense.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                            }`}>
                                {expense.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                     <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Description</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                            {expense.description || 'No description provided.'}
                        </p>
                    </div>
                     <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Amount in Words</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            {expense.amount_in_words || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddExpenseModal = ({ show, onClose, onSave, loading }: any) => {
    if (!show) return null;
    
    const [formData, setFormData] = useState({
        voucher_no: '',
        expense_date: new Date().toISOString().split('T')[0],
        paid_to: '',
        expense_done_by: '',
        expense_for: '',
        amount: '',
        payment_method: '',
        description: '',
        amount_in_words: ''
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400">Add New Expense</h3>
                        <p className="text-xs text-gray-500">Create a new expense voucher</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="add-expense-form" onSubmit={handleSubmit} className="space-y-4">
                         {/* Row 1 */}
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-[10px] font-bold text-gray-500 uppercase">Voucher No.</label>
                                 <div className="relative mt-1">
                                    <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" name="voucher_no" 
                                        value={formData.voucher_no} onChange={handleChange}
                                        placeholder="Auto-generated"
                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-sm text-gray-900 dark:text-white"
                                    />
                                 </div>
                             </div>
                             <div>
                                 <label className="text-[10px] font-bold text-gray-500 uppercase">Date <span className="text-red-500">*</span></label>
                                 <div className="relative mt-1">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="date" name="expense_date" required
                                        value={formData.expense_date} onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-sm text-gray-900 dark:text-white"
                                    />
                                 </div>
                             </div>
                         </div>

                         {/* Payee */}
                         <div>
                             <label className="text-[10px] font-bold text-gray-500 uppercase">Paid To <span className="text-red-500">*</span></label>
                             <div className="relative mt-1">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" name="paid_to" required placeholder="Recipient Name"
                                    value={formData.paid_to} onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-sm text-gray-900 dark:text-white"
                                />
                             </div>
                         </div>

                         {/* Row 2 */}
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-[10px] font-bold text-gray-500 uppercase">Done By <span className="text-red-500">*</span></label>
                                 <input 
                                     type="text" name="expense_done_by" required 
                                     value={formData.expense_done_by} onChange={handleChange}
                                     className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-sm text-gray-900 dark:text-white"
                                 />
                             </div>
                             <div>
                                 <label className="text-[10px] font-bold text-gray-500 uppercase">Expense For <span className="text-red-500">*</span></label>
                                 <input 
                                     type="text" name="expense_for" required placeholder="e.g. Office"
                                     value={formData.expense_for} onChange={handleChange}
                                     className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-sm text-gray-900 dark:text-white"
                                 />
                             </div>
                         </div>

                         {/* Amount & Method */}
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-[10px] font-bold text-gray-500 uppercase">Amount (₹) <span className="text-red-500">*</span></label>
                                 <div className="relative mt-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                    <input 
                                        type="number" name="amount" required min="1" step="0.01"
                                        value={formData.amount} onChange={handleChange}
                                        className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-sm font-bold text-gray-900 dark:text-white"
                                    />
                                 </div>
                             </div>
                             <div>
                                 <label className="text-[10px] font-bold text-gray-500 uppercase">Method <span className="text-red-500">*</span></label>
                                 <select 
                                     name="payment_method" required
                                     value={formData.payment_method} onChange={handleChange}
                                     className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-sm text-gray-900 dark:text-white appearance-none"
                                 >
                                     <option value="">Select</option>
                                     <option value="cash">Cash</option>
                                     <option value="online">Online / UPI</option>
                                     <option value="card">Card</option>
                                     <option value="cheque">Cheque</option>
                                 </select>
                             </div>
                         </div>

                         {/* Description */}
                         <div>
                             <label className="text-[10px] font-bold text-gray-500 uppercase">Description</label>
                             <div className="relative mt-1">
                                <AlignLeft size={14} className="absolute left-3 top-3 text-gray-400" />
                                <textarea 
                                    name="description" 
                                    value={formData.description} onChange={handleChange}
                                    placeholder="Enter details..."
                                    rows={2}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-sm text-gray-900 dark:text-white resize-none"
                                />
                             </div>
                         </div>
                         
                         {/* Words */}
                         <div>
                             <label className="text-[10px] font-bold text-gray-500 uppercase">Amount in Words</label>
                             <input 
                                 type="text" name="amount_in_words"
                                 value={formData.amount_in_words} onChange={handleChange}
                                 className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-sm text-gray-900 dark:text-white"
                             />
                         </div>
                    </form>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button 
                        form="add-expense-form"
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Save Expense'}
                    </button>
                </div>
             </div>
        </div>
    );
};


export const ExpensesScreen = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    // State
    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    
    // Dates (Defaults to current month)
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Fetch Data
    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
            const branchId = user?.branch_id || 1;
            
            const params = new URLSearchParams({
                branch_id: branchId.toString(),
                start_date: startDate,
                end_date: endDate
            });

            const res = await fetch(`${baseUrl}/expenses.php?${params.toString()}`);
            const json = await res.json();
            
            if (json.status === 'success') {
                setExpenses(json.data);
                setStats(json.stats);
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
        fetchExpenses();
    }, [startDate, endDate]);

    const handleSaveExpense = async (formData: any) => {
        setSaving(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://prospine.in/admin/mobile/api';
            const branchId = user?.branch_id || 1;
            const res = await fetch(`${baseUrl}/expenses.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    branch_id: branchId,
                    user_id: user?.id || 0
                })
            });
            const json = await res.json();
            if (json.status === 'success') {
                setShowAddModal(false);
                fetchExpenses(); // Refresh list
            } else {
                alert("Error: " + json.message);
            }
        } catch (err) {
            alert("Failed to save expense");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (n: any) => {
        const num = Number(n);
        return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900">
            
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-4 py-3 pt-[var(--safe-area-inset-top,32px)] mt-0 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 sticky top-0 z-10 shrink-0 shadow-sm">

                <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Expenses</h1>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Track & Add Vouchers</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="p-2 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Controls */}
            <div className="px-4 py-3 shrink-0">
                <div className="flex gap-2 items-center bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
                   <div className="flex-1 relative">
                       <input 
                         type="date" 
                         value={startDate} 
                         onChange={(e) => setStartDate(e.target.value)} 
                         className="w-full text-xs font-bold bg-transparent border-none outline-none text-gray-700 dark:text-gray-200"
                       />
                   </div>
                   <div className="text-gray-300 dark:text-gray-600">→</div>
                   <div className="flex-1 relative">
                       <input 
                         type="date" 
                         value={endDate} 
                         onChange={(e) => setEndDate(e.target.value)} 
                         className="w-full text-xs font-bold bg-transparent border-none outline-none text-gray-700 dark:text-gray-200"
                       />
                   </div>
                </div>

                {/* Combined Overview Card */}
                {stats && (
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="flex justify-between items-center text-center divide-x divide-indigo-500/50 relative z-10">
                            <div className="flex-1 px-1">
                                <p className="text-[10px] uppercase font-bold text-indigo-200 mb-1">Spent</p>
                                <h3 className="text-lg font-black tracking-tight">{formatCurrency(stats.total_amount)}</h3>
                            </div>
                            <div className="flex-1 px-1">
                                <p className="text-[10px] uppercase font-bold text-indigo-200 mb-1">Budget</p>
                                <h3 className="text-lg font-black tracking-tight">{formatCurrency(stats.daily_budget)}</h3>
                            </div>
                            <div className="flex-1 px-1">
                                <p className="text-[10px] uppercase font-bold text-indigo-200 mb-1">Left</p>
                                <h3 className={`text-lg font-black tracking-tight ${Number(stats.remaining_today) < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                                    {formatCurrency(stats.remaining_today)}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                            <p className="text-xs">Loading...</p>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm font-medium text-gray-500">No expenses found</p>
                    </div>
                ) : (
                    expenses.map((item, index) => (
                        <div 
                            key={item.expense_id || index} 
                            onClick={() => setSelectedExpense(item)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.99] transition-transform cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.paid_to || 'Unknown'}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.expense_for}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.amount)}</p>
                                    <span className={`text-[10px] font-bold uppercase ${
                                        item.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'
                                    }`}>{item.status}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 border-t border-gray-50 dark:border-gray-700 pt-2">
                                <span className="font-medium bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500">#{item.voucher_no}</span>
                                <span>{new Date(item.expense_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            <AddExpenseModal 
                show={showAddModal} 
                onClose={() => setShowAddModal(false)} 
                onSave={handleSaveExpense}
                loading={saving}
            />
            
            <ExpenseDetailsModal 
                expense={selectedExpense} 
                onClose={() => setSelectedExpense(null)} 
            />
        </div>
    );
};
