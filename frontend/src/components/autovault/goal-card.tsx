'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatEther } from 'viem';
import { motion } from 'motion/react';
import { Target, Calendar, Trophy, Lock, Unlock, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';

interface GoalCardProps {
    goal: {
        id: number;
        name: string;
        targetAmount: bigint;
        currentAmount: bigint;
        deadline: number;
        lastMilestone: number;
        isCompleted: boolean;
        isWithdrawn: boolean;
        progressPercent: number;
        isUnlocked: boolean;
    };
    onDeposit?: () => void;
    onWithdraw?: () => void;
    isPending?: boolean;
}

export function GoalCard({ goal, onDeposit, onWithdraw, isPending }: GoalCardProps) {
    const formattedCurrent = useMemo(() => {
        return parseFloat(formatEther(goal.currentAmount)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [goal.currentAmount]);

    const formattedTarget = useMemo(() => {
        return parseFloat(formatEther(goal.targetAmount)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [goal.targetAmount]);

    const deadlineText = useMemo(() => {
        if (goal.deadline === 0) return 'No deadline';
        const deadlineDate = new Date(goal.deadline * 1000);
        const now = new Date();
        if (deadlineDate < now) return 'Deadline passed';
        return formatDistanceToNow(deadlineDate, { addSuffix: true });
    }, [goal.deadline]);

    const milestoneColors = {
        0: 'bg-gray-200',
        25: 'bg-blue-500',
        50: 'bg-yellow-500',
        75: 'bg-orange-500',
        100: 'bg-green-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={`relative overflow-hidden ${goal.isCompleted ? 'border-green-500' : ''}`}>
                {goal.isCompleted && (
                    <div className="absolute top-2 right-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                )}

                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-semibold">{goal.name}</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Progress circle */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-muted"
                                />
                                <motion.circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    className="text-primary"
                                    initial={{ strokeDasharray: '0 352' }}
                                    animate={{
                                        strokeDasharray: `${(goal.progressPercent / 100) * 352} 352`,
                                    }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    className="text-2xl font-bold"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {goal.progressPercent}%
                                </motion.span>
                                <span className="text-xs text-muted-foreground">complete</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount display */}
                    <div className="text-center">
                        <p className="text-lg font-semibold">
                            ${formattedCurrent} <span className="text-muted-foreground">/ ${formattedTarget}</span>
                        </p>
                    </div>

                    {/* Milestones */}
                    <div className="flex justify-center gap-2">
                        {[25, 50, 75, 100].map((milestone) => (
                            <div
                                key={milestone}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${goal.lastMilestone >= milestone
                                    ? milestoneColors[milestone as keyof typeof milestoneColors] + ' text-white'
                                    : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                {milestone}
                            </div>
                        ))}
                    </div>

                    {/* Deadline */}
                    {goal.deadline > 0 && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{deadlineText}</span>
                        </div>
                    )}

                    {/* Lock status */}
                    <div className="flex items-center justify-center gap-2">
                        {goal.isUnlocked ? (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                                <Unlock className="h-4 w-4" />
                                Unlocked
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Lock className="h-4 w-4" />
                                Locked
                            </span>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        {!goal.isWithdrawn && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={onDeposit}
                                    disabled={goal.isCompleted || isPending}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Funds
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={onWithdraw}
                                    disabled={!goal.isUnlocked || isPending}
                                >
                                    {isPending ? 'Processing...' : 'Withdraw'}
                                </Button>
                            </>
                        )}
                        {goal.isWithdrawn && (
                            <p className="text-sm text-center text-muted-foreground w-full">
                                Goal completed & withdrawn
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
