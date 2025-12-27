'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatEther } from 'viem';
import { motion, useSpring, useTransform } from 'motion/react';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';
import { useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface BucketCardProps {
    bucket: {
        id: number;
        name: string;
        targetPercentage: number;
        balance: bigint;
        color: string;
        isActive: boolean;
    };
    totalBalance: bigint;
    onDeposit?: () => void;
    onWithdraw?: () => void;
    onTransfer?: () => void;
    className?: string;
}

export function BucketCard({
    bucket,
    totalBalance,
    onDeposit,
    onWithdraw,
    onTransfer,
    className,
}: BucketCardProps) {
    const formattedBalance = useMemo(() => {
        return parseFloat(formatEther(bucket.balance)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [bucket.balance]);

    const fillPercentage = useMemo(() => {
        if (totalBalance === 0n) return 0;
        return Number((bucket.balance * 100n) / totalBalance);
    }, [bucket.balance, totalBalance]);

    const targetBalance = useMemo(() => {
        if (totalBalance === 0n) return 0n;
        return (totalBalance * BigInt(bucket.targetPercentage * 100)) / 10000n;
    }, [totalBalance, bucket.targetPercentage]);

    const isOverTarget = bucket.balance > targetBalance;
    const isUnderTarget = bucket.balance < targetBalance && targetBalance > 0n;

    // Animated fill percentage
    const springFill = useSpring(0, { stiffness: 100, damping: 20 });

    useEffect(() => {
        springFill.set(Math.min(fillPercentage, 100));
    }, [fillPercentage, springFill]);

    const animatedWidth = useTransform(springFill, (value) => `${value}%`);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className={className}
        >
            <Card className="relative overflow-hidden transition-shadow duration-300 card-hover-shadow">
                {/* Color indicator bar - uses bucket.color */}
                <div
                    className="absolute top-0 left-0 right-0 h-1.5 rounded-t-lg"
                    style={{ backgroundColor: bucket.color }}
                    data-testid="bucket-header-bar"
                />

                <CardHeader className="pb-3 pt-5">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">{bucket.name}</CardTitle>
                        <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                                backgroundColor: `${bucket.color}15`,
                                color: bucket.color,
                            }}
                        >
                            {bucket.targetPercentage}%
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Balance display with animated counter */}
                    <div>
                        <motion.p
                            className="text-balance-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={bucket.balance.toString()}
                        >
                            ${formattedBalance}
                        </motion.p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {fillPercentage.toFixed(1)}% of total vault
                        </p>
                    </div>

                    {/* Fill level progress bar with target marker */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Fill Level</span>
                            <span
                                className={cn(
                                    'font-medium',
                                    isOverTarget && 'text-amber-600 dark:text-amber-400',
                                    isUnderTarget && 'text-blue-600 dark:text-blue-400',
                                    !isOverTarget && !isUnderTarget && 'text-emerald-600 dark:text-emerald-400'
                                )}
                            >
                                {isOverTarget ? 'Over target' : isUnderTarget ? 'Under target' : 'On target'}
                            </span>
                        </div>

                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                            {/* Animated fill bar */}
                            <motion.div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{
                                    width: animatedWidth,
                                    backgroundColor: bucket.color,
                                }}
                                data-testid="bucket-fill-indicator"
                            />

                            {/* Target indicator line */}
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-foreground/40 z-10"
                                style={{ left: `${bucket.targetPercentage}%` }}
                                data-testid="bucket-target-marker"
                            >
                                <div
                                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-foreground/40"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 touch-target"
                            onClick={onDeposit}
                        >
                            <ArrowDownToLine className="h-4 w-4 mr-1.5" />
                            Deposit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 touch-target"
                            onClick={onWithdraw}
                            disabled={bucket.balance === 0n}
                        >
                            <ArrowUpFromLine className="h-4 w-4 mr-1.5" />
                            Withdraw
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="touch-target"
                            onClick={onTransfer}
                            disabled={bucket.balance === 0n}
                        >
                            <ArrowLeftRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Compact bucket card for dashboard
export function BucketCardCompact({
    bucket,
    totalBalance,
    onClick,
}: {
    bucket: BucketCardProps['bucket'];
    totalBalance: bigint;
    onClick?: () => void;
}) {
    const formattedBalance = useMemo(() => {
        return parseFloat(formatEther(bucket.balance)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [bucket.balance]);

    const fillPercentage = useMemo(() => {
        if (totalBalance === 0n) return 0;
        return Number((bucket.balance * 100n) / totalBalance);
    }, [bucket.balance, totalBalance]);

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-left"
        >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: bucket.color }}
                />
                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{bucket.name}</p>
                    <p className="text-sm text-muted-foreground">
                        ${formattedBalance} · {fillPercentage.toFixed(0)}%
                    </p>
                </div>
                <div
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                        backgroundColor: `${bucket.color}15`,
                        color: bucket.color,
                    }}
                >
                    {bucket.targetPercentage}%
                </div>
            </div>
        </motion.button>
    );
}
