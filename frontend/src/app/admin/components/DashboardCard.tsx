import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';
    description?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, color, description }) => {
    const colorStyles = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        purple: "text-purple-600 bg-purple-50 border-purple-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm font-sans hover:shadow-md transition-all group duration-300">
            <div className="flex items-center justify-between mb-2">
                <div className={cn("p-2 rounded-xl border", colorStyles[color])}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 leading-tight">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{value}</h3>
                {description && (
                    <span className="text-[9px] font-bold text-slate-400">{description}</span>
                )}
            </div>
        </div>
    );
};

export default DashboardCard;
