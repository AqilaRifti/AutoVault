'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, type Address } from 'viem';
import { getContractAddresses } from '@/lib/contracts/addresses';
import { SMART_VAULT_ABI } from '@/lib/contracts/abis';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

export interface Bucket {
    id: number;
    name: string;
    targetPercentage: number;
    balance: bigint;
    color: string;
    isActive: boolean;
}

export interface UseSmartVaultReturn {
    buckets: Bucket[];
    totalBalance: bigint;
    formattedTotalBalance: string;
    isLoading: boolean;
    deposit: (amount: bigint) => Promise<void>;
    withdraw: (bucketId: number, amount: bigint) => Promise<void>;
    rebalance: () => Promise<void>;
    transfer: (from: number, to: number, amount: bigint) => Promise<void>;
    createBucket: (name: string, percentage: number, color: string) => Promise<void>;
    isPending: boolean;
    txHash: `0x${string}` | undefined;
}

export function useSmartVault(): UseSmartVaultReturn {
    const { address, chainId } = useAccount();

    const addresses = useMemo(() => {
        return chainId ? getContractAddresses(chainId) : getContractAddresses(11155111);
    }, [chainId]);

    // Read all buckets
    const { data: bucketsData, isLoading: isBucketsLoading, refetch: refetchBuckets } = useReadContract({
        address: addresses.smartVault,
        abi: SMART_VAULT_ABI,
        functionName: 'getAllBuckets',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && addresses.smartVault !== '0x0000000000000000000000000000000000000000',
            refetchInterval: 15000,
        },
    });

    // Read total balance
    const { data: totalBalance, isLoading: isBalanceLoading, refetch: refetchBalance } = useReadContract({
        address: addresses.smartVault,
        abi: SMART_VAULT_ABI,
        functionName: 'getTotalBalance',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && addresses.smartVault !== '0x0000000000000000000000000000000000000000',
            refetchInterval: 15000,
        },
    });

    // Write contract
    const { writeContract, data: txHash, isPending } = useWriteContract();

    // Wait for transaction
    const { isLoading: isWaiting } = useWaitForTransactionReceipt({
        hash: txHash,
        query: {
            enabled: !!txHash,
        },
    });

    // Transform buckets data
    const buckets: Bucket[] = useMemo(() => {
        if (!bucketsData) return [];
        return (bucketsData as any[]).map((bucket, index) => ({
            id: index,
            name: bucket.name,
            targetPercentage: Number(bucket.targetPercentage) / 100, // Convert from basis points
            balance: bucket.balance,
            color: bucket.color,
            isActive: bucket.isActive,
        }));
    }, [bucketsData]);

    // Format total balance
    const formattedTotalBalance = useMemo(() => {
        if (!totalBalance) return '0.00';
        return parseFloat(formatEther(totalBalance as bigint)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [totalBalance]);

    // Deposit function
    const deposit = useCallback(async (amount: bigint) => {
        try {
            writeContract({
                address: addresses.smartVault,
                abi: SMART_VAULT_ABI,
                functionName: 'deposit',
                args: [amount],
            });
            toast.success('Deposit transaction submitted');
        } catch (error) {
            toast.error('Failed to deposit');
            throw error;
        }
    }, [writeContract, addresses.smartVault]);

    // Withdraw function
    const withdraw = useCallback(async (bucketId: number, amount: bigint) => {
        try {
            writeContract({
                address: addresses.smartVault,
                abi: SMART_VAULT_ABI,
                functionName: 'withdrawFromBucket',
                args: [BigInt(bucketId), amount],
            });
            toast.success('Withdrawal transaction submitted');
        } catch (error) {
            toast.error('Failed to withdraw');
            throw error;
        }
    }, [writeContract, addresses.smartVault]);

    // Rebalance function
    const rebalance = useCallback(async () => {
        try {
            writeContract({
                address: addresses.smartVault,
                abi: SMART_VAULT_ABI,
                functionName: 'rebalanceBuckets',
                args: [],
            });
            toast.success('Rebalance transaction submitted');
        } catch (error) {
            toast.error('Failed to rebalance');
            throw error;
        }
    }, [writeContract, addresses.smartVault]);

    // Transfer function
    const transfer = useCallback(async (from: number, to: number, amount: bigint) => {
        try {
            writeContract({
                address: addresses.smartVault,
                abi: SMART_VAULT_ABI,
                functionName: 'transferBetweenBuckets',
                args: [BigInt(from), BigInt(to), amount],
            });
            toast.success('Transfer transaction submitted');
        } catch (error) {
            toast.error('Failed to transfer');
            throw error;
        }
    }, [writeContract, addresses.smartVault]);

    // Create bucket function
    const createBucket = useCallback(async (name: string, percentage: number, color: string) => {
        try {
            writeContract({
                address: addresses.smartVault,
                abi: SMART_VAULT_ABI,
                functionName: 'createBucket',
                args: [name, BigInt(percentage * 100), color], // Convert to basis points
            });
            toast.success('Create bucket transaction submitted');
        } catch (error) {
            toast.error('Failed to create bucket');
            throw error;
        }
    }, [writeContract, addresses.smartVault]);

    return {
        buckets,
        totalBalance: (totalBalance as bigint) || 0n,
        formattedTotalBalance,
        isLoading: isBucketsLoading || isBalanceLoading,
        deposit,
        withdraw,
        rebalance,
        transfer,
        createBucket,
        isPending: isPending || isWaiting,
        txHash,
    };
}
