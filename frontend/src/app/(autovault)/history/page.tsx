'use client';

import { TransactionHistory } from '@/components/autovault/transaction-history';

export default function HistoryPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Transaction History</h1>
                <p className="text-muted-foreground">View all your AutoVault transactions</p>
            </div>
            <TransactionHistory />
        </div>
    );
}
