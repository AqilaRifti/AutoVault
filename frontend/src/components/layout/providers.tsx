'use client';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/web3/config';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import { ActiveThemeProvider } from '../active-theme';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={resolvedTheme === 'dark'
            ? darkTheme({
              accentColor: '#22c55e',
              accentColorForeground: 'white',
              borderRadius: 'medium',
            })
            : lightTheme({
              accentColor: '#22c55e',
              accentColorForeground: 'white',
              borderRadius: 'medium',
            })
          }
          modalSize="compact"
        >
          <ActiveThemeProvider initialTheme={activeThemeValue}>
            {children}
          </ActiveThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
