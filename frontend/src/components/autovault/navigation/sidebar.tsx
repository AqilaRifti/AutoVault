'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    LayoutDashboard,
    Wallet,
    Target,
    TrendingUp,
    Bot,
    History,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/buckets', label: 'Buckets', icon: Wallet },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/dca', label: 'DCA', icon: TrendingUp },
    { href: '/advisor', label: 'AI Advisor', icon: Bot },
    { href: '/history', label: 'History', icon: History },
];

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
    className?: string;
}

export function Sidebar({ isCollapsed = false, onToggle, className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'hidden md:flex flex-col border-r bg-sidebar transition-all duration-300 h-full overflow-hidden',
                    isCollapsed ? 'w-16' : 'w-64',
                    className
                )}
            >
                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        const linkContent = (
                            <Link
                                href={item.href}
                                className={cn(
                                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-sidebar-foreground/70',
                                    isCollapsed && 'justify-center px-2'
                                )}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <Icon className={cn(
                                    'h-5 w-5 shrink-0',
                                    isActive ? 'text-primary' : 'text-sidebar-foreground/70'
                                )} />

                                <AnimatePresence mode="wait">
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="truncate"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );

                        if (isCollapsed) {
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>
                                        {linkContent}
                                    </TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={10}>
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return <div key={item.href}>{linkContent}</div>;
                    })}
                </nav>

                {/* Collapse toggle */}
                {onToggle && (
                    <div className="p-3 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggle}
                            className={cn(
                                'w-full justify-center',
                                !isCollapsed && 'justify-start'
                            )}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <>
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    <span>Collapse</span>
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </aside>
        </TooltipProvider>
    );
}

// Mobile sidebar overlay
export function MobileSidebar({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const pathname = usePathname();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/50 md:hidden"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r md:hidden"
                    >
                        <div className="flex flex-col h-full pt-16">
                            <nav className="flex-1 p-4 space-y-1">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onClose}
                                            className={cn(
                                                'relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200',
                                                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                                'touch-target',
                                                isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-sidebar-foreground/70'
                                            )}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                                            )}
                                            <Icon className={cn(
                                                'h-5 w-5',
                                                isActive ? 'text-primary' : 'text-sidebar-foreground/70'
                                            )} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
