import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, ClipboardList, RotateCcw, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils';

export const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Provas', path: '/exams', icon: ClipboardList },
        { name: 'Alunos', path: '/students', icon: GraduationCap },
    ];

    return (
        <div className="min-h-screen w-full bg-[#0a0f1d] flex flex-col md:flex-row">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-md p-6 sticky top-0 h-screen">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <RotateCcw className="text-white w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Gabarito.io
                    </span>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                                location.pathname === item.path
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            )}
                        >
                            <item.icon className={cn('w-5 h-5', location.pathname === item.path ? 'text-blue-400' : 'group-hover:text-slate-100')} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:text-red-400" />
                        <span className="font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <RotateCcw className="text-blue-500 w-6 h-6" />
                    <span className="text-lg font-bold text-white">Gabarito.io</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-slate-950 p-6 flex flex-col pt-20">
                    <nav className="space-y-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-4 rounded-xl text-lg',
                                    location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
                                )}
                            >
                                <item.icon className="w-6 h-6" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-4 rounded-xl text-red-400 bg-red-500/5 w-full text-lg mt-10"
                        >
                            <LogOut className="w-6 h-6" />
                            <span>Sair</span>
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 w-full overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
};
