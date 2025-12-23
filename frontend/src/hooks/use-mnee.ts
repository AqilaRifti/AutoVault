'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, type Address } from 'viem';
import { MNEE_ABI, getContractAddresses } from '@/lib/contracts/addresses';
import { useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export interface UseMNEEReturn {
    balance: bigint | undefined;
    formattedBalance: string;
    allowance: bigint | undefined;
    isLoading: boolean;
    approve: (spender: Address, amount: bigint) => Promise<void>;
    isApproving: boolean;
    approvalTxHash: `0x${string}` | undefined;
    mint: (amount?: bigint) => void;
    isMinting: boolean;
    refetch: () => void;
}

export function useMNEE(spenderAddress?: Address): UseMNEEReturn {
    const { address, chainId } = useAccount();
    const queryClient = useQueryClient();

    const addresses = useMemo(() => {
        return chainId ? getContractAddresses(chainId) : getContractAddresses(11155111);
    }, [chainId]);

    // Read MNEE balance
    const { data: balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useReadContract({
        address: addresses.mnee,
        abi: MNEE_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 5000,
        },
    });

    // Read allowance for spender
    const { data: allowance, isLoading: isAllowanceLoading, refetch: refetchAllowance } = useReadContract({
        address: addresses.mnee,
        abi: MNEE_ABI,
        functionName: 'allowance',
        args: address && spenderAddress ? [address, spenderAddress] : undefined,
        query: {
            enabled: !!address && !!spenderAddress,
            refetchInterval: 5000,
        },
    });

    // Write contract for approval
    const {
        writeContract,
        data: approvalTxHash,
        isPending: isApproving
    } = useWriteContract();

    // Separate write contract for minting
    const {
        writeContract: writeMint,
        data: mintTxHash,
        isPending: isMintPending
    } = useWriteContract();

    // Wait for approval transaction
    const { isLoading: isWaitingForApproval } = useWaitForTransactionReceipt({
        hash: approvalTxHash,
    });

    // Wait for mint transaction
    const { isLoading: isWaitingForMint, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
        hash: mintTxHash,
    });

    // Refetch balance after successful mint
    useEffect(() => {
        if (isMintSuccess && mintTxHash) {
            toast.success('Test MNEE minted successfully!');
            // Refetch balance after a short delay
            setTimeout(() => {
                refetchBalance();
                queryClient.invalidateQueries();
            }, 2000);
        }
    }, [isMintSuccess, mintTxHash, refetchBalance, queryClient]);

    // Approve function
    const approve = useCallback(async (spender: Address, amount: bigint) => {
        writeContract({
            address: addresses.mnee,
            abi: MNEE_ABI,
            functionName: 'approve',
            args: [spender, amount],
        });
    }, [writeContract, addresses.mnee]);

    // Mint function (faucet for testing)
    const mint = useCallback((amount: bigint = parseEther('1000')) => {
        if (!address) {
            toast.error('Please connect your wallet first');
            return;
        }
        writeMint({
            address: addresses.mnee,
            abi: [...MNEE_ABI, {
                inputs: [
                    { name: 'to', type: 'address' },
                    { name: 'amount', type: 'uint256' }
                ],
                name: 'mint',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            }],
            functionName: 'mint',
            args: [address, amount],
        });
        toast.info('Minting test MNEE...');
    }, [writeMint, addresses.mnee, address]);

    // Format balance for display
    const formattedBalance = useMemo(() => {
        if (!balance) return '0.00';
        return parseFloat(formatEther(balance)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [balance]);

    const refetch = useCallback(() => {
        refetchBalance();
        refetchAllowance();
    }, [refetchBalance, refetchAllowance]);

    return {
        balance,
        formattedBalance,
        allowance,
        isLoading: isBalanceLoading || isAllowanceLoading,
        approve,
        isApproving: isApproving || isWaitingForApproval,
        approvalTxHash,
        mint,
        isMinting: isMintPending || isWaitingForMint,
        refetch,
    };
}

// Helper hook to check if approval is needed
export function useNeedsApproval(
    spenderAddress: Address | undefined,
    amount: bigint
): boolean {
    const { allowance } = useMNEE(spenderAddress);

    if (!allowance || !spenderAddress) return true;
    return allowance < amount;
}
