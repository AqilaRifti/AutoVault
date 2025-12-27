'use client';

import { motion } from 'motion/react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { type AccentColor } from '@/lib/design-tokens';

interface FeatureCardProps {
    title: string;
    description: string;
    metric: string;
    metricLabel: string;
    href: string;
    variant: AccentColor;
    icon: LucideIcon;
    className?: string;
}

const variantStyles: Record<AccentColor, {
    gradient: string;
    iconBg: string;
    iconText: string;
    metricText: string;
}> = {
    savings: {
        gradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30',
        iconBg: 'bg-emerald-500',
        iconText: 'text-white',
        metricText: 'text-emerald-600 dark:text-emerald-400',
    },
    goals: {
        gradient: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30',
        iconBg: 'bg-purple-500',
        iconText: 'text-white',
        metricText: 'text-purple-600 dark:text-purple-400',
    },
    dca: {
        gradient: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30',
        iconBg: 'bg-amber-500',
        iconText: 'text-white',
        metricText: 'text-amber-600 dark:text-amber-400',
    },
    ai: {
        gradient: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30',
        iconBg: 'bg-blue-500',
        iconText: 'text-white',
        metricText: 'text-blue-600 dark:text-blue-400',
    },
};

export function FeatureCard({
    title,
    description,
    metric,
    metricLabel,
    href,
    variant,
    icon: Icon,
    className,
}: FeatureCardProps) {
    const styles = variantStyles[variant];

    return (
        <Link href={href} className={cn('block group', className)}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    'relative overflow-hidden rounded-2xl p-6 h-full',
                    'transition-shadow duration-300 card-hover-shadow',
                    styles.gradient
                )}
            >
                {/* Icon */}
                <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl mb-4',
                    styles.iconBg
                )}>
                    <Icon className={cn('h-6 w-6', styles.iconText)} />
                </div>

                {/* Content */}
                <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                </div>

                {/* Metric */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{metricLabel}</p>
                        <p className={cn('text-2xl font-bold', styles.metricText)}>{metric}</p>
                    </div>

                    <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        'bg-foreground/5 group-hover:bg-foreground/10 transition-colors'
                    )}>
                        <ArrowRight className="h-5 w-5 text-foreground/60 group-hover:text-foreground transition-colors" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

// Grid container for feature cards
export function FeatureCardGrid({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn(
            'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
            className
        )}>
            {children}
        </div>
    );
}

// Compact feature card for smaller displays
export function FeatureCardCompact({
    title,
    metric,
    href,
    variant,
    icon: Icon,
    className,
}: Omit<FeatureCardProps, 'description' | 'metricLabel'>) {
    const styles = variantStyles[variant];

    return (
        <Link href={href} className={cn('block group', className)}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    'flex items-center gap-4 p-4 rounded-xl',
                    'transition-shadow duration-300 card-hover-shadow',
                    styles.gradient
                )}
            >
                <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg shrink-0',
                    styles.iconBg
                )}>
                    <Icon className={cn('h-5 w-5', styles.iconText)} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{title}</p>
                    <p className={cn('text-lg font-bold', styles.metricText)}>{metric}</p>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </motion.div>
        </Link>
    );
}
