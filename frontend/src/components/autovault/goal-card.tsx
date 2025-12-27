'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatEther } from 'viem';
import { motion, useSpring, useTransform } from 'motion/react';
import { Target, Calendar, Trophy, Lock, Unlock, Plus, Sparkles } from 'lucide-react';
import { useMemo, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { milestones } from '@/lib/design-tokens';

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
    className?: string;
}

// Get gradient class based on progress
function getGradientClass(progressPercent: number): string {
    if (progressPercent >= 100) {
        return 'bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950/30 dark:to-yellow-900/20';
    }
    if (progressPercent >= 25) {
        return 'bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/30 dark:to-teal-900/20';
    }
    return 'bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/30 dark:to-slate-800/20';
}

// Milestone badge component
function MilestoneBadge({
    milestone,
    isAchieved
}: {
    milestone: number;
    isAchieved: boolean;
}) {
    const badgeClasses: Record<number, string> = {
        25: 'bg-blue-500 text-white',
        50: 'bg-yellow-500 text-white',
        75: 'bg-orange-500 text-white',
        100: 'bg-green-500 text-white',
    };

    return (
        <motion.div
            initial={isAchieved ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                isAchieved ? badgeClasses[milestone] : 'bg-muted text-muted-foreground'
            )}
            data-testid={`milestone-badge-${milestone}`}
            data-achieved={isAchieved}
        >
            {milestone}
        </motion.div>
    );
}

export function GoalCard({
    goal,
    onDeposit,
    onWithdraw,
    isPending,
    className,
}: GoalCardProps) {
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

    // Animated progress for the ring
    const springProgress = useSpring(0, { stiffness: 60, damping: 20 });
    const circumference = 2 * Math.PI * 56; // radius = 56

    useEffect(() => {
        springProgress.set(goal.progressPercent);
    }, [goal.progressPercent, springProgress]);

    const strokeDasharray = useTransform(
        springProgress,
        (value) => `${(value / 100) * circumference} ${circumference}`
    );

    const gradientClass = getGradientClass(goal.progressPercent);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className={className}
        >
            <Card
                className={cn(
                    'relative overflow-hidden transition-all duration-300 card-hover-shadow',
                    gradientClass,
                    goal.isCompleted && 'ring-2 ring-green-500/50'
                )}
                data-testid="goal-card"
                data-progress={goal.progressPercent}
            >
                {/* Completed trophy */}
                {goal.isCompleted && (
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute top-3 right-3"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                            <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </motion.div>
                )}

                {/* Unlocked celebration indicator */}
                {goal.isUnlocked && !goal.isWithdrawn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-3 left-3"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </motion.div>
                )}

                <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-semibold text-center">{goal.name}</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Progress circle with animated ring */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full" viewBox="0 0 128 128">
                                {/* Background track */}
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-muted/50"
                                />
                                {/* Animated progress ring */}
                                <motion.circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    className="text-primary"
                                    style={{
                                        strokeDasharray,
                                        transform: 'rotate(-90deg)',
                                        transformOrigin: '50% 50%',
                                    }}
                                    data-testid="goal-progress-ring"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    className="text-2xl font-bold"
                                    key={goal.progressPercent}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
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
                            ${formattedCurrent}
                            <span className="text-muted-foreground font-normal"> / ${formattedTarget}</span>
                        </p>
                    </div>

                    {/* Milestone badges */}
                    <div className="flex justify-center gap-2">
                        {milestones.map((milestone) => (
                            <MilestoneBadge
                                key={milestone}
                                milestone={milestone}
                                isAchieved={goal.lastMilestone >= milestone}
                            />
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
                    <div className="flex items-center justify-center">
                        {goal.isUnlocked ? (
                            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                <Unlock className="h-4 w-4" />
                                Ready to withdraw
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Lock className="h-4 w-4" />
                                Locked until target reached
                            </span>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                        {!goal.isWithdrawn && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 touch-target"
                                    onClick={onDeposit}
                                    disabled={goal.isCompleted || isPending}
                                >
                                    <Plus className="h-4 w-4 mr-1.5" />
                                    Add Funds
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 touch-target"
                                    onClick={onWithdraw}
                                    disabled={!goal.isUnlocked || isPending}
                                >
                                    {isPending ? 'Processing...' : 'Withdraw'}
                                </Button>
                            </>
                        )}
                        {goal.isWithdrawn && (
                            <div className="w-full text-center py-2">
                                <span className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    Goal completed & withdrawn
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Compact goal card for dashboard
export function GoalCardCompact({
    goal,
    onClick,
}: {
    goal: GoalCardProps['goal'];
    onClick?: () => void;
}) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-left"
        >
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
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
                <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </motion.button>
    );
}
