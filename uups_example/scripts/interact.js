const { ethers } = require('hardhat');

// Address of the proxy contract (printed by deploy.js)
const PROXY_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

async function main() {
  const [signer] = await ethers.getSigners();
  console.log('Interacting from:', signer.address);

  // V2 ABI attached to the PROXY address
  const contract = await ethers.getContractAt('MyContractV2', PROXY_ADDRESS);

  try {
    console.log('Value via readValue():', (await contract.readValue()).toString());
  } catch (err) {
    console.error('readValue() failed. Has scripts/upgrade.js been run on this network?');
    throw err;
  }

  const tx = await contract.setValue(100);
  await tx.wait();

  console.log('Value after setValue(100):', (await contract.readValue()).toString());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});