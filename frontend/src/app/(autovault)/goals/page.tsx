'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useGoals, type Goal } from '@/hooks/use-goals';
import { useMNEE } from '@/hooks/use-mnee';
import { GoalCard } from '@/components/autovault/goal-card';
import { motion } from 'motion/react';
import { Plus, Target, Trophy, Clock } from 'lucide-react';
import { useAccount } from 'wagmi';
import { getContractAddresses } from '@/lib/contracts/addresses';
import { parseEther, formatEther } from 'viem';

export default function GoalsPage() {
    const { chainId } = useAccount();
    const addresses = chainId ? getContractAddresses(chainId) : getContractAddresses(11155111);

    const { goals, isLoading, createGoal, depositToGoal, withdrawGoal, isPending } = useGoals();
    const { formattedBalance: walletBalance, approve, isApproving } = useMNEE(addresses.goalLocker);

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
        await approve(addresses.goalLocker, amount);
        await depositToGoal(selectedGoal.id, amount);
        setDepositOpen(false);
        setDepositAmount('');
        setSelectedGoal(null);
    };

    const handleWithdraw = async (goal: Goal) => {
        await withdrawGoal(goal.id);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Savings Goals</h1>
                    <p className="text-muted-foreground">Lock funds until you reach your targets</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Create Goal</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Goal</DialogTitle>
                            <DialogDescription>Set a savings target with optional deadline</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Goal Name</Label>
                                <Input placeholder="e.g., Vacation Fund" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Amount (MNEE)</Label>
                                <Input type="number" placeholder="1000" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Deadline (Optional)</Label>
                                <Input type="date" value={newGoalDeadline} onChange={(e) => setNewGoalDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                                <p className="text-xs text-muted-foreground">Leave empty for no deadline - unlock only when target is reached</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateGoal} disabled={isPending || !newGoalName || !newGoalTarget}>
                                {isPending ? 'Creating...' : 'Create Goal'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-24" /> : (
                                <div className="text-2xl font-bold">${parseFloat(formatEther(totalSaved)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-16" /> : (
                                <div className="text-2xl font-bold">{activeGoals.length}</div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ready to Withdraw</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-16" /> : (
                                <div className="text-2xl font-bold text-green-500">{completedGoals.length}</div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-64" />))}
                </div>
            ) : activeGoals.length === 0 ? (
                <Card className="py-12">
                    <CardContent className="text-center">
                        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No goals created yet</p>
                        <Button onClick={() => setCreateOpen(true)}>Create Your First Goal</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeGoals.map((goal, index) => (
                        <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                            <GoalCard
                                goal={goal}
                                onDeposit={() => { setSelectedGoal(goal); setDepositOpen(true); }}
                                onWithdraw={() => handleWithdraw(goal)}
                                isPending={isPending}
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deposit to {selectedGoal?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Amount (MNEE)</Label>
                            <Input type="number" placeholder="0.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                            <p className="text-xs text-muted-foreground">Wallet balance: ${walletBalance}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleDeposit} disabled={isPending || isApproving || !depositAmount}>
                            {isPending || isApproving ? 'Processing...' : 'Deposit'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
