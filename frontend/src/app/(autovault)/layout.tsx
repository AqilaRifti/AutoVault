'use client';

import { useAccount } from 'wagmi';
import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Sidebar, MobileSidebar } from '@/components/autovault/navigation/sidebar';
import { MobileNav, MobileNavSpacer } from '@/components/autovault/navigation/mobile-nav';
import { Header } from '@/components/autovault/navigation/header';
import { WalletButton } from '@/components/autovault/wallet-button';
import { cn } from '@/lib/utils';

export default function AutoVaultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isConnected, isConnecting } = useAccount();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <Header
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                isMenuOpen={sidebarOpen}
            />

            {/* Mobile sidebar overlay */}
            <MobileSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex flex-1 min-h-0">
                {/* Desktop sidebar */}
                <Sidebar
                    isCollapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main content - scrollable area */}
                <main className={cn(
                    'flex-1 overflow-y-auto',
                    'p-4 md:p-6 lg:p-8',
                    'pb-20 md:pb-8' // Extra padding for mobile nav
                )}>
                    {!isConnected && !isConnecting ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl" />
                                <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                                    <Wallet className="h-10 w-10 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Welcome to AutoVault</h1>
                            <p className="text-muted-foreground mb-8 max-w-md text-lg">
                                Connect your wallet to start managing your programmable savings with smart buckets, DCA strategies, and AI-powered advice.
                            </p>
                            <WalletButton />
                        </div>
                    ) : (
                        children
                    )}
                </main>
            </div>

            {/* Mobile bottom navigation */}
            <MobileNav />
        </div>
    );
}
