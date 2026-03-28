import React from 'react';
import { Search, Download, Filter, Users } from 'lucide-react';

export default function AdminUsersHeader({
    searchTerm,
    setSearchTerm,
    onExport,
    onOpenMobileFilters
}) {
    return (
        <div className="flex flex-col mb-6">
            {/* Top row: Title and Export */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                        <Users size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                            Usuários
                        </h1>
                        <p className="text-gray-500 font-medium text-sm mt-0.5 hidden sm:block">
                            Gerencie planos, status e histórico
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Desktop Export Button */}
                    <button
                        onClick={onExport}
                        className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm text-sm"
                    >
                        <Download size={15} />
                        Exportar CSV
                    </button>

                    {/* Mobile Filter Button */}
                    <button
                        onClick={onOpenMobileFilters}
                        className="sm:hidden flex items-center justify-center p-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
                    >
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm transition-all text-gray-900 placeholder-gray-400"
                />
            </div>
        </div>
    );
}
