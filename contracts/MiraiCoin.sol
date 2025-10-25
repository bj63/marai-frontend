// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MiraiCoin
/// @notice Utility ERC-20 token that powers the Mirai marketplace economy.
contract MiraiCoin is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("MiraiCoin", "MRC") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /// @notice Allows the owner to mint additional supply for ecosystem incentives.
    /// @param to Address receiving the newly minted supply.
    /// @param amount Whole token amount (before decimals) to mint.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * 10 ** decimals());
    }
}
