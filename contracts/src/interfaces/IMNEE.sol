// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IMNEE
 * @notice Interface for the MNEE stablecoin token
 * @dev Extends standard ERC20 interface
 */
interface IMNEE is IERC20 {
    /**
     * @notice Returns the number of decimals used for token amounts
     * @return The number of decimals (typically 18)
     */
    function decimals() external view returns (uint8);

    /**
     * @notice Returns the name of the token
     * @return The token name
     */
    function name() external view returns (string memory);

    /**
     * @notice Returns the symbol of the token
     * @return The token symbol
     */
    function symbol() external view returns (string memory);
}
