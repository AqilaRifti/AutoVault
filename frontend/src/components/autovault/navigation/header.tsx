'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Menu, X, Wallet, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/components/autovault/wallet-button';
import { cn } from '@/lib/utils';

interface HeaderProps {
    title?: string;
    showBackButton?: boolean;
    onMenuToggle?: () => void;
    isMenuOpen?: boolean;
    className?: string;
}

// Map paths to page titles
const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/buckets': 'Smart Buckets',
    '/goals': 'Savings Goals',
    '/dca': 'DCA Strategies',
    '/advisor': 'AI Advisor',
    '/history': 'Transaction History',
};

export function Header({
    title,
    showBackButton = false,
    onMenuToggle,
    isMenuOpen = false,
    className,
}: HeaderProps) {
    const pathname = usePathname();
    const pageTitle = title || pageTitles[pathname] || 'AutoVault';

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full px-5',
                'bg-background/80 backdrop-blur-lg',
                'border-b border-border/50',
                className
            )}
        >
            <div className="container flex h-16 items-center justify-between gap-4">
                {/* Left section */}
                <div className="flex items-center gap-3">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden touch-target"
                        onClick={onMenuToggle}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        <motion.div
                            animate={{ rotate: isMenuOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </motion.div>
                    </Button>

                    {/* Back button (optional) */}
                    {showBackButton && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex"
                            onClick={() => window.history.back()}
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20"
                        >
                            <Wallet className="h-5 w-5 text-white" />
                        </motion.div>
                        <div className="hidden sm:block">
                            <span className="font-bold text-lg tracking-tight">AutoVault</span>
                            <span className="hidden lg:inline text-xs text-muted-foreground ml-2">
                                Programmable Savings
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Center section - Page title (desktop only) */}
                <div className="hidden md:flex items-center justify-center flex-1">
                    <motion.h1
                        key={pageTitle}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-medium text-muted-foreground"
                    >
                        {pageTitle}
                    </motion.h1>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    <WalletButton />
                </div>
            </div>
        </header>
    );
}

// Simple header for auth/landing pages
export function SimpleHeader({ className }: { className?: string }) {
    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full',
                'bg-background/80 backdrop-blur-lg',
                'border-b border-border/50',
                className
            )}
        >
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                        <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">AutoVault</span>
                </Link>
                <WalletButton />
            </div>
        </header>
    );
}
