'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'motion/react';
import { ArrowDownToLine, Droplets, Wallet, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
    totalBalance: string;
    walletBalance: string;
    isLoading?: boolean;
    onDeposit: () => void;
    onMint: () => void;
    isMinting?: boolean;
    className?: string;
}

export function HeroSection({
    totalBalance,
    walletBalance,
    isLoading = false,
    onDeposit,
    onMint,
    isMinting = false,
    className,
}: HeroSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
                'relative overflow-hidden rounded-2xl bg-gradient-hero p-6 sm:p-8',
                className
            )}
        >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    {/* Main balance section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Wallet className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Total Vault Balance</span>
                        </div>

                        {isLoading ? (
                            <Skeleton className="h-14 w-48" />
                        ) : (
                            <motion.div
                                className="text-balance-lg"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={totalBalance}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                ${totalBalance}
                            </motion.div>
                        )}

                        <p className="text-sm text-muted-foreground">
                            MNEE stablecoin across all buckets
                        </p>
                    </div>

                    {/* Wallet balance and actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Wallet Balance</p>
                                {isLoading ? (
                                    <Skeleton className="h-5 w-20" />
                                ) : (
                                    <p className="font-semibold">${walletBalance}</p>
                                )}
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs"
                                onClick={onMint}
                                disabled={isMinting}
                            >
                                <Droplets className="h-3 w-3 mr-1" />
                                {isMinting ? 'Minting...' : 'Get MNEE'}
                            </Button>
                        </div>

                        <Button
                            size="lg"
                            className="touch-target shadow-lg hover:shadow-xl transition-shadow"
                            onClick={onDeposit}
                        >
                            <ArrowDownToLine className="h-4 w-4 mr-2" />
                            Deposit to Vault
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Compact hero for inner pages
export function HeroSectionCompact({
    title,
    subtitle,
    accentColor = 'savings',
    children,
    className,
}: {
    title: string;
    subtitle?: string;
    accentColor?: 'savings' | 'goals' | 'dca' | 'ai';
    children?: React.ReactNode;
    className?: string;
}) {
    const gradientClass = {
        savings: 'bg-gradient-savings',
        goals: 'bg-gradient-goals',
        dca: 'bg-gradient-dca',
        ai: 'bg-gradient-ai',
    }[accentColor];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'relative overflow-hidden rounded-xl p-6',
                gradientClass,
                className
            )}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
                    {subtitle && (
                        <p className="text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>
                {children}
            </div>
        </motion.div>
    );
}
