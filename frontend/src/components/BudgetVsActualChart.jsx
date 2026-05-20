import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from 'recharts';

export default function BudgetVsActualChart({ chartData }) {
    if (!chartData || !chartData.categories || chartData.categories.length === 0) {
        return (
            <div className="h-64 bg-slate-900/30 rounded-2xl flex items-center justify-center text-slate-500 font-medium border border-slate-800">
                No chart data available for selected period.
            </div>
        );
    }

    // Adapt data format for Recharts engine
    const data = chartData.categories.map((cat, index) => {
        const actual = chartData.actual[index] || 0;
        const budget = chartData.budget[index] || 0;
        const percent = budget > 0 ? (actual / budget) * 100 : 0;

        return {
            name: cat,
            budget,
            actual,
            percent: parseFloat(percent.toFixed(1)),
            remaining: Math.max(0, budget - actual)
        };
    });

    // Custom interactive Tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataObj = payload[0].payload;
            const diff = dataObj.budget - dataObj.actual;
            const isOver = diff < 0;

            return (
                <div className="bg-slate-950/95 border border-slate-850 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">{dataObj.name}</p>
                    <div className="space-y-1 text-sm font-semibold">
                        <p className="text-blue-400 flex justify-between gap-6">
                            <span>Budget:</span>
                            <span>${dataObj.budget.toFixed(2)}</span>
                        </p>
                        <p style={{ color: isOver ? '#ef4444' : '#10b981' }} className="flex justify-between gap-6">
                            <span>Actual:</span>
                            <span>${dataObj.actual.toFixed(2)}</span>
                        </p>
                        <p className="border-t border-slate-900/80 pt-1 mt-1 text-slate-300 flex justify-between gap-6">
                            <span>{isOver ? 'Over Limit:' : 'Remaining:'}</span>
                            <span className={isOver ? 'text-red-500' : 'text-emerald-500'}>
                                ${Math.abs(diff).toFixed(2)}
                            </span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={11} 
                        fontWeight={700}
                        tickLine={false} 
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="#64748b" 
                        fontSize={11} 
                        fontWeight={700}
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 41, 59, 0.2)' }} />
                    <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}
                    />
                    
                    {/* Budget limit Bar */}
                    <Bar name="Budget" dataKey="budget" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />

                    {/* Actual expense Bar (Green if within, Red if over) */}
                    <Bar name="Actual" dataKey="actual" radius={[4, 4, 0, 0]} maxBarSize={28}>
                        {data.map((entry, index) => {
                            const isOver = entry.actual > entry.budget;
                            return (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={isOver ? '#ef4444' : '#10b981'} 
                                />
                            );
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
