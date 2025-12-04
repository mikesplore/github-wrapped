"use client";

import { useMemo } from "react";

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  maxValue?: number;
  title?: string;
}

export function SimpleBarChart({ data, maxValue, title }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  const colors = [
    "bg-accent",
    "bg-primary",
    "bg-secondary",
    "bg-chart-1",
    "bg-chart-2",
    "bg-chart-3",
    "bg-chart-4",
    "bg-chart-5",
  ];

  return (
    <div className="w-full space-y-3">
      {title && <h3 className="text-sm font-bold sm:text-base">{title}</h3>}
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium truncate max-w-[60%]">{item.label}</span>
            <span className="font-bold">{item.value.toLocaleString()}</span>
          </div>
          <div className="h-6 w-full overflow-hidden rounded-full bg-muted/30">
            <div
              className={`h-full transition-all duration-500 ${item.color || colors[index % colors.length]}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface PieChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title?: string;
}

export function SimplePieChart({ data, title }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const colors = [
    "hsl(var(--accent))",
    "hsl(var(--primary))",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const segments = useMemo(() => {
    let currentAngle = -90; // Start from top
    return data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (percentage / 100) * 360;
      const segment = {
        ...item,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: item.color || colors[index % colors.length],
      };
      currentAngle += angle;
      return segment;
    });
  }, [data, total, colors]);

  return (
    <div className="w-full space-y-4">
      {title && <h3 className="text-center text-sm font-bold sm:text-base">{title}</h3>}
      
      {/* Simple visual representation */}
      <div className="flex flex-wrap justify-center gap-2">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="rounded-lg p-3 text-center"
            style={{ 
              backgroundColor: segment.color,
              minWidth: '80px',
              opacity: 0.9
            }}
          >
            <div className="text-xs font-bold text-white sm:text-sm">
              {segment.percentage.toFixed(1)}%
            </div>
            <div className="mt-1 text-xs text-white/90 truncate max-w-[100px]">
              {segment.label}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color || colors[index % colors.length] }}
            />
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatComparisonProps {
  stats: Array<{ label: string; value: number | string; icon?: React.ReactNode }>;
  title?: string;
}

export function StatComparison({ stats, title }: StatComparisonProps) {
  return (
    <div className="w-full space-y-3">
      {title && <h3 className="text-center text-sm font-bold sm:text-base mb-4">{title}</h3>}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-lg bg-accent/10 p-3 text-center backdrop-blur-sm sm:p-4"
          >
            {stat.icon && (
              <div className="mb-2 flex justify-center text-accent">
                {stat.icon}
              </div>
            )}
            <div className="text-2xl font-black sm:text-3xl md:text-4xl">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
