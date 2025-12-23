'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';

export interface Transaction {
    id: string;
    type: 'deposit' | 'withdraw' | 'create_bucket' | 'create_goal' | 'goal_deposit' | 'goal_withdraw' | 'dca_create' | 'dca_execute' | 'rebalance';
    amount?: string;
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    description: string;
}

// In-memory store for demo (would use Supabase in production)
const transactionStore: Map<string, Transaction[]> = new Map();

export function useTransactions() {
    const { address } = useAccount();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load transactions for current address
    useEffect(() => {
        if (address) {
            const stored = transactionStore.get(address) || [];
            setTransactions(stored);
        }
    }, [address]);

    // Add a new transaction
    const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>) => {
        if (!address) return;

        const newTx: Transaction = {
            ...tx,
            id: `${tx.hash}-${Date.now()}`,
            timestamp: Date.now(),
        };

        const current = transactionStore.get(address) || [];
        const updated = [newTx, ...current].slice(0, 50); // Keep last 50
        transactionStore.set(address, updated);
        setTransactions(updated);

        return newTx;
    }, [address]);

    // Update transaction status
    const updateTransaction = useCallback((hash: string, status: Transaction['status']) => {
        if (!address) return;

        const current = transactionStore.get(address) || [];
        const updated = current.map(tx =>
            tx.hash === hash ? { ...tx, status } : tx
        );
        transactionStore.set(address, updated);
        setTransactions(updated);
    }, [address]);

    // Get Etherscan link
    const getEtherscanLink = useCallback((hash: string, chainId: number = 11155111) => {
        const baseUrl = chainId === 11155111
            ? 'https://sepolia.etherscan.io'
            : 'https://etherscan.io';
        return `${baseUrl}/tx/${hash}`;
    }, []);

    return {
        transactions,
        isLoading,
        addTransaction,
        updateTransaction,
        getEtherscanLink,
    };
}
