// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "./IERC6551Account.sol";

contract FronteraERC6551Account is IERC165, IERC6551Account, IERC1271 {
    uint256 public state;

    receive() external payable override {}

    function token()
        public
        view
        override
        returns (
            uint256 chainId,
            address tokenContract,
            uint256 tokenId
        )
    {
        bytes memory footer = new bytes(72);
        assembly {
            extcodecopy(address(), add(footer, 0x20), sub(extcodesize(address()), 72), 72)
        }
        return abi.decode(footer, (uint256, address, uint256));
    }

    function owner() public view returns (address) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = token();
        if (chainId != block.chainid) return address(0);
        return IERC721(tokenContract).ownerOf(tokenId);
    }

    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable returns (bytes memory result) {
        require(msg.sender == owner(), "FronteraTBA: Only owner can execute");
        
        bool success;
        (success, result) = to.call{value: value}(data);
        require(success, "FronteraTBA: Call failed");
        
        state += 1;
    }

    function isValidSigner(address signer, bytes calldata)
        external
        view
        override
        returns (bytes4 magicValue)
    {
        if (signer == owner()) {
            return IERC6551Account.isValidSigner.selector;
        }
        return bytes4(0);
    }

    function isValidSignature(bytes32 hash, bytes memory signature)
        external
        view
        override
        returns (bytes4 magicValue)
    {
        if (SignatureChecker.isValidSignatureNow(owner(), hash, signature)) {
            return IERC1271.isValidSignature.selector;
        }
        return bytes4(0);
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC6551Account).interfaceId ||
            interfaceId == type(IERC1271).interfaceId;
    }
}
