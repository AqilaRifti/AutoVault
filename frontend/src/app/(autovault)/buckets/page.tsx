'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useSmartVault, type Bucket } from '@/hooks/use-smart-vault';
import { useMNEE } from '@/hooks/use-mnee';
import { BucketCard } from '@/components/autovault/bucket-card';
import { BucketChart } from '@/components/autovault/bucket-chart';
import { HeroSectionCompact } from '@/components/autovault/hero-section';
import { EmptyStateWidget } from '@/components/autovault/dashboard-widgets';
import { motion } from 'motion/react';
import { Plus, RefreshCw, ArrowDownToLine, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { getContractAddresses } from '@/lib/contracts/addresses';
import { parseEther } from 'viem';
import { colors } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export default function BucketsPage() {
  const { chainId } = useAccount();
  const addresses = chainId ? getContractAddresses(chainId) : getContractAddresses(11155111);

  const { buckets, totalBalance, formattedTotalBalance, isLoading, deposit, withdraw, rebalance, createBucket, isPending } = useSmartVault();
  const { formattedBalance: walletBalance, approve, isApproving, isApproved } = useMNEE(addresses.smartVault);

  const [createOpen, setCreateOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);

  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketPercentage, setNewBucketPercentage] = useState('');
  const [newBucketColor, setNewBucketColor] = useState<string>(colors.bucketColors[0]);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const activeBuckets = buckets.filter(b => b.isActive);
  const totalPercentage = activeBuckets.reduce((sum, b) => sum + b.targetPercentage, 0);
  const remainingPercentage = 100 - totalPercentage;

  const handleCreateBucket = async () => {
    if (!newBucketName || !newBucketPercentage) return;
    const percentage = parseFloat(newBucketPercentage);
    if (percentage <= 0 || percentage > remainingPercentage) return;
    await createBucket(newBucketName, percentage, newBucketColor);
    setCreateOpen(false);
    setNewBucketName('');
    setNewBucketPercentage('');
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;
    const amount = parseEther(depositAmount);
    // ERC-1155 uses setApprovalForAll - approve once for all amounts
    if (!isApproved) {
      await approve(addresses.smartVault);
      return;
    }
    await deposit(amount);
    setDepositOpen(false);
    setDepositAmount('');
  };

  const needsApproval = !isApproved;

  const handleWithdraw = async () => {
    if (!withdrawAmount || !selectedBucket) return;
    const amount = parseEther(withdrawAmount);
    await withdraw(selectedBucket.id, amount);
    setWithdrawOpen(false);
    setWithdrawAmount('');
    setSelectedBucket(null);
  };

  return (
    <div className="space-y-6">
      <HeroSectionCompact title="Smart Buckets" subtitle="Auto-distribute deposits across your savings categories" accentColor="savings">
        <div className="flex gap-2">
          <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
            <DialogTrigger asChild>
              <Button className="touch-target"><ArrowDownToLine className="h-4 w-4 mr-2" />Deposit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deposit to Vault</DialogTitle>
                <DialogDescription>Funds will be auto-distributed to your buckets</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Amount (MNEE)</Label>
                  <Input type="number" placeholder="0.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="text-lg" />
                  <p className="text-xs text-muted-foreground">Wallet balance: ${walletBalance}</p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleDeposit} disabled={isPending || isApproving || !depositAmount}>
                  {isPending || isApproving ? 'Processing...' : needsApproval ? 'Approve MNEE' : 'Deposit'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => rebalance()} disabled={isPending || totalBalance === 0n} className="touch-target bg-background/60">
            <RefreshCw className={cn('h-4 w-4 mr-2', isPending && 'animate-spin')} />Rebalance
          </Button>
        </div>
      </HeroSectionCompact>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Total Vault Balance</CardTitle><CardDescription>Combined balance across all buckets</CardDescription></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-14 w-40" /> : <motion.div className="text-balance-lg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>${formattedTotalBalance}</motion.div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {isLoading ? <Skeleton className="h-32 w-32 rounded-full" /> : <BucketChart buckets={buckets} totalBalance={totalBalance} />}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Buckets</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={remainingPercentage <= 0} className="touch-target"><Plus className="h-4 w-4 mr-2" />Create Bucket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Bucket</DialogTitle><DialogDescription>Available allocation: {remainingPercentage}%</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Bucket Name</Label><Input placeholder="e.g., Emergency Fund" value={newBucketName} onChange={(e) => setNewBucketName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Target Percentage</Label><Input type="number" placeholder="25" max={remainingPercentage} value={newBucketPercentage} onChange={(e) => setNewBucketPercentage(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {colors.bucketColors.map((color) => (
                    <button key={color} type="button" className={cn('h-10 w-10 rounded-xl border-2 transition-all touch-target', newBucketColor === color ? 'border-foreground scale-110 shadow-lg' : 'border-transparent hover:scale-105')} style={{ backgroundColor: color }} onClick={() => setNewBucketColor(color)} />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleCreateBucket} disabled={isPending || !newBucketName || !newBucketPercentage}>{isPending ? 'Creating...' : 'Create Bucket'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}</div>
      ) : activeBuckets.length === 0 ? (
        <EmptyStateWidget icon={<Wallet className="h-12 w-12" />} title="No buckets created yet" description="Create your first bucket to start organizing your savings automatically" actionLabel="Create Your First Bucket" actionHref="#" variant="savings" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeBuckets.map((bucket, index) => (
            <motion.div key={bucket.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <BucketCard bucket={bucket} totalBalance={totalBalance} onDeposit={() => setDepositOpen(true)} onWithdraw={() => { setSelectedBucket(bucket); setWithdrawOpen(true); }} />
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Withdraw from {selectedBucket?.name}</DialogTitle><DialogDescription>Enter the amount you want to withdraw</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4"><div className="space-y-2"><Label>Amount (MNEE)</Label><Input type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="text-lg" /></div></div>
          <DialogFooter><Button onClick={handleWithdraw} disabled={isPending || !withdrawAmount}>{isPending ? 'Processing...' : 'Withdraw'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
