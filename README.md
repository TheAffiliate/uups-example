# UUPS Upgradeable Contract Example

A minimal example of an upgradeable smart contract using the **UUPS proxy pattern** (ERC-1967 / ERC-1822), built with Hardhat and OpenZeppelin Contracts Upgradeable 5.x, and deployed to the Sepolia testnet.

The contract stores a single `uint256` value that only the owner can change. The proxy address stays the same when the logic is upgraded, and the stored state is preserved.

> **Educational project.** The code is unaudited and intended for learning and testnet use only.

## Stack

| Tool | Version |
| --- | --- |
| Solidity | 0.8.26 |
| Hardhat | 2.29.x |
| OpenZeppelin Contracts / Contracts Upgradeable | 5.6.x |
| @openzeppelin/hardhat-upgrades | 3.9.x |
| ethers | 6.x |
| Package manager | pnpm |

## Project structure

```
uups_/
├── .gitignore
├── README.md
└── uups_example/
    ├── contracts/
    │   ├── MyContract.sol      # V1 implementation (UUPS + Ownable)
    │   └── MyContractV2.sol    # V2 implementation (upgrade target)
    ├── scripts/
    │   ├── deploy.js           # Deploys the proxy
    │   └── interact.js         # Reads and writes through the proxy
    ├── hardhat.config.js
    ├── .env.example
    └── package.json
```

## How it works

`MyContract` inherits `UUPSUpgradeable` and `OwnableUpgradeable`.

- **`constructor`** calls `_disableInitializers()` so the bare implementation contract can never be initialized by someone else.
- **`initialize(uint256 initialValue)`** runs once, through the proxy, at deployment. It sets the deployer as owner and stores the initial value.
- **`setValue(uint256 newValue)`** updates the stored value. Owner only.
- **`_authorizeUpgrade(address)`** controls who may upgrade the proxy. Owner only.

With UUPS the upgrade logic lives in the implementation contract rather than in the proxy, which keeps the proxy small and cheap to call.

**Always interact with the proxy address, not the implementation address.** The proxy holds the state and the owner. The implementation is only the logic it delegates to.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/)
- A Sepolia RPC URL (Infura, Alchemy, or similar)
- A **test-only** wallet funded with Sepolia ETH

### Install

```powershell
cd uups_example
pnpm install
```

If pnpm reports `ERR_PNPM_IGNORED_BUILDS` for `keccak` and `secp256k1`, run `pnpm approve-builds`, select both, then `pnpm install` again. Both packages fall back to pure-JS versions if the native build is skipped.

### Configure

Copy the example file and fill in your values:

```powershell
Copy-Item .env.example .env
```

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_test_wallet_private_key_without_0x
```

`.env` is listed in `.gitignore`. Never commit it, and never use a wallet that holds real funds.

### Compile

```powershell
pnpm exec hardhat compile
```

### Deploy

Local test run (free, uses Hardhat's built-in network):

```powershell
pnpm exec hardhat run scripts/deploy.js
```

Sepolia:

```powershell
pnpm exec hardhat run scripts/deploy.js --network sepolia
```

The script prints the **proxy address** and the implementation address. Copy the proxy address into `scripts/interact.js`.

### Interact

```powershell
pnpm exec hardhat run scripts/interact.js --network sepolia
```

## Upgrading to V2

`MyContractV2.sol` is the upgrade target. Upgrading with `upgrades.upgradeProxy(proxyAddress, MyContractV2Factory)` deploys the new implementation and points the existing proxy at it. The proxy address, owner, and stored `value` are unchanged. The plugin also checks storage-layout compatibility before it upgrades.

Only the owner can upgrade, because `_authorizeUpgrade` is `onlyOwner`.

## Notes on OpenZeppelin 5.x

This project targets OpenZeppelin 5.x, which differs from the 4.x tutorials still common online:

- `__Ownable_init(initialOwner)` takes the owner address as an argument.
- `__UUPSUpgradeable_init()` no longer exists, so it is not called in `initialize`.
- The upgrades plugin records deployments in `.openzeppelin/`. The Sepolia manifest is needed to upgrade later, so commit it. Local-network manifests are ignored.

## Troubleshooting

| Error | Cause and fix |
| --- | --- |
| `HHE3: No Hardhat config file found` | You are not inside `uups_example`. `cd` into the folder that contains `hardhat.config.js`. |
| `Wrong argument count ... __Ownable_init()` | Using the 4.x call with 5.x. Use `__Ownable_init(msg.sender)`. |
| `Source ... not found: No import callback` | Imports must use the package path (`@openzeppelin/...`), not `../node_modules/...`. |
| Red underlines on imports in VS Code | The editor's Solidity extension cannot resolve `node_modules`. Hardhat can. Ignore them or use the Hardhat for VS Code extension. |

## License

MIT