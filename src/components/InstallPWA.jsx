import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
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

        return () => window.removeEventListener('beforeinstallprompt', handler);
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

    if (isStandalone) {
        return null;
    }

    // Don't show anything on desktop if not support PWA nor iOS, but usually PWA works on desktop Chrome too.
    // For simplicity, we just show if it's iOS or supportsPWA
    if (!supportsPWA && !isIOS) {
        return null;
    }

    return (
        <>
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white shadow-xl rounded-full px-4 py-2 border border-pink-100 gap-3 w-max max-w-[90vw]">
                <div className="bg-pink-100 p-2 rounded-full hidden sm:block">
                    <Download size={16} className="text-pink-600" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">Baixar o Aplicativo</span>
                    <span className="text-xs text-gray-500 hidden sm:block">Acesse mais rápido da sua tela inicial</span>
                </div>
                <button
                    onClick={onClick}
                    className="ml-auto bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md transition-colors"
                >
                    Instalar App
                </button>
            </div>

            {/* Instructions Modal for Manual Installation */}
            {showInstructions && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowInstructions(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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
                                        <span className="font-bold text-pink-500">1.</span>
                                        <span>Toque no botão Compartilhar <Share size={16} className="inline text-blue-500 mx-1" /> no menu inferior do Safari.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-pink-500">2.</span>
                                        <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-pink-500">3.</span>
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
                                        <span className="font-bold text-pink-500">1.</span>
                                        <span>Toque no botão Menu (três pontos ⋮) no navegador.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-pink-500">2.</span>
                                        <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
                                    </li>
                                </ol>
                            </div>
                        )}

                        <button
                            onClick={() => setShowInstructions(false)}
                            className="w-full mt-6 bg-pink-100 text-pink-700 hover:bg-pink-200 font-bold py-2.5 rounded-xl transition-colors"
                        >
                            Entendi!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
