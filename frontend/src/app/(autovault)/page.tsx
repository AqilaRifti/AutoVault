'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSmartVault } from '@/hooks/use-smart-vault';
import { useGoals } from '@/hooks/use-goals';
import { useMNEE } from '@/hooks/use-mnee';
import { BucketChart } from '@/components/autovault/bucket-chart';
import { DCACountdownWidget, GoalProgressWidget, AIInsightsWidget } from '@/components/autovault/dashboard-widgets';
import { TransactionHistoryCompact } from '@/components/autovault/transaction-history';
import { motion } from 'motion/react';
import {
    Wallet,
    Target,
    TrendingUp,
    Sparkles,
    ArrowRight,
    RefreshCw,
    Droplets
} from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { getContractAddresses } from '@/lib/contracts/addresses';

export default function DashboardPage() {
    const { address, chainId } = useAccount();
    const addresses = chainId ? getContractAddresses(chainId) : getContractAddresses(11155111);

    const { buckets, totalBalance, formattedTotalBalance, isLoading: isBucketsLoading, rebalance, isPending } = useSmartVault();
    const { goals, isLoading: isGoalsLoading } = useGoals();
    const { formattedBalance: mneeBalance, isLoading: isMneeLoading, mint, isMinting } = useMNEE(addresses.smartVault);

    const activeGoals = goals.filter(g => !g.isWithdrawn);
    const completedGoals = goals.filter(g => g.isCompleted && !g.isWithdrawn);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Your programmable savings overview</p>
                </div>
                <Button
                    onClick={() => rebalance()}
                    disabled={isPending || totalBalance === 0n}
                    variant="outline"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
                    Rebalance Buckets
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Balance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total in Vault</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isBucketsLoading ? (
                                <Skeleton className="h-8 w-24" />
                            ) : (
                                <motion.div
                                    className="text-2xl font-bold"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={formattedTotalBalance}
                                >
                                    ${formattedTotalBalance}
                                </motion.div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                MNEE stablecoin
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Wallet Balance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isMneeLoading ? (
                                <Skeleton className="h-8 w-24" />
                            ) : (
                                <div className="text-2xl font-bold">${mneeBalance}</div>
                            )}
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Available to deposit
                                </p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs text-primary hover:text-primary"
                                    onClick={() => mint()}
                                    disabled={isMinting}
                                >
                                    <Droplets className="h-3 w-3 mr-1" />
                                    {isMinting ? 'Minting...' : 'Get Test MNEE'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Active Goals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isGoalsLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-2xl font-bold">{activeGoals.length}</div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {completedGoals.length} ready to withdraw
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Buckets */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Buckets</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isBucketsLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-2xl font-bold">{buckets.filter(b => b.isActive).length}</div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Auto-distributing deposits
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Bucket Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Bucket Distribution</CardTitle>
                            <Link href="/buckets">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {isBucketsLoading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Skeleton className="h-[200px] w-[200px] rounded-full" />
                                </div>
                            ) : (
                                <BucketChart buckets={buckets} totalBalance={totalBalance} />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Goals Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Savings Goals</CardTitle>
                            <Link href="/goals">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {isGoalsLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : activeGoals.length === 0 ? (
                                <div className="text-center py-8">
                                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground mb-4">No active goals yet</p>
                                    <Link href="/goals">
                                        <Button>Create Your First Goal</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeGoals.slice(0, 3).map((goal) => (
                                        <div
                                            key={goal.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Target className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{goal.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {goal.progressPercent}% complete
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-primary"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${goal.progressPercent}%` }}
                                                        transition={{ duration: 0.5 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Link href="/buckets">
                                <Button variant="outline" className="w-full justify-start">
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Deposit to Vault
                                </Button>
                            </Link>
                            <Link href="/goals">
                                <Button variant="outline" className="w-full justify-start">
                                    <Target className="mr-2 h-4 w-4" />
                                    Create Goal
                                </Button>
                            </Link>
                            <Link href="/dca">
                                <Button variant="outline" className="w-full justify-start">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Set Up DCA
                                </Button>
                            </Link>
                            <Link href="/advisor">
                                <Button variant="outline" className="w-full justify-start">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Ask AI Advisor
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Bottom Widgets Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <DCACountdownWidget />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                >
                    <GoalProgressWidget />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                >
                    <AIInsightsWidget />
                </motion.div>
            </div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
            >
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Activity</CardTitle>
                        <Link href="/history">
                            <Button variant="ghost" size="sm">
                                View All <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <TransactionHistoryCompact />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
