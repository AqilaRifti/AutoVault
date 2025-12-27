/**
 * Design Tokens for AutoVault UI
 * 
 * These constants define the design system used throughout the application.
 * They complement the CSS custom properties defined in globals.css and theme.css.
 */

export const colors = {
    // Primary palette - Teal/Emerald
    primary: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
    },

    // Feature accent colors
    accent: {
        savings: '#10b981',    // Teal - buckets/savings
        goals: '#8b5cf6',      // Purple - goals
        dca: '#f59e0b',        // Amber - DCA
        ai: '#3b82f6',         // Blue - AI advisor
    },

    // Status colors
    status: {
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
        pending: '#3b82f6',
    },

    // Gradient definitions (CSS values)
    gradients: {
        hero: 'linear-gradient(135deg, #ecfdf5 0%, #fef3c7 50%, #fce7f3 100%)',
        heroDark: 'linear-gradient(135deg, #1a2e2a 0%, #2a2520 50%, #2a2028 100%)',
        card: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        cardDark: 'linear-gradient(180deg, #1e2a28 0%, #1a2420 100%)',
        savings: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        savingsDark: 'linear-gradient(135deg, #1a3a32 0%, #153028 100%)',
        goals: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
        goalsDark: 'linear-gradient(135deg, #2a2540 0%, #221e38 100%)',
        dca: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        dcaDark: 'linear-gradient(135deg, #3a3520 0%, #302a18 100%)',
        ai: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        aiDark: 'linear-gradient(135deg, #1e2a40 0%, #182238 100%)',
    },

    // Bucket default colors
    bucketColors: [
        '#10b981', // Emerald
        '#3b82f6', // Blue
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Purple
        '#ec4899', // Pink
        '#06b6d4', // Cyan
        '#84cc16', // Lime
    ],
} as const;

export const spacing = {
    // Base grid unit: 8px
    grid: 8,

    // Named spacing values
    xs: 4,    // 0.25rem
    sm: 8,    // 0.5rem
    md: 16,   // 1rem
    lg: 24,   // 1.5rem
    xl: 32,   // 2rem
    '2xl': 48, // 3rem
    '3xl': 64, // 4rem
} as const;

export const borderRadius = {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
} as const;

export const typography = {
    fontFamily: {
        sans: 'Inter, system-ui, -apple-system, sans-serif',
        mono: 'JetBrains Mono, Menlo, Monaco, monospace',
    },

    sizes: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '2rem',    // 32px
        '4xl': '2.5rem',  // 40px
        '5xl': '3rem',    // 48px
    },

    weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    lineHeights: {
        tight: 1.1,
        snug: 1.25,
        normal: 1.5,
        relaxed: 1.625,
    },
} as const;

export const animation = {
    // Stagger delay between items (in seconds)
    staggerDelay: 0.05,

    // Distance for fade-up animation (in pixels)
    fadeUpDistance: 20,

    // Spring configuration for framer-motion
    spring: {
        stiffness: 300,
        damping: 30,
    },

    // Duration for counting animation (in seconds)
    countDuration: 1,

    // Transition presets
    transitions: {
        fast: { duration: 0.15 },
        normal: { duration: 0.3 },
        slow: { duration: 0.5 },
        spring: { type: 'spring', stiffness: 300, damping: 30 },
    },
} as const;

export const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

export const shadows = {
    card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
    cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
    cardLg: '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
    elevated: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// Feature configuration
export const features = {
    savings: {
        name: 'Savings',
        color: colors.accent.savings,
        gradient: 'savings',
        icon: 'Wallet',
    },
    goals: {
        name: 'Goals',
        color: colors.accent.goals,
        gradient: 'goals',
        icon: 'Target',
    },
    dca: {
        name: 'DCA',
        color: colors.accent.dca,
        gradient: 'dca',
        icon: 'TrendingUp',
    },
    ai: {
        name: 'AI Advisor',
        color: colors.accent.ai,
        gradient: 'ai',
        icon: 'Sparkles',
    },
} as const;

// Milestone thresholds for goals
export const milestones = [25, 50, 75, 100] as const;

// Status badge configuration
export const statusConfig = {
    success: {
        label: 'Success',
        color: colors.status.success,
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-400',
    },
    warning: {
        label: 'Warning',
        color: colors.status.warning,
        bgClass: 'bg-amber-100 dark:bg-amber-900/30',
        textClass: 'text-amber-700 dark:text-amber-400',
    },
    error: {
        label: 'Error',
        color: colors.status.error,
        bgClass: 'bg-red-100 dark:bg-red-900/30',
        textClass: 'text-red-700 dark:text-red-400',
    },
    pending: {
        label: 'Pending',
        color: colors.status.pending,
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-400',
    },
} as const;

// Type exports
export type AccentColor = keyof typeof colors.accent;
export type StatusType = keyof typeof colors.status;
export type FeatureType = keyof typeof features;
export type Milestone = typeof milestones[number];
