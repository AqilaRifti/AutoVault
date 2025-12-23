'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function WalletButton() {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
            }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button
                                        onClick={openConnectModal}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                    >
                                        <Wallet className="mr-2 h-4 w-4" />
                                        Connect Wallet
                                    </Button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <Button
                                        onClick={openChainModal}
                                        variant="destructive"
                                    >
                                        Wrong Network
                                    </Button>
                                );
                            }

                            return (
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={openChainModal}
                                        variant="outline"
                                        size="sm"
                                        className="hidden sm:flex"
                                    >
                                        {chain.hasIcon && chain.iconUrl && (
                                            <img
                                                alt={chain.name ?? 'Chain icon'}
                                                src={chain.iconUrl}
                                                className="h-4 w-4 mr-2"
                                            />
                                        )}
                                        {chain.name}
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                <span className="hidden sm:inline">
                                                    {account.displayName}
                                                </span>
                                                <span className="sm:hidden">
                                                    {account.displayName.slice(0, 6)}...
                                                </span>
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <div className="px-2 py-1.5">
                                                <p className="text-sm font-medium">
                                                    {account.displayBalance ?? '0 ETH'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                                                </p>
                                            </div>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    navigator.clipboard.writeText(account.address);
                                                    toast.success('Address copied to clipboard');
                                                }}
                                            >
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy Address
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    window.open(
                                                        `https://sepolia.etherscan.io/address/${account.address}`,
                                                        '_blank'
                                                    );
                                                }}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View on Explorer
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={openAccountModal}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Disconnect
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}
