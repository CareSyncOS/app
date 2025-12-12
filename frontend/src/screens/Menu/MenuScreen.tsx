import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    UserPlus, 
    ClipboardList, 
    QrCode, 
    Receipt, 
    Wallet, 
    BarChart3, 
    TestTube2, 
    Headphones
} from 'lucide-react';

const MenuScreen: React.FC = () => {
    const navigate = useNavigate();

    const menuItems = [
        { 
            id: 'inquiry', 
            label: 'Inquiry', 
            desc: 'Manage leads & requests',
            icon: <ClipboardList size={24} />, 
            color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
            link: '/inquiry'
        },
        { 
            id: 'registration', 
            label: 'Registration', 
            desc: 'Add new patient',
            icon: <UserPlus size={24} />, 
            color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
            link: '/registration'
        },
        { 
            id: 'attendance', 
            label: 'Attendance', 
            desc: 'Mark daily visits',
            icon: <QrCode size={24} />, 
            color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
            link: '/attendance'
        },
        { 
            id: 'billing', 
            label: 'Billing', 
            desc: 'Invoices & payments',
            icon: <Receipt size={24} />, 
            color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
            link: '/billing'
        },
        { 
            id: 'tests', 
            label: 'Tests', 
            desc: 'Lab tests management',
            icon: <TestTube2 size={24} />, 
            color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
            link: '/tests'
        },
        { 
            id: 'reports', 
            label: 'Reports', 
            desc: 'Analytics & stats',
            icon: <BarChart3 size={24} />, 
            color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
            link: '/reports'
        },
        { 
            id: 'expenses', 
            label: 'Expenses', 
            desc: 'Track clinic spending',
            icon: <Wallet size={24} />, 
            color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
            link: '/expenses'
        },
        { 
            id: 'support', 
            label: 'Support', 
            desc: 'Help & documentation',
            icon: <Headphones size={24} />, 
            color: 'bg-gray-50 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400',
            link: '/support'
        }
    ];

    const handleNavigation = (link: string, label: string) => {
        if (link === '/inquiry' || link === '/registration' || link === '/attendance' || link === '/billing' || link === '/tests' || link === '/reports' || link === '/expenses' || link === '/support') {
            navigate(link);
        } else {
            navigate('/menu-placeholder', { state: { title: label } });
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors pb-safe">
            <div className="bg-white dark:bg-gray-800 px-6 py-4 pt-[var(--safe-area-inset-top,32px)] mt-0 shadow-sm sticky top-0 z-10 transition-colors">

                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">All modules & tools</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="grid grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => handleNavigation(item.link, item.label)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-start text-left hover:shadow-md transition-all active:scale-95"
                        >
                            <div className={`p-3 rounded-xl mb-3 ${item.color}`}>
                                {item.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.label}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{item.desc}</p>
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => navigate('/about')}
                    className="w-full mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl border border-teal-100 dark:border-teal-800/30 flex items-center justify-between group active:scale-[0.99] transition-all"
                >
                    <div className="text-left">
                        <h3 className="font-bold text-teal-800 dark:text-teal-300">About This App</h3>
                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">Version 1.0.0 & Features</p>
                    </div>
                    <div className="px-4 py-2 bg-teal-600 group-hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors">
                        View
                    </div>
                </button>

                <div className="mt-8 mb-4 text-center space-y-1">
                    <p className="text-xs font-bold text-gray-400">v1.0.0</p>
                    <p className="text-[10px] text-gray-300 dark:text-gray-600">Created by <span className="font-bold text-gray-400 dark:text-gray-500">Sumit Srivastava</span></p>
                </div>
            </div>
        </div>
    );
};

export default MenuScreen;
