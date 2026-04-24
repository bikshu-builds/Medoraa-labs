import React from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
    header: string;
    accessor?: keyof T;
    render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    actions?: (row: T) => React.ReactNode;
}

const Table = <T extends Record<string, any>>({ columns, data, actions }: TableProps<T>) => {
    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden font-sans">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    {col.header}
                                </th>
                            ))}
                            {actions && (
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                                            {col.render ? col.render(row) : row[col.accessor as string]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                {actions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td 
                                    colSpan={columns.length + (actions ? 1 : 0)} 
                                    className="px-6 py-12 text-center text-slate-400 text-sm italic"
                                >
                                    No records found in this view
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
