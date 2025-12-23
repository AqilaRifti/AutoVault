'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/web3/config';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60, // 1 minute
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={{
                        lightMode: lightTheme({
                            accentColor: '#22c55e',
                            accentColorForeground: 'white',
                            borderRadius: 'medium',
                        }),
                        darkMode: darkTheme({
                            accentColor: '#22c55e',
                            accentColorForeground: 'white',
                            borderRadius: 'medium',
                        }),
                    }}
                    modalSize="compact"
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                    </ThemeProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
