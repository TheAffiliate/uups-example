const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

// Runs a transaction that should revert and checks the custom error name (and optional extra text) in the message.
async function expectCustomError(promise, errorName, ...mustInclude) {
  let error;
  try {
    await promise;
  } catch (err) {
    error = err;
  }
  expect(error, `expected a revert with ${errorName}, but the call succeeded`).to.not.equal(undefined);
  expect(error.message).to.include(errorName);
  for (const text of mustInclude) {
    expect(error.message).to.include(text);
  }
}

describe('MyContract (UUPS proxy)', function () {
  let owner, other, MyContract, MyContractV2, proxy, proxyAddress;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    MyContract = await ethers.getContractFactory('MyContract');
    MyContractV2 = await ethers.getContractFactory('MyContractV2');

    proxy = await upgrades.deployProxy(MyContract, [42], { initializer: 'initialize', kind: 'uups' });
    await proxy.waitForDeployment();
    proxyAddress = await proxy.getAddress();
  });

  describe('V1', function () {
    it('initializes value and owner through the proxy', async function () {
      expect(await proxy.value()).to.equal(42n);
      expect(await proxy.owner()).to.equal(owner.address);
    });

    it('lets the owner set the value', async function () {
      await proxy.setValue(100);
      expect(await proxy.value()).to.equal(100n);
    });

    it('blocks non-owners from setting the value', async function () {
      await expectCustomError(proxy.connect(other).setValue(100), 'OwnableUnauthorizedAccount', other.address);
    });

    it('cannot be initialized a second time', async function () {
      await expectCustomError(proxy.initialize(1), 'InvalidInitialization');
    });
  });

  describe('upgrade to V2', function () {
    it('keeps the proxy address, value and owner, and swaps the implementation', async function () {
      const implBefore = await upgrades.erc1967.getImplementationAddress(proxyAddress);

      const upgraded = await upgrades.upgradeProxy(proxyAddress, MyContractV2);

      expect(await upgraded.getAddress()).to.equal(proxyAddress);
      expect(await upgrades.erc1967.getImplementationAddress(proxyAddress)).to.not.equal(implBefore);
      expect(await upgraded.value()).to.equal(42n);
      expect(await upgraded.owner()).to.equal(owner.address);
    });

    it('adds readValue() and keeps setValue() working', async function () {
      const upgraded = await upgrades.upgradeProxy(proxyAddress, MyContractV2);
      expect(await upgraded.readValue()).to.equal(42n);

      await upgraded.setValue(7);
      expect(await upgraded.readValue()).to.equal(7n);
    });

    it('blocks non-owners from upgrading', async function () {
      const newImpl = await MyContractV2.deploy();
      await expectCustomError(
        proxy.connect(other).upgradeToAndCall(await newImpl.getAddress(), '0x'),
        'OwnableUnauthorizedAccount',
        other.address
      );
    });
  });
});