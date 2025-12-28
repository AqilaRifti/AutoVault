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
    isApproved: boolean | undefined;
    isLoading: boolean;
    approve: (operator: Address) => Promise<void>;
    isApproving: boolean;
    approvalTxHash: `0x${string}` | undefined;
    mint: (amount?: bigint) => void;
    isMinting: boolean;
    refetch: () => void;
    tokenId: bigint;
}

export function useMNEE(operatorAddress?: Address): UseMNEEReturn {
    const { address, chainId } = useAccount();
    const queryClient = useQueryClient();

    const addresses = useMemo(() => {
        return chainId ? getContractAddresses(chainId) : getContractAddresses(11155111);
    }, [chainId]);

    const tokenId = addresses.mneeTokenId;

    // Read MNEE balance (ERC-1155 requires tokenId)
    const { data: balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useReadContract({
        address: addresses.mnee,
        abi: MNEE_ABI,
        functionName: 'balanceOf',
        args: address ? [address, tokenId] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 5000,
        },
    });

    // Read approval status for operator (ERC-1155 uses isApprovedForAll)
    const { data: isApproved, isLoading: isApprovalLoading, refetch: refetchApproval } = useReadContract({
        address: addresses.mnee,
        abi: MNEE_ABI,
        functionName: 'isApprovedForAll',
        args: address && operatorAddress ? [address, operatorAddress] : undefined,
        query: {
            enabled: !!address && !!operatorAddress,
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
    const { isLoading: isWaitingForApproval, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
        hash: approvalTxHash,
    });

    // Wait for mint transaction
    const { isLoading: isWaitingForMint, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
        hash: mintTxHash,
    });

    // Refetch approval after successful approval tx
    useEffect(() => {
        if (isApprovalSuccess && approvalTxHash) {
            toast.success('MNEE approved successfully!');
            setTimeout(() => {
                refetchApproval();
                queryClient.invalidateQueries();
            }, 2000);
        }
    }, [isApprovalSuccess, approvalTxHash, refetchApproval, queryClient]);

    // Refetch balance after successful mint
    useEffect(() => {
        if (isMintSuccess && mintTxHash) {
            toast.success('Test MNEE minted successfully!');
            setTimeout(() => {
                refetchBalance();
                queryClient.invalidateQueries();
            }, 2000);
        }
    }, [isMintSuccess, mintTxHash, refetchBalance, queryClient]);

    // Approve function (ERC-1155 uses setApprovalForAll)
    const approve = useCallback(async (operator: Address) => {
        writeContract({
            address: addresses.mnee,
            abi: MNEE_ABI,
            functionName: 'setApprovalForAll',
            args: [operator, true],
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
            abi: MNEE_ABI,
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
        refetchApproval();
    }, [refetchBalance, refetchApproval]);

    return {
        balance,
        formattedBalance,
        isApproved,
        isLoading: isBalanceLoading || isApprovalLoading,
        approve,
        isApproving: isApproving || isWaitingForApproval,
        approvalTxHash,
        mint,
        isMinting: isMintPending || isWaitingForMint,
        refetch,
        tokenId,
    };
}

// Helper hook to check if approval is needed (ERC-1155 version)
export function useNeedsApproval(
    operatorAddress: Address | undefined,
    _amount: bigint // amount not needed for ERC-1155, but kept for API compatibility
): boolean {
    const { isApproved } = useMNEE(operatorAddress);

    if (isApproved === undefined || !operatorAddress) return true;
    return !isApproved;
}
