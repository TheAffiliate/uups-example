// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyContract is UUPSUpgradeable, OwnableUpgradeable {
    uint256 public value;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 initialValue) public initializer {
        __Ownable_init(msg.sender);
        value = initialValue;
    }

    function setValue(uint256 newValue) public onlyOwner {
        value = newValue;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}