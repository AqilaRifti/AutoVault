import { type Address } from 'viem';

/**
 * Contract addresses for AutoVault
 * Update these after deploying to Sepolia
 */
export interface ContractAddresses {
    mnee: Address;
    smartVault: Address;
    goalLocker: Address;
    dcaExecutor: Address;
}

// Sepolia testnet addresses (update after deployment)
export const SEPOLIA_ADDRESSES: ContractAddresses = {
    mnee: '0xB69a340155d16D963A8173Cb3A6cBF4093aB26E9' as Address,
    smartVault: '0x47846df5e07ffd869C50871de328AF21D3CEF4D3' as Address,
    goalLocker: '0xCDFdCdBbf3a11e9FA661F8DF3D1B2c6825F12252' as Address,
    dcaExecutor: '0x6602c410F6aB155BA7fBaB056CB394F21D19927C' as Address,
};

// Local hardhat addresses (update after local deployment)
export const HARDHAT_ADDRESSES: ContractAddresses = {
    mnee: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
    smartVault: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address,
    goalLocker: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as Address,
    dcaExecutor: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as Address,
};

// Get addresses based on chain ID
export function getContractAddresses(chainId: number): ContractAddresses {
    switch (chainId) {
        case 11155111: // Sepolia
            return SEPOLIA_ADDRESSES;
        case 31337: // Hardhat
            return HARDHAT_ADDRESSES;
        default:
            return SEPOLIA_ADDRESSES;
    }
}

// MNEE Token ABI (ERC20 standard functions we need)
export const MNEE_ABI = [
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
    {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
    {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
    },
    {
        name: 'symbol',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
    },
] as const;
