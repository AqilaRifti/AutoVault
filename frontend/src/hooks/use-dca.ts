'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, type Address } from 'viem';
import { getContractAddresses } from '@/lib/contracts/addresses';
import { DCA_EXECUTOR_ABI } from '@/lib/contracts/abis';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

export interface DCAStrategy {
    id: number;
    tokenOut: Address;
    amountPerInterval: bigint;
    intervalSeconds: number;
    lastExecution: number;
    totalInvested: bigint;
    totalReceived: bigint;
    slippageTolerance: number;
    isActive: boolean;
    nextExecution: number;
}

export interface UseDCAReturn {
    strategies: DCAStrategy[];
    isLoading: boolean;
    createStrategy: (tokenOut: Address, amountPerInterval: bigint, intervalSeconds: number) => Promise<void>;
    pauseStrategy: (strategyId: number) => Promise<void>;
    resumeStrategy: (strategyId: number) => Promise<void>;
    cancelStrategy: (strategyId: number) => Promise<void>;
    isPending: boolean;
    txHash: `0x${string}` | undefined;
}

export function useDCA(): UseDCAReturn {
    const { address, chainId } = useAccount();

    const addresses = useMemo(() => {
        return chainId ? getContractAddresses(chainId) : getContractAddresses(11155111);
    }, [chainId]);

    // Read all strategies
    const { data: strategiesData, isLoading, refetch } = useReadContract({
        address: addresses.dcaExecutor,
        abi: DCA_EXECUTOR_ABI,
        functionName: 'getAllStrategies',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && addresses.dcaExecutor !== '0x0000000000000000000000000000000000000000',
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

    // Transform strategies data
    const strategies: DCAStrategy[] = useMemo(() => {
        if (!strategiesData) return [];

        return (strategiesData as any[]).map((strategy, index) => {
            const lastExecution = Number(strategy.lastExecution);
            const intervalSeconds = Number(strategy.intervalSeconds);
            const nextExecution = lastExecution + intervalSeconds;

            return {
                id: index,
                tokenOut: strategy.tokenOut,
                amountPerInterval: strategy.amountPerInterval,
                intervalSeconds,
                lastExecution,
                totalInvested: strategy.totalInvested,
                totalReceived: strategy.totalReceived,
                slippageTolerance: Number(strategy.slippageTolerance),
                isActive: strategy.isActive,
                nextExecution,
            };
        });
    }, [strategiesData]);

    // Create strategy function
    const createStrategy = useCallback(async (tokenOut: Address, amountPerInterval: bigint, intervalSeconds: number) => {
        try {
            writeContract({
                address: addresses.dcaExecutor,
                abi: DCA_EXECUTOR_ABI,
                functionName: 'createDCAStrategy',
                args: [tokenOut, amountPerInterval, BigInt(intervalSeconds), 300], // 3% slippage tolerance (300 basis points)
            });
            toast.success('DCA strategy creation submitted');
        } catch (error) {
            toast.error('Failed to create DCA strategy');
            throw error;
        }
    }, [writeContract, addresses.dcaExecutor]);

    // Pause strategy function
    const pauseStrategy = useCallback(async (strategyId: number) => {
        try {
            writeContract({
                address: addresses.dcaExecutor,
                abi: DCA_EXECUTOR_ABI,
                functionName: 'pauseStrategy',
                args: [BigInt(strategyId)],
            });
            toast.success('Strategy pause submitted');
        } catch (error) {
            toast.error('Failed to pause strategy');
            throw error;
        }
    }, [writeContract, addresses.dcaExecutor]);

    // Resume strategy function
    const resumeStrategy = useCallback(async (strategyId: number) => {
        try {
            writeContract({
                address: addresses.dcaExecutor,
                abi: DCA_EXECUTOR_ABI,
                functionName: 'resumeStrategy',
                args: [BigInt(strategyId)],
            });
            toast.success('Strategy resume submitted');
        } catch (error) {
            toast.error('Failed to resume strategy');
            throw error;
        }
    }, [writeContract, addresses.dcaExecutor]);

    // Cancel strategy function
    const cancelStrategy = useCallback(async (strategyId: number) => {
        try {
            writeContract({
                address: addresses.dcaExecutor,
                abi: DCA_EXECUTOR_ABI,
                functionName: 'cancelStrategy',
                args: [BigInt(strategyId)],
            });
            toast.success('Strategy cancellation submitted');
        } catch (error) {
            toast.error('Failed to cancel strategy');
            throw error;
        }
    }, [writeContract, addresses.dcaExecutor]);

    return {
        strategies,
        isLoading,
        createStrategy,
        pauseStrategy,
        resumeStrategy,
        cancelStrategy,
        isPending: isPending || isWaiting,
        txHash,
    };
}
