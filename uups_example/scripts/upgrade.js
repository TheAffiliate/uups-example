const { ethers, upgrades } = require('hardhat');

// Address of the proxy contract from your initial deployment
const PROXY_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Upgrading from:', deployer.address);
  console.log('Implementation before:', await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS));

  const MyContractV2 = await ethers.getContractFactory('MyContractV2');
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, MyContractV2);
  await upgraded.waitForDeployment();

  console.log('Proxy upgraded at:', await upgraded.getAddress());
  console.log('Implementation after: ', await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});