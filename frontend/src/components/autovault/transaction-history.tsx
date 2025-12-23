'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTransactions, type Transaction } from '@/hooks/use-transactions';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, ArrowDownToLine, ArrowUpFromLine, RefreshCw, Target, TrendingUp, Wallet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeIcons: Record<Transaction['type'], React.ReactNode> = {
    deposit: <ArrowDownToLine className="h-4 w-4 text-green-500" />,
    withdraw: <ArrowUpFromLine className="h-4 w-4 text-red-500" />,
    create_bucket: <Wallet className="h-4 w-4 text-blue-500" />,
    create_goal: <Target className="h-4 w-4 text-purple-500" />,
    goal_deposit: <ArrowDownToLine className="h-4 w-4 text-purple-500" />,
    goal_withdraw: <ArrowUpFromLine className="h-4 w-4 text-purple-500" />,
    dca_create: <TrendingUp className="h-4 w-4 text-orange-500" />,
    dca_execute: <RefreshCw className="h-4 w-4 text-orange-500" />,
    rebalance: <RefreshCw className="h-4 w-4 text-blue-500" />,
};

const statusColors: Record<Transaction['status'], string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export function TransactionHistory() {
    const { chainId } = useAccount();
    const { transactions, getEtherscanLink } = useTransactions();

    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No transactions yet</p>
                        <p className="text-sm">Your transaction history will appear here</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <AnimatePresence>
                        <div className="space-y-3">
                            {transactions.map((tx, index) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                                            {typeIcons[tx.type]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {tx.amount && (
                                            <span className="text-sm font-medium">
                                                {tx.type.includes('withdraw') ? '-' : '+'}${tx.amount}
                                            </span>
                                        )}
                                        <Badge variant="outline" className={statusColors[tx.status]}>
                                            {tx.status}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => window.open(getEtherscanLink(tx.hash, chainId), '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

export function TransactionHistoryCompact() {
    const { chainId } = useAccount();
    const { transactions, getEtherscanLink } = useTransactions();
    const recentTxs = transactions.slice(0, 5);

    if (recentTxs.length === 0) return null;

    return (
        <div className="space-y-2">
            {recentTxs.map((tx) => (
                <div
                    key={tx.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/30 text-sm"
                >
                    <div className="flex items-center gap-2">
                        {typeIcons[tx.type]}
                        <span className="truncate max-w-[150px]">{tx.description}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Badge variant="outline" className={`${statusColors[tx.status]} text-xs px-1.5 py-0`}>
                            {tx.status}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => window.open(getEtherscanLink(tx.hash, chainId), '_blank')}
                        >
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
