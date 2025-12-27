'use client';

import { HeroSectionCompact } from '@/components/autovault/hero-section';
import { TransactionHistory } from '@/components/autovault/transaction-history';
import { motion } from 'motion/react';

export default function HistoryPage() {
    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <HeroSectionCompact
                title="Transaction History"
                subtitle="View all your AutoVault transactions"
                accentColor="savings"
            />

            {/* Transaction List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <TransactionHistory />
            </motion.div>
        </div>
    );
}
