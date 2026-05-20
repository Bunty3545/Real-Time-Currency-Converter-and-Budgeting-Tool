import React from 'react';

export function CardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden animate-pulse">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-slate-800/30 to-transparent -translate-x-full animate-shimmer"></div>
                    <div className="flex justify-between items-center mb-4">
                        <div className="h-4 bg-slate-800 rounded-full w-24"></div>
                        <div className="w-10 h-10 bg-slate-800 rounded-xl"></div>
                    </div>
                    <div className="h-8 bg-slate-800 rounded-lg w-32 mb-3"></div>
                    <div className="h-3.5 bg-slate-800/60 rounded-full w-48"></div>
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton() {
    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 overflow-hidden animate-pulse space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-4">
                <div className="h-5 bg-slate-800 rounded-full w-40"></div>
                <div className="h-8 bg-slate-800 rounded-xl w-24"></div>
            </div>
            {[1, 2, 3, 4, 5].map(idx => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-800/40 last:border-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-800 rounded-full w-28"></div>
                            <div className="h-3 bg-slate-800/60 rounded-full w-16"></div>
                        </div>
                    </div>
                    <div className="space-y-2 text-right">
                        <div className="h-4 bg-slate-800 rounded-full w-20"></div>
                        <div className="h-3 bg-slate-800/60 rounded-full w-14"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden animate-pulse min-h-[300px] flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-slate-800/20 to-transparent -translate-x-full animate-shimmer"></div>
            <div className="flex justify-between items-center mb-6">
                <div className="h-5 bg-slate-800 rounded-full w-36"></div>
                <div className="flex gap-2">
                    <div className="w-8 h-4 bg-slate-800 rounded-full"></div>
                    <div className="w-8 h-4 bg-slate-800 rounded-full"></div>
                </div>
            </div>
            <div className="flex items-end gap-3 h-40 px-4">
                {[35, 65, 45, 80, 50, 90, 40, 75, 55, 70].map((height, idx) => (
                    <div key={idx} className="flex-1 bg-slate-850 rounded-t-lg transition-all" style={{ height: `${height}%` }}></div>
                ))}
            </div>
            <div className="flex justify-between border-t border-slate-800/60 pt-4 mt-2">
                {[1, 2, 3, 4, 5].map(idx => (
                    <div key={idx} className="h-3 bg-slate-800 rounded-full w-10"></div>
                ))}
            </div>
        </div>
    );
}
