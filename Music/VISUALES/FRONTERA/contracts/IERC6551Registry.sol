// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC6551Registry {
    event ERC6551AccountCreated(
        address account,
        address indexed implementation,
        uint256 indexed chainId,
        address indexed tokenContract,
        uint256 tokenId,
        uint256 salt
    );

    function createAccount(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt,
        bytes calldata initData
    ) external returns (address);

    function account(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    ) external view returns (address);
}
