'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatEther } from 'viem';
import { useMemo } from 'react';

interface BucketChartProps {
    buckets: Array<{
        id: number;
        name: string;
        targetPercentage: number;
        balance: bigint;
        color: string;
        isActive: boolean;
    }>;
    totalBalance: bigint;
}

export function BucketChart({ buckets, totalBalance }: BucketChartProps) {
    const chartData = useMemo(() => {
        if (buckets.length === 0 || totalBalance === 0n) {
            return [{ name: 'No funds', value: 1, color: '#e5e7eb' }];
        }

        return buckets
            .filter((b) => b.isActive && b.balance > 0n)
            .map((bucket) => ({
                name: bucket.name,
                value: Number(formatEther(bucket.balance)),
                color: bucket.color,
                percentage: Number((bucket.balance * 100n) / totalBalance),
            }));
    }, [buckets, totalBalance]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm text-muted-foreground">
                        ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {data.percentage && (
                        <p className="text-sm text-muted-foreground">
                            {data.percentage.toFixed(1)}% of total
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        name,
    }: any) => {
        if (percent < 0.05) return null; // Don't show label for small slices

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-medium"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry: any) => (
                            <span className="text-sm">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
