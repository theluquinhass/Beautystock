import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, Users, DollarSign, Package, TrendingUp, TrendingDown,
    Search, Bell, ChevronRight, CheckCircle2, Home, LogOut, PackagePlus, ArrowUpRight,
    AlertCircle, Sparkles, ShieldCheck, Star, MessageCircle, PlusCircle, PenSquare
} from 'lucide-react';

export default function VisualProof() {
    return (
        <section className="py-20 sm:py-24 md:py-32 bg-[#020617] relative overflow-hidden">
            {/* Deep premium background gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] sm:w-[900px] h-[500px] sm:h-[900px] bg-gradient-to-bl from-blue-900/40 via-purple-900/30 to-pink-900/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-blue-600/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>
            <div className="absolute top-[30%] left-[20%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-pink-500/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-pink-300 text-[12px] sm:text-[13px] font-bold mb-5 border border-white/10 backdrop-blur-md tracking-wider uppercase"
                    >
                        Poder da Gestão
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[2.2rem] sm:text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight leading-[1.15]"
                    >
                        Elegante no computador, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">perfeito no celular.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[1.05rem] sm:text-lg text-gray-400 font-medium leading-relaxed px-2 lg:px-10"
                    >
                        Seu negócio ganha um Dashboard profissional para administrar nos mínimos detalhes, e sua loja online se torna um catálogo incrivelmente bonito de se ver e comprar.
                    </motion.p>
                </div>

                {/* Dashboard Showcase Mockup (Desktop) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative max-w-5xl mx-auto"
                >
                    <div className="relative rounded-[1.2rem] sm:rounded-2xl bg-[#0f172a]/80 backdrop-blur-sm p-1 sm:p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 ring-1 ring-white/5 mx-auto">

                        {/* Browser Window Header */}
                        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-black/40 rounded-t-xl border-b border-white/5">
                            <div className="flex gap-1.5 sm:gap-2">
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400/80 shadow-[0_0_10px_rgba(248,113,113,0.4)]"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400/80 shadow-[0_0_10px_rgba(250,204,21,0.4)]"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400/80 shadow-[0_0_10px_rgba(74,222,128,0.4)]"></div>
                            </div>
                            <div className="hidden sm:flex bg-white/5 w-64 h-5 rounded-md border border-white/10"></div>
                            <div className="w-10"></div>
                        </div>

                        {/* Real Dashboard Replica */}
                        <div className="bg-[#fcfdfd] rounded-b-lg sm:rounded-b-xl overflow-hidden flex flex-col md:grid md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] relative">

                            {/* Desktop Sidebar */}
                            <div className="hidden md:flex bg-white border-r border-gray-100 flex-col pt-5 pb-5 relative h-full">
                                <div className="flex items-center gap-2 mb-6 px-4">
                                    <div className="w-6 h-6 rounded bg-pink-500 text-white flex items-center justify-center font-bold text-[12px] shadow-sm">B</div>
                                    <span className="font-bold text-gray-900 tracking-tight text-[13px]">BeautyStock</span>
                                    <Bell className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                                </div>

                                <div className="px-3 mb-5">
                                    <button className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-bold shadow-md shadow-pink-500/20 transition-all">
                                        <PlusCircle className="w-3.5 h-3.5" /> Nova Venda
                                    </button>
                                </div>

                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider px-4 mb-2">Menu Principal</div>

                                <div className="flex-1 px-2 space-y-0.5">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 bg-pink-50 text-pink-600 rounded-lg px-2.5 py-1.5 font-bold text-[11px]">
                                            <Home className="w-3.5 h-3.5" /> Dashboard
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 rounded-lg px-2.5 py-1.5 font-medium text-[11px] cursor-pointer">
                                        <Package className="w-3.5 h-3.5" /> Produtos
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 rounded-lg px-2.5 py-1.5 font-medium text-[11px] cursor-pointer">
                                        <ShoppingBag className="w-3.5 h-3.5" /> Catálogo
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 rounded-lg px-2.5 py-1.5 font-medium text-[11px] cursor-pointer">
                                        <Users className="w-3.5 h-3.5" /> Clientes
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 rounded-lg px-2.5 py-1.5 font-medium text-[11px] cursor-pointer">
                                        <PenSquare className="w-3.5 h-3.5" /> Movimentações
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 rounded-lg px-2.5 py-1.5 font-medium text-[11px] cursor-pointer">
                                        <LayoutDashboard className="w-3.5 h-3.5" /> Minha Conta
                                    </div>
                                </div>

                                <div className="px-3 mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-500 hover:text-gray-800 cursor-pointer font-medium text-[11px]">
                                        <LogOut className="w-3.5 h-3.5" /> Sair do sistema
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Dashboard */}
                            <div className="col-span-1 p-3 sm:p-5 lg:p-6 bg-pink-50/20 flex-1 min-h-[500px]">

                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h1 className="font-black text-gray-900 text-[16px] sm:text-[18px] tracking-tight leading-none mb-0.5">Dashboard de Gestão</h1>
                                        <p className="text-gray-500 text-[10px] sm:text-[11px] font-medium">Acompanhe seus dados em tempo real</p>
                                    </div>
                                    <button className="hidden sm:flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-purple-100 transition-colors">
                                        <PackagePlus className="w-3.5 h-3.5" /> Novo Produto
                                    </button>
                                </div>

                                {/* 3 Metric Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                                    <div className="bg-[#ff2277] rounded-xl p-3 sm:p-4 text-white shadow-sm flex flex-col justify-between">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider opacity-90">Lucro (mês)</span>
                                            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-80" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-[16px] sm:text-[20px] leading-none mb-1">R$ 1160.30</h3>
                                            <p className="text-[7px] sm:text-[8px] opacity-80 font-medium">Reflete vendas feitas</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#00c853] rounded-xl p-3 sm:p-4 text-white shadow-sm flex flex-col justify-between">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider opacity-90">Caixa (mês)</span>
                                            <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-80" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-[16px] sm:text-[20px] leading-none mb-1">R$ 3563.79</h3>
                                            <p className="text-[7px] sm:text-[8px] opacity-80 font-medium">Entradas reais em $$</p>
                                        </div>
                                    </div>

                                    <div className="hidden lg:flex bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex-col justify-between">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Vendas Hoje</span>
                                            <ArrowUpRight className="w-3 h-3 text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-[20px] text-gray-900 leading-none mb-1">3</h3>
                                            <p className="text-[8px] text-gray-400 font-medium">3 unid. (3 vendas)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Estoque Baixo Banner */}
                                <div className="bg-red-50/80 border border-red-100 rounded-xl p-3 mb-4 flex justify-between items-center">
                                    <div>
                                        <span className="text-[8px] sm:text-[9px] font-bold text-red-500 uppercase tracking-widest block mb-1">Estoque Baixo</span>
                                        <div className="font-bold text-red-500 text-[13px] sm:text-[15px] leading-tight flex items-baseline gap-1.5">
                                            10 <span className="text-[8px] sm:text-[10px] font-medium opacity-80 text-red-400">Produtos precisam de reposição</span>
                                        </div>
                                    </div>
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-100/80 text-red-500 flex items-center justify-center shadow-sm">
                                        <Package className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Bottom Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">

                                    {/* Left Column (Chart & Movimentações) */}
                                    <div className="space-y-4">

                                        {/* Chart Card */}
                                        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm relative overflow-hidden">
                                            <div className="flex justify-between items-center mb-4 relative z-10">
                                                <h4 className="font-black text-[11px] sm:text-[12px] text-gray-900">Crescimento de Lucro</h4>
                                                <div className="flex bg-gray-50 rounded-md p-0.5 border border-gray-100">
                                                    <span className="text-[7px] sm:text-[8px] font-bold bg-white shadow-sm px-2 py-0.5 rounded text-gray-800">7 Dias</span>
                                                    <span className="text-[7px] sm:text-[8px] font-medium px-2 py-0.5 rounded text-gray-400">30 Dias</span>
                                                    <span className="text-[7px] sm:text-[8px] font-medium px-2 py-0.5 rounded text-gray-400">3 Meses</span>
                                                </div>
                                            </div>
                                            {/* Vector Chart Replica */}
                                            <div className="h-[90px] sm:h-[110px] w-full relative pl-4 pb-2 border-l border-b border-gray-100">
                                                <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none" className="overflow-visible absolute inset-0 pt-1">
                                                    <defs>
                                                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                                                            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d="M 0,45 L 20,40 L 40,35 L 60,20 L 80,25 L 100,12 L 120,18 L 140,10 L 160,20 L 180,8 L 200,5" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M 0,45 L 20,40 L 40,35 L 60,20 L 80,25 L 100,12 L 120,18 L 140,10 L 160,20 L 180,8 L 200,5 L 200,60 L 0,60 Z" fill="url(#chartGlow)" />
                                                </svg>
                                                {/* Axis simple markers */}
                                                <div className="absolute -left-5 bottom-0 text-[6px] text-gray-400">R$ 0</div>
                                                <div className="absolute -left-6 top-0 text-[6px] text-gray-400">R$ 800</div>
                                            </div>
                                        </div>

                                        {/* Movimentações Recentes */}
                                        <div className="hidden sm:block">
                                            <h4 className="font-extrabold text-[12px] text-gray-900 mb-2.5">Movimentações recentes</h4>
                                            <div className="space-y-1.5">
                                                <div className="bg-white border border-gray-100 rounded-xl p-2.5 flex items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
                                                    <div className="flex gap-2.5 items-center">
                                                        <div className="w-7 h-7 bg-pink-50 text-pink-500 rounded-lg flex items-center justify-center text-[11px] font-extrabold">V</div>
                                                        <div>
                                                            <p className="font-bold text-[11px] text-gray-800 leading-none mb-0.5">Venda Avulsa</p>
                                                            <p className="text-[8px] text-gray-400 font-medium">Água Micelar Matte 059</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-[11px] text-green-500 leading-none mb-0.5">+R$ 290.00</p>
                                                        <p className="text-[7px] text-gray-400 font-medium">26/03 às 09:19</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Right Column (Clientes + Bibi Recommendations) */}
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col items-center justify-center text-center">
                                            <h4 className="font-extrabold text-[12px] text-gray-900 self-start w-full text-left mb-3">Clientes que mais devem</h4>
                                            <div className="w-9 h-9 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-2">
                                                <AlertCircle className="w-4 h-4 text-green-500" />
                                            </div>
                                            <p className="font-bold text-[11px] text-gray-800 mb-0.5">Tudo em dia!</p>
                                            <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Nenhum cliente com dívida pendente.</p>
                                        </div>

                                        <div className="hidden lg:block bg-gradient-to-b from-pink-50/50 to-white rounded-xl border border-gray-100 p-3 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-7 h-7 rounded-lg bg-pink-500 text-white flex items-center justify-center shadow-sm">
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-[12px] text-gray-900 leading-none mb-0.5">Bibi recomenda</h4>
                                                    <p className="text-[7px] text-gray-500 uppercase tracking-widest font-bold">Consultoria de Estoque</p>
                                                </div>
                                            </div>

                                            <div className="bg-white border border-gray-100 rounded-lg p-2.5">
                                                <div className="mb-1">
                                                    <p className="font-black text-[10px] text-gray-800">Blush Premium 039 - Claro</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="bg-red-50 text-red-500 px-1.5 py-0.5 rounded text-[8px] font-bold border border-red-100">
                                                        ↓ Acaba em 0 dias
                                                    </span>
                                                    <div className="text-right">
                                                        <span className="bg-[#00c853] text-white px-2 py-0.5 rounded shadow-sm text-[9px] font-black">+1</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Mobile Catalog Mockup */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                            className="absolute -right-4 sm:-right-8 md:-right-24 -bottom-6 sm:-bottom-10 md:-bottom-16 w-[200px] sm:w-[220px] md:w-[280px] h-[400px] sm:h-[480px] md:h-[560px] bg-white rounded-[2rem] md:rounded-[2.8rem] border-[5px] md:border-[8px] border-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-0.5 md:p-1 z-20 ring-1 ring-white/10"
                        >
                            {/* Mobile Screen Container */}
                            <div className="w-full h-full bg-[#fcfcfd] rounded-[1.6rem] md:rounded-[2.4rem] overflow-hidden relative flex flex-col shadow-inner">

                                {/* Dynamic Island / iPhone Notch */}
                                <div className="absolute top-0 inset-x-0 h-4 md:h-6 flex justify-center z-30 pointer-events-none">
                                    <div className="w-20 md:w-28 h-4 md:h-6 bg-gray-900 rounded-b-[12px] md:rounded-b-[16px]"></div>
                                </div>

                                {/* Inner Scrollable Mobile Screen */}
                                <div className="flex-1 overflow-y-auto w-full pt-6 md:pt-10 px-3 md:px-4 pb-6 [&::-webkit-scrollbar]:hidden relative" style={{ scrollbarWidth: 'none' }}>

                                    {/* Mobile Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-black text-white flex items-center justify-center font-bold text-[10px] shadow-sm">BS</div>
                                            <div>
                                                <h3 className="font-black text-[11px] md:text-[13px] text-gray-900 leading-tight">Perfumes importados</h3>
                                                <span className="text-[7px] md:text-[8px] text-pink-500 font-bold tracking-tight">Visitar painel da loja {'>'}</span>
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 bg-[#25D366] rounded flex items-center justify-center text-white shadow-sm">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                        </div>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="w-full bg-gray-100/80 rounded-full py-1.5 md:py-2 px-3 flex items-center gap-2 mb-4">
                                        <Search className="w-3 h-3 text-gray-400" />
                                        <span className="text-[8px] md:text-[9.5px] text-gray-400 font-medium">O que você está procurando hoje?</span>
                                    </div>

                                    {/* Banner Bem-vindo */}
                                    <div className="bg-gradient-to-b from-purple-50 via-pink-50/50 to-white rounded-xl md:rounded-2xl p-3 md:p-4 text-center border border-pink-100/50 mb-4 shadow-sm">
                                        <h2 className="font-black text-[12px] md:text-[15px] text-gray-900 leading-tight mb-1 md:mb-1.5">
                                            Bem-vindo(a) à <br />
                                            <span className="text-pink-500">Perfumes importados</span>
                                        </h2>
                                        <p className="text-[7px] md:text-[8.5px] text-gray-500 mb-3 px-1 md:px-2 leading-relaxed font-medium">
                                            Explore nossa seleção exclusiva de produtos de beleza e cosméticos. Tudo escolhido com carinho para você.
                                        </p>
                                        <div className="flex flex-col gap-1.5 items-center">
                                            <span className="bg-white text-green-600 rounded-full px-2 py-0.5 md:py-1 text-[7px] md:text-[8px] font-bold flex items-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-green-50"><ShieldCheck className="w-2.5 h-2.5" /> Compra Segura</span>
                                            <span className="bg-white text-yellow-500 rounded-full px-2 py-0.5 md:py-1 text-[7px] md:text-[8px] font-bold flex items-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-yellow-50"><Star className="w-2.5 h-2.5" /> Qualidade Garantida</span>
                                        </div>
                                    </div>

                                    {/* Category Chips */}
                                    <div className="flex gap-1.5 md:gap-2 mb-4 overflow-hidden py-1">
                                        <span className="shrink-0 bg-pink-500 text-white text-[8px] md:text-[9.5px] font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm shadow-pink-200">💄 Batons</span>
                                        <span className="shrink-0 bg-white text-gray-600 border border-gray-200 text-[8px] md:text-[9.5px] font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm">✨ Linha Skin...</span>
                                    </div>

                                    {/* Section Title */}
                                    <div className="flex items-center gap-1.5 mb-3 px-1">
                                        <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-cyan-400 text-white flex items-center justify-center font-black text-[9px] md:text-[10px]">B</div>
                                        <h3 className="font-black text-[12px] md:text-[14px] text-gray-900">Baton</h3>
                                    </div>

                                    {/* Catalog Product Grid */}
                                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                                        {/* Fake Catalog Item 1 */}
                                        <div className="bg-white rounded-xl md:rounded-2xl p-1.5 md:p-2 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                            <div className="w-full aspect-square bg-[#f8f9fa] rounded-lg md:rounded-xl mb-2 overflow-hidden relative">
                                                <img src="/demo/base_glow_hd.png" alt="Base Glow HD" className="w-full h-full object-cover mix-blend-multiply" />
                                            </div>
                                            <div className="self-start bg-gray-100 text-gray-500 px-1 rounded-[3px] text-[5px] md:text-[6px] font-black uppercase mb-1">Base</div>
                                            <h4 className="font-bold text-[8px] md:text-[10px] text-gray-800 leading-tight mb-1 self-start text-left">Base Glow HD 034</h4>
                                            <div className="font-black text-gray-900 text-[10px] md:text-[12px] mb-2 self-start mt-auto">R$ 30.56</div>
                                            <button className="w-full bg-black text-white rounded-lg md:rounded-xl py-1.5 md:py-2 text-[8px] md:text-[9px] font-bold flex items-center justify-center gap-1 shadow-md hover:bg-gray-800">
                                                <ShoppingBag className="w-2.5 h-2.5" /> Eu quero
                                            </button>
                                        </div>

                                        {/* Fake Catalog Item 2 */}
                                        <div className="bg-white rounded-xl md:rounded-2xl p-1.5 md:p-2 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                            <div className="w-full aspect-square bg-[#f8f9fa] rounded-lg md:rounded-xl mb-2 overflow-hidden">
                                                <img src="/demo/batom_premium.png" alt="Batom Premium" className="w-full h-full object-cover mix-blend-multiply" />
                                            </div>
                                            <div className="self-start bg-gray-100 text-gray-500 px-1 rounded-[3px] text-[5px] md:text-[6px] font-black uppercase mb-1">Cremoso</div>
                                            <h4 className="font-bold text-[8px] md:text-[10px] text-gray-800 leading-tight mb-1 self-start text-left">Batom Premium 010</h4>
                                            <div className="font-black text-gray-900 text-[10px] md:text-[12px] mb-2 self-start mt-auto">R$ 170.89</div>
                                            <button className="w-full bg-black text-white rounded-lg md:rounded-xl py-1.5 md:py-2 text-[8px] md:text-[9px] font-bold flex items-center justify-center gap-1 shadow-md hover:bg-gray-800">
                                                <ShoppingBag className="w-2.5 h-2.5" /> Eu quero
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pb-8"></div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
