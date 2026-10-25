const { ethers, upgrades } = require('hardhat');

async function main() {
  const [admin] = await ethers.getSigners();
  console.log('Deploying from:', admin.address);

  const MyContract = await ethers.getContractFactory('MyContract');
  const proxy = await upgrades.deployProxy(MyContract, [42], {
    initializer: 'initialize',
    kind: 'uups',
  });

  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  console.log('Proxy address: ', proxyAddress);
  console.log('Current implementation address: ', await upgrades.erc1967.getImplementationAddress(proxyAddress));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});