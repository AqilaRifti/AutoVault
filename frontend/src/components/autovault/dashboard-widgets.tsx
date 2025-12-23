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
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const activeStrategies = strategies.filter(s => s.isActive);
    const nextExecution = activeStrategies.length > 0
        ? Math.min(...activeStrategies.map(s => s.nextExecution))
        : null;

    const secondsUntilNext = nextExecution ? nextExecution - now : null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next DCA</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                ) : activeStrategies.length === 0 ? (
                    <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground mb-2">No active strategies</p>
                        <Link href="/dca">
                            <Button size="sm" variant="outline">Set Up DCA</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <motion.div
                            className="text-2xl font-bold"
                            key={secondsUntilNext}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {formatCountdown(secondsUntilNext || 0)}
                        </motion.div>
                        <p className="text-xs text-muted-foreground">
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                ) : activeGoals.length === 0 ? (
                    <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground mb-2">No active goals</p>
                        <Link href="/goals">
                            <Button size="sm" variant="outline">Create Goal</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex items-end gap-2">
                            <motion.span
                                className="text-2xl font-bold"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {overallProgress}%
                            </motion.span>
                            <span className="text-sm text-muted-foreground mb-1">overall</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${overallProgress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
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
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
                <Sparkles className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                    Get personalized advice on optimizing your savings strategy
                </p>
                <Link href="/advisor">
                    <Button size="sm" className="w-full">
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
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <span className="text-xs text-muted-foreground">DCA Invested</span>
                    </div>
                    <p className="text-lg font-bold mt-1">
                        ${parseFloat(formatEther(totalDCAInvested)).toFixed(2)}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">Goals Ready</span>
                    </div>
                    <p className="text-lg font-bold mt-1">{goalsCompleted}</p>
                </CardContent>
            </Card>
        </div>
    );
}
