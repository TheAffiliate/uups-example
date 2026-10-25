const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('MyContract', function () {
  it('should deploy successfully', async function () {
    const MyContract = await ethers.getContractFactory('MyContract');
    const contract = await MyContract.deploy();
    expect(await contract.getAddress()).to.not.equal(ethers.ZeroAddress);
  });
});
