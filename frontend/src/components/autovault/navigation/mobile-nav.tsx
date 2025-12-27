'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
    LayoutDashboard,
    Wallet,
    Target,
    TrendingUp,
    Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Home', icon: LayoutDashboard },
    { href: '/buckets', label: 'Buckets', icon: Wallet },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/dca', label: 'DCA', icon: TrendingUp },
    { href: '/advisor', label: 'AI', icon: Bot },
];

interface MobileNavProps {
    className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
    const pathname = usePathname();

    return (
        <nav
            className={cn(
                'fixed bottom-0 left-0 right-0 z-50 md:hidden',
                'bg-background/95 backdrop-blur-lg border-t',
                'pb-[env(safe-area-inset-bottom)]',
                className
            )}
        >
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px]',
                                'transition-colors duration-200',
                                'touch-target',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="mobileActiveIndicator"
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}

                            <motion.div
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                <Icon className="h-5 w-5" />
                            </motion.div>

                            <span className={cn(
                                'text-[10px] font-medium',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

// Spacer component to prevent content from being hidden behind mobile nav
export function MobileNavSpacer() {
    return <div className="h-16 md:hidden" />;
}
