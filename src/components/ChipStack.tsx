import React, { useMemo } from 'react';
import { getChipBreakdown, formatChips } from '../utils/pokerRules';

interface ChipStackProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  maxChipsShown?: number;
}

export const ChipStack: React.FC<ChipStackProps> = React.memo(({
  amount,
  size = 'md',
  showLabel = true,
  maxChipsShown = 5,
}) => {
  if (amount <= 0) return null;

  const breakdown = useMemo(() => getChipBreakdown(amount), [amount]);

  const config = {
    sm: { width: 'w-7', height: 'h-2', text: 'text-[8px]', overlap: '-mt-1' },
    md: { width: 'w-9', height: 'h-2.5', text: 'text-[9px]', overlap: '-mt-1.5' },
    lg: { width: 'w-11', height: 'h-3.5', text: 'text-[11px]', overlap: '-mt-2' },
  }[size];

  return (
    <div className="flex flex-col items-center select-none animate-float">
      <div className="flex items-end gap-1.5 justify-center">
        {breakdown.slice(0, 3).map((denom) => {
          const visibleCount = Math.min(denom.count, maxChipsShown);
          return (
            <div key={denom.value} className="flex flex-col-reverse items-center relative group">
              {Array.from({ length: visibleCount }).map((_, idx) => {
                const isTopChip = idx === visibleCount - 1;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: denom.color,
                      borderColor: denom.borderColor,
                    }}
                    className={`relative ${config.width} ${config.height} ${
                      idx === 0 ? '' : config.overlap
                    } rounded-full border border-white/30 flex items-center justify-center shadow-md transition-transform group-hover:-translate-y-0.5`}
                  >
                    {/* Chip Edge Markings / Pattern */}
                    <div className="absolute inset-x-1 inset-y-0 flex justify-between pointer-events-none opacity-40">
                      <div className="w-0.5 h-full bg-white/80" />
                      <div className="w-0.5 h-full bg-white/80" />
                    </div>

                    {isTopChip && (
                      <div className="w-4/5 h-4/5 rounded-full border border-white/20 flex items-center justify-center bg-black/20 shadow-inner">
                        <span
                          style={{
                            color: denom.value === 1 || denom.value === 1000 ? '#0f172a' : '#ffffff',
                          }}
                          className={`font-black font-mono leading-none tracking-tighter drop-shadow-sm ${config.text}`}
                        >
                          {denom.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              {denom.count > 1 && (
                <span className="text-[9px] font-mono font-bold text-amber-200 mt-1 bg-slate-950/90 border border-slate-800 px-1 py-0.2 rounded-full shadow">
                  ×{denom.count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {showLabel && (
        <div className="mt-1 bg-slate-950/95 border border-amber-400/50 text-amber-300 font-extrabold font-mono px-2 py-0.5 rounded-full text-[11px] shadow-md tracking-wide flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          {formatChips(amount)}
        </div>
      )}
    </div>
  );
});

