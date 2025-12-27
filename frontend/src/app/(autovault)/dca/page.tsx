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
import { HeroSectionCompact } from '@/components/autovault/hero-section';
import { StatCardCompact } from '@/components/autovault/stat-card';
import { EmptyStateWidget } from '@/components/autovault/dashboard-widgets';
import { useDCA, type DCAStrategy } from '@/hooks/use-dca';
import { useMNEE } from '@/hooks/use-mnee';
import { motion } from 'motion/react';
import { Plus, TrendingUp, Pause, Play, X, Clock, Zap, ArrowRight, Calendar, DollarSign } from 'lucide-react';
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

    const { strategies, isLoading, createStrategy, pauseStrategy, resumeStrategy, cancelStrategy, isPending } = useDCA();
    const { formattedBalance: walletBalance, approve, isApproving } = useMNEE(addresses.dcaExecutor);

    const [createOpen, setCreateOpen] = useState(false);
    const [selectedToken, setSelectedToken] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [interval, setInterval] = useState<string>('');

    const activeStrategies = strategies.filter(s => s.isActive);
    const totalInvested = strategies.reduce((sum, s) => sum + s.totalInvested, 0n);
    const totalReceived = strategies.reduce((sum, s) => sum + s.totalReceived, 0n);

    const handleCreateStrategy = async () => {
        if (!selectedToken || !amount || !interval) return;
        const token = SUPPORTED_TOKENS.find(t => t.symbol === selectedToken);
        if (!token) return;

        const amountWei = parseEther(amount);
        const intervalSeconds = parseInt(interval);

        await approve(addresses.dcaExecutor, amountWei * 100n);
        await createStrategy(token.address, amountWei, intervalSeconds);
        setCreateOpen(false);
        setSelectedToken('');
        setAmount('');
        setInterval('');
    };

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <HeroSectionCompact
                title="DCA Strategies"
                subtitle="Automate your dollar-cost averaging investments"
                accentColor="dca"
            >
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Strategy
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 text-amber-600" />
                                </div>
                                Create DCA Strategy
                            </DialogTitle>
                            <DialogDescription>Set up automatic recurring purchases</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Token to Buy</Label>
                                <Select value={selectedToken} onValueChange={setSelectedToken}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select token" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SUPPORTED_TOKENS.map((token) => (
                                            <SelectItem key={token.symbol} value={token.symbol}>
                                                <span className="font-medium">{token.symbol}</span>
                                                <span className="text-muted-foreground ml-2">- {token.name}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Amount per Purchase (MNEE)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-9 h-11"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Wallet balance: ${walletBalance}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Frequency</Label>
                                <Select value={interval} onValueChange={setInterval}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INTERVALS.map((int) => (
                                            <SelectItem key={int.seconds} value={int.seconds.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {int.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleCreateStrategy}
                                disabled={isPending || isApproving || !selectedToken || !amount || !interval}
                                className="w-full bg-amber-600 hover:bg-amber-700"
                            >
                                {isPending || isApproving ? 'Processing...' : 'Create Strategy'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </HeroSectionCompact>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <StatCardCompact
                        title="Active Strategies"
                        value={isLoading ? '...' : activeStrategies.length.toString()}
                        icon={<Zap className="h-4 w-4" />}
                        accent="dca"
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <StatCardCompact
                        title="Total Invested"
                        value={isLoading ? '...' : `$${parseFloat(formatEther(totalInvested)).toFixed(2)}`}
                        icon={<TrendingUp className="h-4 w-4" />}
                        accent="dca"
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <StatCardCompact
                        title="Total Received"
                        value={isLoading ? '...' : `$${parseFloat(formatEther(totalReceived)).toFixed(2)}`}
                        icon={<ArrowRight className="h-4 w-4" />}
                        accent="dca"
                    />
                </motion.div>
            </div>

            {/* Strategies List */}
            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2].map((i) => (<Skeleton key={i} className="h-56 rounded-xl" />))}
                </div>
            ) : activeStrategies.length === 0 ? (
                <EmptyStateWidget
                    icon={<TrendingUp className="h-12 w-12" />}
                    title="No DCA strategies yet"
                    description="Set up automatic recurring purchases to dollar-cost average into your favorite tokens"
                    actionLabel="Create Your First Strategy"
                    onAction={() => setCreateOpen(true)}
                    accentColor="amber"
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {activeStrategies.map((strategy, index) => {
                        const token = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === strategy.tokenOut.toLowerCase());
                        return (
                            <motion.div
                                key={strategy.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="overflow-hidden card-hover-shadow transition-all duration-300 group">
                                    {/* Colored header bar */}
                                    <div className="h-1.5 bg-gradient-to-r from-amber-400 to-amber-600" />
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                    <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <span className="text-lg">{token?.symbol || 'Unknown'} DCA</span>
                                                    <p className="text-sm font-normal text-muted-foreground">{token?.name || strategy.tokenOut}</p>
                                                </div>
                                            </CardTitle>
                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                                                Active
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                                                <p className="font-semibold text-lg">${parseFloat(formatEther(strategy.amountPerInterval)).toFixed(2)}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                                                <p className="font-semibold text-lg">{getIntervalLabel(strategy.intervalSeconds)}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
                                                <p className="font-semibold">${parseFloat(formatEther(strategy.totalInvested)).toFixed(2)}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                                <p className="text-xs text-muted-foreground mb-1">Next Run</p>
                                                <p className="font-semibold flex items-center gap-1 text-amber-700 dark:text-amber-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatTimeUntil(strategy.nextExecution)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => pauseStrategy(strategy.id)}
                                                disabled={isPending}
                                                className="flex-1"
                                            >
                                                <Pause className="h-4 w-4 mr-1" />
                                                Pause
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => cancelStrategy(strategy.id)}
                                                disabled={isPending}
                                                className="flex-1"
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Cancel
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
