'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'motion/react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type AccentColor } from '@/lib/design-tokens';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    accentColor?: AccentColor;
    isLoading?: boolean;
    className?: string;
}

const accentStyles: Record<AccentColor, { bg: string; text: string; iconBg: string }> = {
    savings: {
        bg: 'bg-gradient-savings',
        text: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    goals: {
        bg: 'bg-gradient-goals',
        text: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    dca: {
        bg: 'bg-gradient-dca',
        text: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    ai: {
        bg: 'bg-gradient-ai',
        text: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    },
};

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    accentColor,
    isLoading = false,
    className,
}: StatCardProps) {
    const styles = accentColor ? accentStyles[accentColor] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={className}
        >
            <Card className={cn(
                'relative overflow-hidden transition-all duration-200 card-hover-shadow',
                styles?.bg
            )}>
                <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">{title}</p>

                            {isLoading ? (
                                <Skeleton className="h-9 w-28" />
                            ) : (
                                <motion.div
                                    className="text-balance-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={String(value)}
                                >
                                    {value}
                                </motion.div>
                            )}

                            {subtitle && !isLoading && (
                                <p className="text-xs text-muted-foreground">{subtitle}</p>
                            )}

                            {trend && !isLoading && (
                                <div className={cn(
                                    'flex items-center gap-1 text-xs font-medium',
                                    trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                )}>
                                    {trend.isPositive ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                                </div>
                            )}
                        </div>

                        <div className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            styles?.iconBg || 'bg-muted'
                        )}>
                            <Icon className={cn(
                                'h-5 w-5',
                                styles?.text || 'text-muted-foreground'
                            )} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Compact variant for dashboard widgets
interface StatCardCompactProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    accent?: AccentColor;
    isLoading?: boolean;
    className?: string;
}

const compactAccentStyles: Record<AccentColor, { text: string; iconBg: string }> = {
    savings: {
        text: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    goals: {
        text: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    dca: {
        text: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    ai: {
        text: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    },
};

export function StatCardCompact({
    title,
    value,
    icon,
    accent,
    isLoading = false,
    className,
}: StatCardCompactProps) {
    const styles = accent ? compactAccentStyles[accent] : null;

    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        styles?.iconBg || 'bg-muted',
                        styles?.text || 'text-muted-foreground'
                    )}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{title}</p>
                        {isLoading ? (
                            <Skeleton className="h-5 w-16 mt-0.5" />
                        ) : (
                            <p className="text-lg font-bold">{value}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
