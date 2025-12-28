'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useGoals, type Goal } from '@/hooks/use-goals';
import { useMNEE } from '@/hooks/use-mnee';
import { GoalCard } from '@/components/autovault/goal-card';
import { HeroSectionCompact } from '@/components/autovault/hero-section';
import { StatCard } from '@/components/autovault/stat-card';
import { EmptyStateWidget } from '@/components/autovault/dashboard-widgets';
import { motion } from 'motion/react';
import { Plus, Target, Trophy, Clock } from 'lucide-react';
import { useAccount } from 'wagmi';
import { getContractAddresses } from '@/lib/contracts/addresses';
import { parseEther, formatEther } from 'viem';

export default function GoalsPage() {
    const { chainId } = useAccount();
    const addresses = chainId ? getContractAddresses(chainId) : getContractAddresses(11155111);

    const { goals, isLoading, createGoal, depositToGoal, withdrawGoal, isPending } = useGoals();
    const { formattedBalance: walletBalance, approve, isApproving, isApproved } = useMNEE(addresses.goalLocker);

    const [createOpen, setCreateOpen] = useState(false);
    const [depositOpen, setDepositOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [depositAmount, setDepositAmount] = useState('');

    const activeGoals = goals.filter(g => !g.isWithdrawn);
    const completedGoals = goals.filter(g => g.isCompleted && !g.isWithdrawn);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0n);

    const handleCreateGoal = async () => {
        if (!newGoalName || !newGoalTarget) return;
        const target = parseEther(newGoalTarget);
        const deadline = newGoalDeadline ? Math.floor(new Date(newGoalDeadline).getTime() / 1000) : 0;
        await createGoal(newGoalName, target, deadline);
        setCreateOpen(false);
        setNewGoalName('');
        setNewGoalTarget('');
        setNewGoalDeadline('');
    };

    const handleDeposit = async () => {
        if (!depositAmount || !selectedGoal) return;
        const amount = parseEther(depositAmount);
        // ERC-1155 uses setApprovalForAll - approve once for all amounts
        if (!isApproved) {
            await approve(addresses.goalLocker);
        }
        await depositToGoal(selectedGoal.id, amount);
        setDepositOpen(false);
        setDepositAmount('');
        setSelectedGoal(null);
    };

    const handleWithdraw = async (goal: Goal) => {
        await withdrawGoal(goal.id);
    };

    const formattedTotalSaved = parseFloat(formatEther(totalSaved)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="space-y-6">
            <HeroSectionCompact title="Savings Goals" subtitle="Lock funds until you reach your targets" accentColor="goals">
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="touch-target"><Plus className="h-4 w-4 mr-2" />Create Goal</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create New Goal</DialogTitle><DialogDescription>Set a savings target with optional deadline</DialogDescription></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2"><Label>Goal Name</Label><Input placeholder="e.g., Vacation Fund" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Target Amount (MNEE)</Label><Input type="number" placeholder="1000" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} /></div>
                            <div className="space-y-2">
                                <Label>Deadline (Optional)</Label>
                                <Input type="date" value={newGoalDeadline} onChange={(e) => setNewGoalDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                                <p className="text-xs text-muted-foreground">Leave empty for no deadline - unlock only when target is reached</p>
                            </div>
                        </div>
                        <DialogFooter><Button onClick={handleCreateGoal} disabled={isPending || !newGoalName || !newGoalTarget}>{isPending ? 'Creating...' : 'Create Goal'}</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </HeroSectionCompact>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total Saved" value={`$${formattedTotalSaved}`} icon={Target} accentColor="goals" isLoading={isLoading} />
                <StatCard title="Active Goals" value={activeGoals.length} subtitle="In progress" icon={Clock} accentColor="goals" isLoading={isLoading} />
                <StatCard title="Ready to Withdraw" value={completedGoals.length} subtitle="Goals completed" icon={Trophy} accentColor="goals" isLoading={isLoading} />
            </div>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-xl" />)}</div>
            ) : activeGoals.length === 0 ? (
                <EmptyStateWidget icon={<Target className="h-12 w-12" />} title="No goals created yet" description="Set your first savings goal and start building towards your dreams" actionLabel="Create Your First Goal" actionHref="#" variant="goals" />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeGoals.map((goal, index) => (
                        <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                            <GoalCard goal={goal} onDeposit={() => { setSelectedGoal(goal); setDepositOpen(true); }} onWithdraw={() => handleWithdraw(goal)} isPending={isPending} />
                        </motion.div>
                    ))}
                </div>
            )}

            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Deposit to {selectedGoal?.name}</DialogTitle><DialogDescription>Add funds to your savings goal</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Amount (MNEE)</Label>
                            <Input type="number" placeholder="0.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="text-lg" />
                            <p className="text-xs text-muted-foreground">Wallet balance: ${walletBalance}</p>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleDeposit} disabled={isPending || isApproving || !depositAmount}>{isPending || isApproving ? 'Processing...' : 'Deposit'}</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
