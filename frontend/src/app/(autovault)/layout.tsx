'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { WalletButton } from '@/components/autovault/wallet-button';
import {
    LayoutDashboard,
    Wallet,
    Target,
    TrendingUp,
    Bot,
    Menu,
    X,
    History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/buckets', label: 'Buckets', icon: Wallet },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/dca', label: 'DCA', icon: TrendingUp },
    { href: '/advisor', label: 'AI Advisor', icon: Bot },
    { href: '/history', label: 'History', icon: History },
];

export default function AutoVaultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isConnected, isConnecting } = useAccount();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Redirect to landing if not connected
    useEffect(() => {
        if (!isConnecting && !isConnected) {
            // For demo purposes, we'll show a connect prompt instead of redirecting
        }
    }, [isConnected, isConnecting, router]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl hidden sm:inline">AutoVault</span>
                        </Link>
                    </div>
                    <WalletButton />
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={cn(
                        'fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0 pt-16 md:pt-0',
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                >
                    <nav className="flex flex-col gap-1 p-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/50 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {!isConnected && !isConnecting ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6">
                                <Wallet className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Welcome to AutoVault</h1>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                Connect your wallet to start managing your programmable savings with smart buckets, DCA strategies, and AI-powered advice.
                            </p>
                            <WalletButton />
                        </div>
                    ) : (
                        children
                    )}
                </main>
            </div>
        </div>
    );
}
