'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyStateWidget } from '@/components/autovault/dashboard-widgets';
import { useTransactions, type Transaction } from '@/hooks/use-transactions';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, ArrowDownToLine, ArrowUpFromLine, RefreshCw, Target, TrendingUp, Wallet, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeConfig: Record<Transaction['type'], { icon: React.ReactNode; color: string; bgColor: string }> = {
    deposit: {
        icon: <ArrowDownToLine className="h-4 w-4" />,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    withdraw: {
        icon: <ArrowUpFromLine className="h-4 w-4" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
    create_bucket: {
        icon: <Wallet className="h-4 w-4" />,
        color: 'text-primary',
        bgColor: 'bg-primary/10'
    },
    create_goal: {
        icon: <Target className="h-4 w-4" />,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    goal_deposit: {
        icon: <ArrowDownToLine className="h-4 w-4" />,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    goal_withdraw: {
        icon: <ArrowUpFromLine className="h-4 w-4" />,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    dca_create: {
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30'
    },
    dca_execute: {
        icon: <RefreshCw className="h-4 w-4" />,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30'
    },
    rebalance: {
        icon: <RefreshCw className="h-4 w-4" />,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
};

const statusConfig: Record<Transaction['status'], { label: string; className: string }> = {
    pending: {
        label: 'Pending',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    },
    confirmed: {
        label: 'Confirmed',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
    },
    failed: {
        label: 'Failed',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
    },
};

export function TransactionHistory() {
    const { chainId } = useAccount();
    const { transactions, getEtherscanLink } = useTransactions();

    if (transactions.length === 0) {
        return (
            <EmptyStateWidget
                icon={<History className="h-12 w-12" />}
                title="No transactions yet"
                description="Your transaction history will appear here once you start using AutoVault"
                accentColor="teal"
            />
        );
    }

    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary to-emerald-400" />
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Recent Transactions
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                    <div className="p-4 space-y-2">
                        <AnimatePresence>
                            {transactions.map((tx, index) => (
                                <TransactionRow
                                    key={tx.id}
                                    tx={tx}
                                    index={index}
                                    chainId={chainId}
                                    getEtherscanLink={getEtherscanLink}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function TransactionRow({ tx, index, chainId, getEtherscanLink }: {
    tx: Transaction;
    index: number;
    chainId: number | undefined;
    getEtherscanLink: (hash: string, chainId?: number) => string;
}) {
    const config = typeConfig[tx.type];
    const status = statusConfig[tx.status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
        >
            <div className="flex items-center gap-4">
                <div className={`h-11 w-11 rounded-xl ${config.bgColor} flex items-center justify-center ${config.color}`}>
                    {config.icon}
                </div>
                <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {tx.amount && (
                    <span className={`font-semibold ${tx.type.includes('withdraw') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {tx.type.includes('withdraw') ? '-' : '+'}${tx.amount}
                    </span>
                )}
                <Badge variant="outline" className={status.className}>
                    {status.label}
                </Badge>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => window.open(getEtherscanLink(tx.hash, chainId), '_blank')}
                >
                    <ExternalLink className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}

export function TransactionHistoryCompact() {
    const { chainId } = useAccount();
    const { transactions, getEtherscanLink } = useTransactions();
    const recentTxs = transactions.slice(0, 5);

    if (recentTxs.length === 0) return null;

    return (
        <div className="space-y-2">
            {recentTxs.map((tx) => {
                const config = typeConfig[tx.type];
                const status = statusConfig[tx.status];
                return (
                    <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg ${config.bgColor} flex items-center justify-center ${config.color}`}>
                                {config.icon}
                            </div>
                            <span className="text-sm truncate max-w-[150px]">{tx.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${status.className} text-xs px-2 py-0.5`}>
                                {status.label}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => window.open(getEtherscanLink(tx.hash, chainId), '_blank')}
                            >
                                <ExternalLink className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
