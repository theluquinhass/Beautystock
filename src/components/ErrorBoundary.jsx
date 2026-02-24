import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Ops! Algo deu errado.</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            Não se preocupe, seus dados estão seguros. Tente recarregar a página.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-6 rounded-full flex items-center gap-2 mx-auto transition-colors"
                        >
                            <RefreshCw size={18} />
                            Recarregar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
