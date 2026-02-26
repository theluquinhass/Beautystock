import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [isDismissed, setIsDismissed] = useState(true); // Default true to avoid flash
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Only show if it's mobile (rough check based on width and userAgent)
        const checkMobile = window.innerWidth < 1024;
        setIsMobile(checkMobile);

        // Check if user dismissed it previously
        const dismissed = localStorage.getItem('beautystock_pwa_dismissed');
        if (dismissed === 'true') {
            setIsDismissed(true);
            return;
        } else {
            setIsDismissed(false);
        }

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            setIsStandalone(true);
            return;
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Listen for beforeinstallprompt for Android/Chrome
        const handler = e => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Re-check mobile on resize
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    const onClick = evt => {
        evt.preventDefault();

        if (isIOS) {
            // Show iOS specific instructions modal
            setShowInstructions(true);
            return;
        }

        if (!promptInstall) {
            // Android without prompt (e.g. Firefox Android or generic error)
            setShowInstructions(true);
            return;
        }

        promptInstall.prompt();
    };

    const handleDismiss = () => {
        localStorage.setItem('beautystock_pwa_dismissed', 'true');
        setIsDismissed(true);
    };

    // If installed, dismissed, or desktop
    if (isStandalone || isDismissed || !isMobile) {
        return null;
    }

    // Only show if prompt is available OR it's iOS
    if (!supportsPWA && !isIOS) {
        return null;
    }

    return (
        <>
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white shadow-xl rounded-full pl-4 pr-2 py-2 border border-pink-100 gap-3 w-max max-w-[95vw] animate-in slide-in-from-top-4 duration-500">
                <div className="bg-pink-100 p-2 rounded-full shrink-0">
                    <Download size={16} className="text-pink-600" />
                </div>
                <div className="flex flex-col pr-2">
                    <span className="text-[13px] font-bold text-gray-800 leading-tight">Instalar Aplicativo</span>
                    <span className="text-[10px] text-gray-500 leading-tight">Acesse mais rápido direto da tela inicial</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-auto">
                    <button
                        onClick={onClick}
                        className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md transition-colors whitespace-nowrap"
                    >
                        Instalar
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors"
                        aria-label="Dispensar aviso"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Instructions Modal for Manual Installation */}
            {showInstructions && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowInstructions(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Instalar Aplicativo</h3>

                        {isIOS ? (
                            <div className="text-center space-y-4">
                                <p className="text-gray-600 text-sm">
                                    Para instalar o BeautyStock no seu iPhone ou iPad:
                                </p>
                                <ol className="text-left text-sm text-gray-700 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <li className="flex items-start gap-2">
                                        <div className="bg-pink-100 text-pink-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                                        <span>Toque no botão Compartilhar <Share size={16} className="inline text-blue-500 mx-1" /> no menu inferior do Safari.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="bg-pink-100 text-pink-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                                        <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="bg-pink-100 text-pink-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                                        <span>Confirme em <strong>"Adicionar"</strong> no canto superior direito.</span>
                                    </li>
                                </ol>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <p className="text-gray-600 text-sm">
                                    Para instalar o BeautyStock no seu Android:
                                </p>
                                <ol className="text-left text-sm text-gray-700 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <li className="flex items-start gap-2">
                                        <div className="bg-pink-100 text-pink-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                                        <span>Toque no botão Menu (três pontos ⋮) no navegador.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="bg-pink-100 text-pink-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                                        <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
                                    </li>
                                </ol>
                            </div>
                        )}

                        <button
                            onClick={() => setShowInstructions(false)}
                            className="w-full mt-6 bg-pink-100 text-pink-700 hover:bg-pink-200 font-bold py-3 rounded-2xl transition-colors"
                        >
                            Entendi!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
