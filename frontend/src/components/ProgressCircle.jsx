import { motion } from 'framer-motion';

export default function ProgressCircle({ percentage = 0, size = 160, strokeWidth = 14 }) {
    const safePercentage = Math.max(0, percentage);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (Math.min(safePercentage, 100) / 100) * circumference;

    // Custom color mapping based on thresholds
    let color = '#10b981'; // Green (0-70%)
    let bgGlow = 'rgba(16, 185, 129, 0.15)';
    if (safePercentage > 100) {
        color = '#ef4444'; // Red (>100%)
        bgGlow = 'rgba(239, 68, 68, 0.15)';
    } else if (safePercentage > 90) {
        color = '#f97316'; // Orange (90-100%)
        bgGlow = 'rgba(249, 115, 22, 0.15)';
    } else if (safePercentage > 70) {
        color = '#eab308'; // Yellow (70-90%)
        bgGlow = 'rgba(234, 179, 8, 0.15)';
    }

    return (
        <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#1e293b"
                    strokeWidth={strokeWidth}
                />
                
                {/* Progress Ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${color}33)` }}
                />
            </svg>

            {/* Inner text content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold tracking-tight" style={{ color }}>
                    {Math.round(safePercentage)}%
                </span>
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
                    Spent
                </span>
            </div>
            
            {/* Glowing background blob */}
            <div 
                className="absolute inset-0 rounded-full blur-2xl pointer-events-none transition-all duration-500" 
                style={{ backgroundColor: bgGlow, transform: 'scale(0.8)', zIndex: -1 }}
            />
        </div>
    );
}
