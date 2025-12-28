// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * @title MockMNEE
 * @notice Mock MNEE token (ERC-1155) for testing purposes
 * @dev Token ID 0 represents the fungible MNEE stablecoin
 */
contract MockMNEE is ERC1155 {
    /// @notice Token ID for the fungible MNEE token
    uint256 public constant MNEE_TOKEN_ID = 0;

    /// @notice Token name
    string public constant name = "Mock MNEE";

    /// @notice Token symbol
    string public constant symbol = "MNEE";

    /// @notice Decimals (for display purposes, ERC-1155 doesn't have decimals)
    uint8 public constant decimals = 18;

    constructor() ERC1155("https://mnee.io/api/token/{id}.json") {
        // Mint 1 million tokens to deployer for testing
        _mint(msg.sender, MNEE_TOKEN_ID, 1_000_000 * 10 ** 18, "");
    }

    /**
     * @notice Mint tokens to any address (for testing)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, MNEE_TOKEN_ID, amount, "");
    }

    /**
     * @notice Mint tokens with specific token ID (for testing)
     * @param to Recipient address
     * @param tokenId Token ID to mint
     * @param amount Amount to mint
     */
    function mintWithId(address to, uint256 tokenId, uint256 amount) external {
        _mint(to, tokenId, amount, "");
    }

    /**
     * @notice Get balance of MNEE tokens (convenience function)
     * @param account Address to check
     * @return Balance of MNEE tokens
     */
    function balanceOfMNEE(address account) external view returns (uint256) {
        return balanceOf(account, MNEE_TOKEN_ID);
    }
}
