import React from 'react';
import { AlertTriangle, WifiOff, XCircle, Info } from 'lucide-react';

export default function SystemAlerts({ alerts = [] }) {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="mb-8 space-y-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">
                Alertas do Sistema
            </h2>
            {alerts.map((alert, index) => {
                let Icon = Info;
                let colorClass = "bg-blue-50 border-blue-100 text-blue-700";

                if (alert.type === 'warning') {
                    Icon = AlertTriangle;
                    colorClass = "bg-yellow-50 border-yellow-100 text-yellow-700";
                } else if (alert.type === 'error') {
                    Icon = XCircle;
                    colorClass = "bg-red-50 border-red-100 text-red-700";
                } else if (alert.type === 'offline') {
                    Icon = WifiOff;
                    colorClass = "bg-gray-100 border-gray-200 text-gray-700";
                }

                return (
                    <div key={index} className={`flex items-start gap-3 p-4 rounded-2xl border shadow-sm ${colorClass}`}>
                        <div className="p-1.5 bg-white/50 rounded-xl shrink-0">
                            <Icon size={20} className="opacity-90" />
                        </div>
                        <div className="flex-1 mt-0.5">
                            <p className="text-sm font-bold">{alert.title}</p>
                            {alert.message && (
                                <p className="text-sm opacity-80 mt-0.5 font-medium">{alert.message}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
