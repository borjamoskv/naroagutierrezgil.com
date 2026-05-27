// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC6551Registry.sol";

contract FronteraERC6551Registry is IERC6551Registry {
    error AccountCreationFailed();

    function createAccount(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt,
        bytes calldata initData
    ) external override returns (address) {
        bytes memory code = _creationCode(implementation, chainId, tokenContract, tokenId, salt);
        address _account;

        assembly {
            _account := create2(0, add(code, 0x20), mload(code), salt)
        }

        if (_account == address(0)) {
            revert AccountCreationFailed();
        }

        if (initData.length > 0) {
            (bool success, ) = _account.call(initData);
            if (!success) {
                revert AccountCreationFailed();
            }
        }

        emit ERC6551AccountCreated(_account, implementation, chainId, tokenContract, tokenId, salt);

        return _account;
    }

    function account(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    ) external view override returns (address) {
        bytes32 bytecodeHash = keccak256(
            _creationCode(implementation, chainId, tokenContract, tokenId, salt)
        );

        return address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            salt,
                            bytecodeHash
                        )
                    )
                )
            )
        );
    }

    function _creationCode(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 /*salt*/
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                hex"3d60ad80600a3d3981f3363d3d373d3d3d363d73",
                implementation,
                hex"5af43d82803e903d91602b57fd5bf3",
                abi.encode(chainId, tokenContract, tokenId)
            );
    }
}
