'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, type Address } from 'viem';
import { getContractAddresses } from '@/lib/contracts/addresses';
import { GOAL_LOCKER_ABI } from '@/lib/contracts/abis';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

export interface Goal {
    id: number;
    name: string;
    targetAmount: bigint;
    currentAmount: bigint;
    deadline: number;
    lastMilestone: number;
    isCompleted: boolean;
    isWithdrawn: boolean;
    progressPercent: number;
    isUnlocked: boolean;
}

export interface UseGoalsReturn {
    goals: Goal[];
    isLoading: boolean;
    createGoal: (name: string, targetAmount: bigint, deadline: number) => Promise<void>;
    depositToGoal: (goalId: number, amount: bigint) => Promise<void>;
    withdrawGoal: (goalId: number) => Promise<void>;
    isPending: boolean;
    txHash: `0x${string}` | undefined;
}

export function useGoals(): UseGoalsReturn {
    const { address, chainId } = useAccount();

    const addresses = useMemo(() => {
        return chainId ? getContractAddresses(chainId) : getContractAddresses(11155111);
    }, [chainId]);

    // Read all goals
    const { data: goalsData, isLoading, refetch } = useReadContract({
        address: addresses.goalLocker,
        abi: GOAL_LOCKER_ABI,
        functionName: 'getAllGoals',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && addresses.goalLocker !== '0x0000000000000000000000000000000000000000',
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

    // Transform goals data
    const goals: Goal[] = useMemo(() => {
        if (!goalsData) return [];
        const now = Math.floor(Date.now() / 1000);

        return (goalsData as any[]).map((goal, index) => {
            const targetAmount = goal.targetAmount as bigint;
            const currentAmount = goal.currentAmount as bigint;
            const deadline = Number(goal.deadline);

            const progressPercent = targetAmount > 0n
                ? Number((currentAmount * 100n) / targetAmount)
                : 0;

            const targetReached = currentAmount >= targetAmount;
            const deadlinePassed = deadline > 0 && now >= deadline;
            const isUnlocked = targetReached || deadlinePassed;

            return {
                id: index,
                name: goal.name,
                targetAmount,
                currentAmount,
                deadline,
                lastMilestone: Number(goal.lastMilestone),
                isCompleted: goal.isCompleted,
                isWithdrawn: goal.isWithdrawn,
                progressPercent: Math.min(progressPercent, 100),
                isUnlocked,
            };
        });
    }, [goalsData]);

    // Create goal function
    const createGoal = useCallback(async (name: string, targetAmount: bigint, deadline: number) => {
        try {
            writeContract({
                address: addresses.goalLocker,
                abi: GOAL_LOCKER_ABI,
                functionName: 'createGoal',
                args: [name, targetAmount, BigInt(deadline)],
            });
            toast.success('Goal creation submitted');
        } catch (error) {
            toast.error('Failed to create goal');
            throw error;
        }
    }, [writeContract, addresses.goalLocker]);

    // Deposit to goal function
    const depositToGoal = useCallback(async (goalId: number, amount: bigint) => {
        try {
            writeContract({
                address: addresses.goalLocker,
                abi: GOAL_LOCKER_ABI,
                functionName: 'depositToGoal',
                args: [BigInt(goalId), amount],
            });
            toast.success('Deposit to goal submitted');
        } catch (error) {
            toast.error('Failed to deposit to goal');
            throw error;
        }
    }, [writeContract, addresses.goalLocker]);

    // Withdraw goal function
    const withdrawGoal = useCallback(async (goalId: number) => {
        try {
            writeContract({
                address: addresses.goalLocker,
                abi: GOAL_LOCKER_ABI,
                functionName: 'withdrawGoal',
                args: [BigInt(goalId)],
            });
            toast.success('Goal withdrawal submitted');
        } catch (error) {
            toast.error('Failed to withdraw goal');
            throw error;
        }
    }, [writeContract, addresses.goalLocker]);

    return {
        goals,
        isLoading,
        createGoal,
        depositToGoal,
        withdrawGoal,
        isPending: isPending || isWaiting,
        txHash,
    };
}
