const fs = require('fs');

const path = './src/pages/Landing/components/Hero.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace imports
content = content.replace(
  "import { CheckCircle2, ChevronRight, Lock, MessageSquare, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';",
  "import { CheckCircle2, ChevronRight, Lock, MessageSquare, ArrowRight, ShieldCheck, Sparkles, TrendingUp, ShoppingBag, Star } from 'lucide-react';"
);

// Split the content to replace the mock section
const targetStart = '                            {/* Fake Content: Catalog UI */}';
const targetEnd = '                    </motion.div>'; // This is the final closing tag for the Right Column

// Wait, there are multiple </motion.div>. Let's be precise.
// The block we replace is between ` {/* Fake Content: Catalog UI */}` and the second to last `</motion.div>`.
// So let's use string split.

const parts = content.split('                            {/* Fake Content: Catalog UI */}');
if (parts.length === 2) {
    const endParts = parts[1].split('                    </motion.div>\n                </div>\n            </div>');
    if (endParts.length === 2) {
        
        const newMarkup = `                            {/* Fake Content: Catalog UI */}
                            <div className="bg-[#fcfcfc] min-h-[350px] sm:min-h-[420px] md:min-h-[500px] relative pointer-events-none">
                                {/* Banner & Header */}
                                <div className="relative mb-8 sm:mb-12">
                                    <div className="w-full h-20 sm:h-28 md:h-32 bg-gradient-to-r from-pink-200 to-purple-200 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm mix-blend-overlay"></div>
                                    </div>
                                    <div className="absolute -bottom-6 sm:-bottom-8 left-4 sm:left-6 w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl shadow-md border-4 border-white flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-[#ec4899] to-[#d8b4fe] flex items-center justify-center text-white font-black text-xl sm:text-2xl">B</div>
                                    </div>
                                    <div className="absolute -bottom-4 left-20 sm:left-28 sm:-bottom-5">
                                        <h3 className="font-bold text-gray-800 text-sm sm:text-lg leading-tight">Amanda Revendedora</h3>
                                        <p className="text-[10px] sm:text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                            5.0 • Cosméticos & Perfumaria
                                        </p>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="px-4 sm:px-6 pb-6 pt-2 sm:pt-4">
                                    {/* Categories */}
                                    <div className="flex gap-2 sm:gap-2.5 mb-4 sm:mb-6 overflow-hidden">
                                        <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gray-900 text-white rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap shadow-sm">Todos</div>
                                        <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white text-gray-600 rounded-full text-[10px] sm:text-[11px] font-bold items-center border border-gray-100 whitespace-nowrap">Perfumes</div>
                                        <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white text-gray-600 rounded-full text-[10px] sm:text-[11px] font-bold items-center border border-gray-100 whitespace-nowrap">Maquiagem</div>
                                        <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white text-gray-600 rounded-full text-[10px] sm:text-[11px] font-bold items-center border border-gray-100 whitespace-nowrap">Skincare</div>
                                    </div>

                                    {/* Products Grid */}
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        {/* Product 1 */}
                                        <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-[1.25rem] border border-gray-100 shadow-sm flex flex-col gap-2 relative transition-all">
                                            <div className="absolute top-0 right-0 z-10 bg-gradient-to-r from-[#ec4899] to-pink-500 text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl shadow-sm">Mais vendido</div>
                                            <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden relative border border-gray-50">
                                                <img src="/demo/body_splash.png" alt="Body Splash" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col px-0.5 sm:px-1">
                                                <h4 className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight">Body Splash Velvet Bloom</h4>
                                                <div className="mt-1 sm:mt-1.5">
                                                    <span className="text-[12px] sm:text-[14px] font-black text-[#ec4899]">R$ 49,90</span>
                                                </div>
                                                <div className="mt-2 w-full bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-green-100">
                                                    <MessageSquare size={10} /> Pedir no WhatsApp
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product 2 */}
                                        <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-[1.25rem] border border-gray-100 shadow-sm flex flex-col gap-2 relative transition-all">
                                            <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden relative border border-gray-50">
                                                <img src="/demo/crystal_gloss.png" alt="Gloss" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col px-0.5 sm:px-1">
                                                <h4 className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight">Gloss Crystal Rose</h4>
                                                <div className="mt-1 sm:mt-1.5">
                                                    <span className="text-[12px] sm:text-[14px] font-black text-[#ec4899]">R$ 24,90</span>
                                                </div>
                                                <div className="mt-2 w-full bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-green-100">
                                                    <MessageSquare size={10} /> Pedir no WhatsApp
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Product 3 */}
                                        <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-[1.25rem] border border-gray-100 shadow-sm flex flex-col gap-2 relative transition-all">
                                            <div className="absolute top-0 right-0 z-10 bg-gradient-to-r from-[#d8b4fe] to-purple-500 text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl shadow-sm">Em alta</div>
                                            <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden relative border border-gray-50">
                                                <img src="/demo/facial_serum.png" alt="Sérum" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col px-0.5 sm:px-1">
                                                <h4 className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight">Sérum Facial Lumina</h4>
                                                <div className="mt-1 sm:mt-1.5">
                                                    <span className="text-[12px] sm:text-[14px] font-black text-[#ec4899]">R$ 39,90</span>
                                                </div>
                                                <div className="mt-2 w-full bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-green-100">
                                                    <MessageSquare size={10} /> Pedir no WhatsApp
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product 4 */}
                                        <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-[1.25rem] border border-gray-100 shadow-sm flex flex-col gap-2 relative transition-all">
                                            <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden relative border border-gray-50">
                                                <img src="/demo/perfume_nuit.png" alt="Perfume" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col px-0.5 sm:px-1">
                                                <h4 className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight">Perfume Soft Nuit</h4>
                                                <div className="mt-1 sm:mt-1.5">
                                                    <span className="text-[12px] sm:text-[14px] font-black text-[#ec4899]">R$ 89,90</span>
                                                </div>
                                                <div className="mt-2 w-full bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-green-100">
                                                    <MessageSquare size={10} /> Pedir no WhatsApp
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Float 1: WhatsApp Modern Notification */}
                        <motion.div
                            initial={{ x: 30, opacity: 0, scale: 0.9 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
                            className="absolute -right-4 md:-right-12 top-[12%] md:top-[20%] bg-white/95 backdrop-blur-xl p-3 md:p-4 rounded-[1.25rem] md:rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-green-50 z-20 w-[70%] md:w-[280px] max-w-[280px]"
                        >
                            <div className="flex gap-2.5 md:gap-3 items-start mb-2.5 md:mb-3">
                                <div className="w-9 h-9 md:w-11 md:h-11 bg-[#25D366] rounded-full flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(37,211,102,0.3)]">
                                    <MessageSquare size={16} className="text-white fill-current md:w-[20px] md:h-[20px]" />
                                </div>
                                <div className="pt-0.5 md:pt-1">
                                    <div className="font-extrabold text-gray-900 text-[11px] md:text-[13px] leading-tight mb-0.5">Pedido recebido via WhatsApp</div>
                                    <div className="text-[9px] md:text-[10px] text-gray-500 font-medium">Beautystock notificações</div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl md:rounded-xl p-2.5 md:p-3 border border-gray-100 flex flex-col gap-1.5 md:gap-2">
                                <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                                    <span className="text-gray-500">Cliente:</span>
                                    <span className="font-bold text-gray-800">Amanda</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                                    <span className="text-gray-500">Itens:</span>
                                    <span className="font-bold text-gray-800">3 itens</span>
                                </div>
                                <div className="h-px w-full bg-gray-200/60 my-0.5"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] md:text-[11px] font-bold text-gray-600">Total:</span>
                                    <span className="text-[12px] md:text-[14px] font-black text-[#25D366]">R$ 289,90</span>
                                </div>
                                <div className="mt-1 w-full bg-green-100/50 text-green-700 text-[9px] md:text-[9px] font-bold py-1 md:py-1.5 rounded border border-green-200 text-center uppercase tracking-wide">
                                    Status: Confirmado
                                </div>
                            </div>
                        </motion.div>

                        {/* Float 2: High-end Dashboard Card */}
                        <motion.div
                            initial={{ x: -30, opacity: 0, scale: 0.9 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            transition={{ delay: 1, type: 'spring', stiffness: 100, damping: 15 }}
                            className="absolute -left-4 md:-left-12 bottom-[8%] md:bottom-[10%] bg-white/95 backdrop-blur-xl p-4 md:p-5 rounded-[1.25rem] md:rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-pink-50 z-20 w-[65%] md:w-[260px] max-w-[260px]"
                        >
                            <div className="flex flex-col gap-2 md:gap-3">
                                <div className="flex items-center gap-2 mb-1 md:mb-1.5">
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-pink-100 flex items-center justify-center shadow-inner">
                                        <TrendingUp size={12} className="text-[#ec4899] md:w-[16px] md:h-[16px]" strokeWidth={3} />
                                    </div>
                                    <span className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest">Lucro no mês</span>
                                </div>
                                
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[12px] md:text-[14px] font-bold text-gray-400">R$</span>
                                    <span className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">4.250</span>
                                </div>
                                
                                <div className="px-2.5 py-1.5 md:px-3 md:py-2 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between mt-0.5 md:mt-1">
                                    <span className="text-[9px] md:text-[11px] font-bold text-green-600">+15% este mês</span>
                                    <TrendingUp size={12} className="text-green-500" strokeWidth={3} />
                                </div>
                            </div>
                        `;
        
        const finalContent = parts[0] + newMarkup + '\\n                    </motion.div>\\n                </div>\\n            </div>';
        fs.writeFileSync(path, finalContent, 'utf8');
        console.log('Successfully updated Hero.jsx');
    } else {
        console.error('Could not find the end block!');
    }
} else {
    console.error('Could not find the Fake Content block!');
}
