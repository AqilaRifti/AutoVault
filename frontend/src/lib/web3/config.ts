import { http, createConfig } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// WalletConnect Project ID - get from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id';

// Chain configuration
const chains = [sepolia, hardhat] as const;

// RainbowKit config with wagmi
export const config = getDefaultConfig({
    appName: 'AutoVault',
    projectId,
    chains,
    ssr: true,
});

// Export chains for use in components
export { chains };

// Chain IDs
export const SEPOLIA_CHAIN_ID = 11155111;
export const HARDHAT_CHAIN_ID = 31337;

// Default chain based on environment
export const DEFAULT_CHAIN_ID = process.env.NODE_ENV === 'development'
    ? HARDHAT_CHAIN_ID
    : SEPOLIA_CHAIN_ID;
