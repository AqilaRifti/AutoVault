'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useDCA, type DCAStrategy } from '@/hooks/use-dca';
import { useMNEE } from '@/hooks/use-mnee';
import { motion } from 'motion/react';
import { Plus, TrendingUp, Pause, X, Clock, Zap } from 'lucide-react';
import { useAccount } from 'wagmi';
import { getContractAddresses } from '@/lib/contracts/addresses';
import { parseEther, formatEther, type Address } from 'viem';

const SUPPORTED_TOKENS = [
    { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address, name: 'Wrapped Ether' },
    { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as Address, name: 'Wrapped Bitcoin' },
    { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' as Address, name: 'Chainlink' },
];

const INTERVALS = [
    { label: 'Daily', seconds: 86400 },
    { label: 'Weekly', seconds: 604800 },
    { label: 'Bi-weekly', seconds: 1209600 },
    { label: 'Monthly', seconds: 2592000 },
];

function formatTimeUntil(timestamp: number): string {
    const now = Math.floor(Date.now() / 1000);
    const diff = timestamp - now;
    if (diff <= 0) return 'Ready';
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    return `${hours}h ${minutes}m`;
}

function getIntervalLabel(seconds: number): string {
    const interval = INTERVALS.find(i => i.seconds === seconds);
    return interval?.label || `${seconds}s`;
}

export default function DCAPage() {
    const { chainId } = useAccount();
    const addresses = chainId ? getContractAddresses(chainId) : getContractAddresses(11155111);

    const { strategies, isLoading, createStrategy, pauseStrategy, cancelStrategy, isPending } = useDCA();
    const { formattedBalance: walletBalance, approve, isApproving } = useMNEE(addresses.dcaExecutor);

    const [createOpen, setCreateOpen] = useState(false);
    const [selectedToken, setSelectedToken] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [interval, setInterval] = useState<string>('');

    const activeStrategies = strategies.filter(s => s.isActive);

    const handleCreateStrategy = async () => {
        if (!selectedToken || !amount || !interval) return;
        const token = SUPPORTED_TOKENS.find(t => t.symbol === selectedToken);
        if (!token) return;

        const amountWei = parseEther(amount);
        const intervalSeconds = parseInt(interval);

        await approve(addresses.dcaExecutor, amountWei * 100n); // Approve for ~100 executions
        await createStrategy(token.address, amountWei, intervalSeconds);
        setCreateOpen(false);
        setSelectedToken('');
        setAmount('');
        setInterval('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">DCA Strategies</h1>
                    <p className="text-muted-foreground">Automate your dollar-cost averaging investments</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Create Strategy</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create DCA Strategy</DialogTitle>
                            <DialogDescription>Set up automatic recurring purchases</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Token to Buy</Label>
                                <Select value={selectedToken} onValueChange={setSelectedToken}>
                                    <SelectTrigger><SelectValue placeholder="Select token" /></SelectTrigger>
                                    <SelectContent>
                                        {SUPPORTED_TOKENS.map((token) => (
                                            <SelectItem key={token.symbol} value={token.symbol}>
                                                {token.symbol} - {token.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Amount per Purchase (MNEE)</Label>
                                <Input type="number" placeholder="100" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Wallet balance: ${walletBalance}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Frequency</Label>
                                <Select value={interval} onValueChange={setInterval}>
                                    <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                                    <SelectContent>
                                        {INTERVALS.map((int) => (
                                            <SelectItem key={int.seconds} value={int.seconds.toString()}>
                                                {int.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateStrategy} disabled={isPending || isApproving || !selectedToken || !amount || !interval}>
                                {isPending || isApproving ? 'Processing...' : 'Create Strategy'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-16" /> : (
                                <div className="text-2xl font-bold text-green-500">{activeStrategies.length}</div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-16" /> : (
                                <div className="text-2xl font-bold">${parseFloat(formatEther(strategies.reduce((sum, s) => sum + s.totalInvested, 0n))).toFixed(2)}</div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-16" /> : (
                                <div className="text-2xl font-bold">${parseFloat(formatEther(strategies.reduce((sum, s) => sum + s.totalReceived, 0n))).toFixed(2)}</div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2].map((i) => (<Skeleton key={i} className="h-48" />))}
                </div>
            ) : strategies.filter(s => s.isActive).length === 0 ? (
                <Card className="py-12">
                    <CardContent className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No DCA strategies yet</p>
                        <Button onClick={() => setCreateOpen(true)}>Create Your First Strategy</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {strategies.filter(s => s.isActive).map((strategy, index) => {
                        const token = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === strategy.tokenOut.toLowerCase());
                        return (
                            <motion.div key={strategy.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                {token?.symbol || 'Unknown'} DCA
                                                <Badge variant="default">Active</Badge>
                                            </CardTitle>
                                        </div>
                                        <CardDescription>{token?.name || strategy.tokenOut}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Amount</p>
                                                <p className="font-medium">${parseFloat(formatEther(strategy.amountPerInterval)).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Frequency</p>
                                                <p className="font-medium">{getIntervalLabel(strategy.intervalSeconds)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Total Invested</p>
                                                <p className="font-medium">${parseFloat(formatEther(strategy.totalInvested)).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Next Run</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTimeUntil(strategy.nextExecution)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => pauseStrategy(strategy.id)} disabled={isPending}>
                                                <Pause className="h-4 w-4 mr-1" />Pause
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => cancelStrategy(strategy.id)} disabled={isPending}>
                                                <X className="h-4 w-4 mr-1" />Cancel
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
