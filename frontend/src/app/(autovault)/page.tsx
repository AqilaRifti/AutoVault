'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSmartVault } from '@/hooks/use-smart-vault';
import { useGoals } from '@/hooks/use-goals';
import { useMNEE } from '@/hooks/use-mnee';
import { BucketChart } from '@/components/autovault/bucket-chart';
import { HeroSection } from '@/components/autovault/hero-section';
import { FeatureCard, FeatureCardGrid } from '@/components/autovault/feature-card';
import { StatCard } from '@/components/autovault/stat-card';
import { GoalCardCompact } from '@/components/autovault/goal-card';
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
} from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { getContractAddresses } from '@/lib/contracts/addresses';
import { parseEther } from 'viem';

export default function DashboardPage() {
    const { chainId } = useAccount();
    const addresses = chainId ? getContractAddresses(chainId) : getContractAddresses(11155111);

    const { buckets, totalBalance, formattedTotalBalance, isLoading: isBucketsLoading, rebalance, deposit, isPending } = useSmartVault();
    const { goals, isLoading: isGoalsLoading } = useGoals();
    const { formattedBalance: mneeBalance, isLoading: isMneeLoading, mint, isMinting, approve, isApproving, isApproved } = useMNEE(addresses.smartVault);

    const [depositOpen, setDepositOpen] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');

    const activeGoals = goals.filter(g => !g.isWithdrawn);
    const completedGoals = goals.filter(g => g.isCompleted && !g.isWithdrawn);
    const activeBuckets = buckets.filter(b => b.isActive);

    const handleDeposit = async () => {
        if (!depositAmount) return;
        const amount = parseEther(depositAmount);

        // ERC-1155 uses setApprovalForAll - approve once for all amounts
        if (!isApproved) {
            await approve(addresses.smartVault);
            return;
        }

        await deposit(amount);
        setDepositOpen(false);
        setDepositAmount('');
    };

    const needsApproval = !isApproved;

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <HeroSection
                totalBalance={formattedTotalBalance}
                walletBalance={mneeBalance}
                isLoading={isBucketsLoading || isMneeLoading}
                onDeposit={() => setDepositOpen(true)}
                onMint={() => mint()}
                isMinting={isMinting}
            />

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Buckets"
                    value={activeBuckets.length}
                    subtitle="Auto-distributing deposits"
                    icon={Wallet}
                    accentColor="savings"
                    isLoading={isBucketsLoading}
                />
                <StatCard
                    title="Active Goals"
                    value={activeGoals.length}
                    subtitle={`${completedGoals.length} ready to withdraw`}
                    icon={Target}
                    accentColor="goals"
                    isLoading={isGoalsLoading}
                />
                <StatCard
                    title="DCA Strategies"
                    value="0"
                    subtitle="Set up automated investing"
                    icon={TrendingUp}
                    accentColor="dca"
                />
                <StatCard
                    title="AI Insights"
                    value="Ready"
                    subtitle="Get personalized advice"
                    icon={Sparkles}
                    accentColor="ai"
                />
            </div>

            {/* Feature Cards */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Quick Access</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rebalance()}
                        disabled={isPending || totalBalance === 0n}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
                        Rebalance
                    </Button>
                </div>
                <FeatureCardGrid>
                    <FeatureCard
                        title="Smart Buckets"
                        description="Auto-distribute your savings across categories"
                        metric={`$${formattedTotalBalance}`}
                        metricLabel="Total Balance"
                        href="/buckets"
                        variant="savings"
                        icon={Wallet}
                    />
                    <FeatureCard
                        title="Savings Goals"
                        description="Lock funds until you reach your targets"
                        metric={String(activeGoals.length)}
                        metricLabel="Active Goals"
                        href="/goals"
                        variant="goals"
                        icon={Target}
                    />
                    <FeatureCard
                        title="DCA Strategies"
                        description="Automate your investment schedule"
                        metric="0"
                        metricLabel="Active Strategies"
                        href="/dca"
                        variant="dca"
                        icon={TrendingUp}
                    />
                    <FeatureCard
                        title="AI Advisor"
                        description="Get personalized financial guidance"
                        metric="Ask Now"
                        metricLabel="Powered by AI"
                        href="/advisor"
                        variant="ai"
                        icon={Sparkles}
                    />
                </FeatureCardGrid>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Bucket Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="h-full">
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
                                <div className="h-[280px] flex items-center justify-center">
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
                    transition={{ delay: 0.3 }}
                >
                    <Card className="h-full">
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
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                    ))}
                                </div>
                            ) : activeGoals.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                                        <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <p className="text-muted-foreground mb-4">No active goals yet</p>
                                    <Link href="/goals">
                                        <Button>Create Your First Goal</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeGoals.slice(0, 4).map((goal) => (
                                        <GoalCardCompact key={goal.id} goal={goal} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Bottom Widgets Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <DCACountdownWidget />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <GoalProgressWidget />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="sm:col-span-2 lg:col-span-1"
                >
                    <AIInsightsWidget />
                </motion.div>
            </div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
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

            {/* Deposit Dialog */}
            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deposit to Vault</DialogTitle>
                        <DialogDescription>
                            Funds will be automatically distributed across your buckets
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Amount (MNEE)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Wallet balance: ${mneeBalance}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleDeposit}
                            disabled={isPending || isApproving || !depositAmount}
                        >
                            {isPending || isApproving
                                ? 'Processing...'
                                : needsApproval
                                    ? 'Approve MNEE'
                                    : 'Deposit'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
