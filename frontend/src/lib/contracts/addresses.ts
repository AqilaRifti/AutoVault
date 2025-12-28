import { type Address } from 'viem';

/**
 * Contract addresses for AutoVault
 * Update these after deploying to Sepolia
 */
export interface ContractAddresses {
    mnee: Address;
    mneeTokenId: bigint;
    smartVault: Address;
    goalLocker: Address;
    dcaExecutor: Address;
}

// Sepolia testnet addresses (update after deployment)
export const SEPOLIA_ADDRESSES: ContractAddresses = {
    mnee: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF' as Address,
    mneeTokenId: 0n, // ERC-1155 token ID for MNEE
    smartVault: '0x47846df5e07ffd869C50871de328AF21D3CEF4D3' as Address,
    goalLocker: '0xCDFdCdBbf3a11e9FA661F8DF3D1B2c6825F12252' as Address,
    dcaExecutor: '0x6602c410F6aB155BA7fBaB056CB394F21D19927C' as Address,
};

// Local hardhat addresses (update after local deployment)
export const HARDHAT_ADDRESSES: ContractAddresses = {
    mnee: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
    mneeTokenId: 0n,
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

// MNEE Token ABI (ERC-1155 standard functions we need)
export const MNEE_ABI = [
    // ERC-1155 balanceOf
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'account', type: 'address' },
            { name: 'id', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
    // ERC-1155 balanceOfBatch
    {
        name: 'balanceOfBatch',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'accounts', type: 'address[]' },
            { name: 'ids', type: 'uint256[]' },
        ],
        outputs: [{ name: '', type: 'uint256[]' }],
    },
    // ERC-1155 isApprovedForAll (replaces allowance)
    {
        name: 'isApprovedForAll',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'account', type: 'address' },
            { name: 'operator', type: 'address' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
    // ERC-1155 setApprovalForAll (replaces approve)
    {
        name: 'setApprovalForAll',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'operator', type: 'address' },
            { name: 'approved', type: 'bool' },
        ],
        outputs: [],
    },
    // ERC-1155 safeTransferFrom
    {
        name: 'safeTransferFrom',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'id', type: 'uint256' },
            { name: 'amount', type: 'uint256' },
            { name: 'data', type: 'bytes' },
        ],
        outputs: [],
    },
    // ERC-1155 safeBatchTransferFrom
    {
        name: 'safeBatchTransferFrom',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'ids', type: 'uint256[]' },
            { name: 'amounts', type: 'uint256[]' },
            { name: 'data', type: 'bytes' },
        ],
        outputs: [],
    },
    // Mock mint function for testing
    {
        name: 'mint',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [],
    },
    // ERC-1155 uri
    {
        name: 'uri',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'id', type: 'uint256' }],
        outputs: [{ name: '', type: 'string' }],
    },
    // supportsInterface
    {
        name: 'supportsInterface',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'interfaceId', type: 'bytes4' }],
        outputs: [{ name: '', type: 'bool' }],
    },
] as const;
