'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDCA } from '@/hooks/use-dca';
import { useGoals } from '@/hooks/use-goals';
import { motion } from 'motion/react';
import { Clock, Target, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

function formatCountdown(seconds: number): string {
    if (seconds <= 0) return 'Ready now';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

export function DCACountdownWidget() {
    const { strategies, isLoading } = useDCA();
    const [now, setNow] = useState(Math.floor(Date.now() / 1000));

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Math.floor(Date.now() / 1000));
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const activeStrategies = strategies.filter(s => s.isActive);
    const nextExecution = activeStrategies.length > 0
        ? Math.min(...activeStrategies.map(s => s.nextExecution))
        : null;

    const secondsUntilNext = nextExecution ? nextExecution - now : null;

    return (
        <Card className="h-full bg-gradient-dca">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next DCA</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                    <Clock className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-9 w-24" />
                ) : activeStrategies.length === 0 ? (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">No active strategies</p>
                        <Link href="/dca">
                            <Button size="sm" variant="outline" className="w-full">
                                Set Up DCA
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <motion.div
                            className="text-balance-sm text-amber-700 dark:text-amber-300"
                            key={secondsUntilNext}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {formatCountdown(secondsUntilNext || 0)}
                        </motion.div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {activeStrategies.length} active {activeStrategies.length === 1 ? 'strategy' : 'strategies'}
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export function GoalProgressWidget() {
    const { goals, isLoading } = useGoals();

    const activeGoals = goals.filter(g => !g.isWithdrawn);
    const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0n);
    const totalCurrent = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0n);
    const overallProgress = totalTarget > 0n
        ? Number((totalCurrent * 100n) / totalTarget)
        : 0;

    return (
        <Card className="h-full bg-gradient-goals">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500">
                    <Target className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-9 w-24" />
                ) : activeGoals.length === 0 ? (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">No active goals</p>
                        <Link href="/goals">
                            <Button size="sm" variant="outline" className="w-full">
                                Create Goal
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex items-end gap-2">
                            <motion.span
                                className="text-balance-sm text-purple-700 dark:text-purple-300"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {overallProgress}%
                            </motion.span>
                            <span className="text-sm text-muted-foreground mb-1">overall</span>
                        </div>
                        <div className="h-2.5 bg-purple-200 dark:bg-purple-900/50 rounded-full overflow-hidden mt-3">
                            <motion.div
                                className="h-full bg-purple-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${overallProgress}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            ${parseFloat(formatEther(totalCurrent)).toFixed(0)} / ${parseFloat(formatEther(totalTarget)).toFixed(0)}
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export function AIInsightsWidget() {
    return (
        <Card className="h-full bg-gradient-ai border-blue-200 dark:border-blue-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Get personalized advice on optimizing your savings strategy
                </p>
                <Link href="/advisor">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        Ask AI Advisor <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

export function QuickStatsWidget() {
    const { strategies } = useDCA();
    const { goals } = useGoals();

    const totalDCAInvested = strategies.reduce((sum, s) => sum + s.totalInvested, 0n);
    const goalsCompleted = goals.filter(g => g.isCompleted && !g.isWithdrawn).length;

    return (
        <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-dca">
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500">
                            <TrendingUp className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-xs text-muted-foreground">DCA Invested</span>
                    </div>
                    <p className="text-lg font-bold mt-2 text-amber-700 dark:text-amber-300">
                        ${parseFloat(formatEther(totalDCAInvested)).toFixed(2)}
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-goals">
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500">
                            <Target className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-xs text-muted-foreground">Goals Ready</span>
                    </div>
                    <p className="text-lg font-bold mt-2 text-purple-700 dark:text-purple-300">
                        {goalsCompleted}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

// Empty state component
export function EmptyStateWidget({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    variant = 'default',
    accentColor,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    variant?: 'default' | 'savings' | 'goals' | 'dca' | 'ai';
    accentColor?: 'teal' | 'purple' | 'amber' | 'blue';
}) {
    const variantStyles = {
        default: 'bg-muted',
        savings: 'bg-gradient-savings',
        goals: 'bg-gradient-goals',
        dca: 'bg-gradient-dca',
        ai: 'bg-gradient-ai',
    };

    const iconStyles = {
        default: 'bg-muted-foreground/10 text-muted-foreground',
        savings: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        goals: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        dca: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        ai: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    };

    const accentStyles = {
        teal: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    };

    const iconStyle = accentColor ? accentStyles[accentColor] : iconStyles[variant];

    return (
        <Card className={cn('rounded-xl overflow-hidden', variantStyles[variant])}>
            <CardContent className="p-8 text-center">
                <div className={cn(
                    'h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4',
                    iconStyle
                )}>
                    {icon}
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">{description}</p>
                {actionLabel && (
                    onAction ? (
                        <Button onClick={onAction}>{actionLabel}</Button>
                    ) : actionHref ? (
                        <Link href={actionHref}>
                            <Button>{actionLabel}</Button>
                        </Link>
                    ) : null
                )}
            </CardContent>
        </Card>
    );
}
