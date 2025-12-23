'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatEther } from 'viem';
import { motion } from 'motion/react';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';
import { useMemo } from 'react';

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
}

export function BucketCard({
    bucket,
    totalBalance,
    onDeposit,
    onWithdraw,
    onTransfer,
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="relative overflow-hidden">
                {/* Color indicator bar */}
                <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: bucket.color }}
                />

                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">{bucket.name}</CardTitle>
                        <span
                            className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{
                                backgroundColor: `${bucket.color}20`,
                                color: bucket.color,
                            }}
                        >
                            {bucket.targetPercentage}%
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Balance display with animation */}
                    <div>
                        <motion.p
                            className="text-2xl font-bold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={bucket.balance.toString()}
                        >
                            ${formattedBalance}
                        </motion.p>
                        <p className="text-xs text-muted-foreground">
                            {fillPercentage.toFixed(1)}% of total
                        </p>
                    </div>

                    {/* Fill level progress bar */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Fill Level</span>
                            <span className={isOverTarget ? 'text-amber-500' : isUnderTarget ? 'text-blue-500' : ''}>
                                {isOverTarget ? 'Over target' : isUnderTarget ? 'Under target' : 'On target'}
                            </span>
                        </div>
                        <div className="relative">
                            <Progress
                                value={Math.min(fillPercentage, 100)}
                                className="h-2"
                                style={{
                                    // @ts-ignore - custom CSS variable
                                    '--progress-background': bucket.color,
                                }}
                            />
                            {/* Target indicator */}
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
                                style={{ left: `${bucket.targetPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={onDeposit}
                        >
                            <ArrowDownToLine className="h-4 w-4 mr-1" />
                            Deposit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={onWithdraw}
                            disabled={bucket.balance === 0n}
                        >
                            <ArrowUpFromLine className="h-4 w-4 mr-1" />
                            Withdraw
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
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
