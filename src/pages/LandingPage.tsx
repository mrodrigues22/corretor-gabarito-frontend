import { useNavigate } from 'react-router-dom';
import {
    RotateCcw,
    ClipboardCheck,
    Zap,
    ArrowRight,
    Search,
    QrCode
} from 'lucide-react';

export const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0f1d] text-slate-100 font-sans selection:bg-blue-500/30">
            {/* Technical Grid Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:200px_200px] border-l border-t border-slate-800"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-blue-500 flex items-center justify-center bg-blue-500/10">
                            <RotateCcw className="text-blue-400 w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tighter">
                            GABARITO<span className="text-blue-500">.IO</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:block text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-all font-bold tracking-tight uppercase text-sm"
                        >
                            Começar Agora
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 border border-slate-700 bg-slate-800/50 text-xs font-mono text-blue-400 uppercase tracking-widest">
                                <span className="w-2 h-2 bg-blue-500 animate-pulse"></span>
                                System v2.4 initialized
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                                CORREÇÃO <br />
                                <span className="text-blue-500 underline decoration-4 underline-offset-8">PRECISA.</span>
                            </h1>

                            <p className="text-xl text-slate-400 max-w-lg leading-relaxed border-l-2 border-slate-700 pl-6">
                                Digitalize provas, processe gabaritos e gere relatórios automáticos em segundos. Sem burocracia, sem erros manuais.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-8 py-4 bg-blue-600 text-white font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors flex items-center gap-3"
                                >
                                    Abrir Painel <ArrowRight className="w-5 h-5" />
                                </button>
                                <button className="px-8 py-4 border border-slate-700 hover:border-slate-500 text-slate-300 font-bold uppercase tracking-widest transition-colors">
                                    Documentação
                                </button>
                            </div>
                        </div>

                        {/* Visual Blueprint element */}
                        <div className="relative group">
                            <div className="absolute -inset-4 border border-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="aspect-square border border-slate-800 bg-slate-900/50 relative overflow-hidden flex items-center justify-center">
                                {/* Simulated Scanning Animation */}
                                <div className="absolute inset-0 bg-blue-500/5 overflow-hidden">
                                    <div className="w-full h-[1px] bg-blue-500 absolute top-0 animate-[scan_3s_ease-in-out_infinite]"></div>
                                </div>

                                <div className="grid grid-cols-5 gap-4 p-8 opacity-40">
                                    {[...Array(25)].map((_, i) => (
                                        <div key={i} className={`w-8 h-8 border ${i === 12 ? 'border-blue-500 bg-blue-500/20' : 'border-slate-700'}`}></div>
                                    ))}
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="p-10 border-4 border-blue-500 bg-slate-950">
                                        <QrCode className="w-24 h-24 text-blue-500" />
                                    </div>
                                </div>

                                <div className="absolute bottom-4 right-4 font-mono text-[10px] text-slate-500 text-right">
                                    MODULE: SCAN_ENGINE_01<br />
                                    COORD: 45.322, -122.332<br />
                                    STATUS: READY
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow Steps */}
                <section className="py-24 border-y border-slate-800 bg-slate-950/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-16">
                            <h2 className="text-sm font-mono text-blue-500 uppercase tracking-[0.3em] mb-4">Process Workflow</h2>
                            <h3 className="text-4xl font-bold tracking-tight">O fluxo de trabalho ideal</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-0 border border-slate-800">
                            {[
                                {
                                    title: "Upload",
                                    desc: "Envie as fotos ou PDFs dos gabaritos preenchidos pelos alunos.",
                                    icon: Search,
                                    code: "01"
                                },
                                {
                                    title: "Processamento",
                                    desc: "Nossa engine reconhece as marcações com 99.9% de precisão.",
                                    icon: Zap,
                                    code: "02"
                                },
                                {
                                    title: "Resultados",
                                    desc: "Dashboard completo com estatísticas de desempenho por aluno e turma.",
                                    icon: ClipboardCheck,
                                    code: "03"
                                }
                            ].map((step, idx) => (
                                <div key={idx} className="p-12 border-slate-800 last:border-r-0 md:border-r hover:bg-slate-900/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-12 h-12 border border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                                            <step.icon className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                                        </div>
                                        <span className="font-mono text-slate-600 text-4xl leading-none">{step.code}</span>
                                    </div>
                                    <h4 className="text-xl font-bold mb-4 uppercase tracking-tighter">{step.title}</h4>
                                    <p className="text-slate-400 leading-relaxed font-light text-sm">
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats / Features */}
                <section className="py-32 px-6 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div className="border border-slate-800 p-1">
                            <div className="border border-slate-800 p-12 space-y-8">
                                <h3 className="text-3xl font-bold tracking-tight">Potencialize sua gestão de ensino</h3>
                                <ul className="space-y-6">
                                    {[
                                        "Importação de alunos via CSV",
                                        "Visualização detalhada por prova",
                                        "Relatórios de erros frequentes",
                                        "Segurança de dados e backups"
                                    ].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-4 text-slate-300">
                                            <div className="w-5 h-5 border border-blue-500/50 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-blue-500"></div>
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-12">
                            <div className="space-y-4">
                                <div className="text-6xl font-black text-blue-500 tracking-tighter">100%</div>
                                <div className="text-sm font-mono text-slate-500 uppercase tracking-widest">Acurácia de detecção</div>
                                <p className="text-slate-400 text-sm">Validada em mais de 50.000 provas processadas em diversas iluminações.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="text-6xl font-black text-white tracking-tighter">0.5s</div>
                                <div className="text-sm font-mono text-slate-500 uppercase tracking-widest">Tempo de resposta</div>
                                <p className="text-slate-400 text-sm">Processamento em tempo real de gabaritos complexos de até 100 questões.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-800 bg-slate-900/20 py-20">
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
                        <div className="col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <RotateCcw className="text-blue-500 w-6 h-6" />
                                <span className="text-xl font-bold tracking-tighter uppercase">Gabarito.io</span>
                            </div>
                            <p className="text-slate-500 max-w-sm text-sm">
                                A plataforma definitiva para professores e instituições que buscam excelência operacional na correção de avaliações.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h5 className="font-bold text-xs uppercase tracking-widest text-slate-300">Plataforma</h5>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-blue-400">Dashboard</a></li>
                                <li><a href="#" className="hover:text-blue-400">Provas</a></li>
                                <li><a href="#" className="hover:text-blue-400">Alunos</a></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h5 className="font-bold text-xs uppercase tracking-widest text-slate-300">Legal</h5>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-blue-400">Privacidade</a></li>
                                <li><a href="#" className="hover:text-blue-400">Termos de Uso</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">
                        <span>© 2024 Gabarito.io System</span>
                        <span>Built for Educators</span>
                    </div>
                </footer>
            </main>

            <style>{`
                @keyframes scan {
                    0%, 100%{ top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100%{ top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};
