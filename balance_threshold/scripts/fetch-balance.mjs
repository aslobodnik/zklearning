// scripts/fetch-balance.mjs
import fs from "node:fs";
import { createPublicClient, http, isAddress, parseEther } from "viem";
import { mainnet } from "viem/chains";

/**
 * Usage:
 *   npm run fetch -- 0xYourAddress [thresholdEth] [nonce] [rpcUrl]
 * Examples:
 *   npm run fetch -- 0xabc...             # threshold=0.1, nonce=auto, RPC from env or localhost
 *   npm run fetch -- 0xabc... 0.2         # 0.2 ETH threshold
 *   npm run fetch -- 0xabc... 0.1 1234    # fixed nonce
 *   npm run fetch -- 0xabc... 0.1 0 https://rpc.ankr.com/eth  # nonce auto if 0
 */

const [, , addrArg, thresholdEthArg, nonceArg, rpcArg] = process.argv;

if (!addrArg || !isAddress(addrArg)) {
  console.error(
    "Provide a valid EVM address. Example: npm run fetch -- 0xYourAddress 0.1"
  );
  process.exit(1);
}

const thresholdEth = thresholdEthArg || "0.1";
const rpcUrl = rpcArg || process.env.RPC_URL;

// 64-bit nonce: if provided and >0 use it, else auto-generate
let nonce;
if (nonceArg && BigInt(nonceArg) > 0n) {
  nonce = BigInt(nonceArg);
} else {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const rand = BigInt(Math.floor(Math.random() * 2 ** 32));
  nonce = ((now & 0xffffffffn) << 32n) ^ (rand & 0xffffffffn);
  if (nonce === 0n) nonce = 1n;
}

const client = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
});

const address = addrArg;

// fetch balance in wei
const balance = await client.getBalance({ address });

// convert thresholdEth to wei
const threshold = parseEther(thresholdEth);

// sanity: circuit uses u128. Most balances fit. Warn if not.
const maxU128 = (1n << 128n) - 1n;
if (balance > maxU128 || threshold > maxU128) {
  console.error(
    "Balance or threshold exceeds u128. Change circuit types to u256 if needed."
  );
  process.exit(1);
}

// Write Prover.toml for Noir
const toml = `balance = "${balance.toString()}"
threshold = "${threshold.toString()}"
nonce = "${nonce.toString()}"
`;

fs.writeFileSync("Prover.toml", toml);

console.log("Prover.toml written.");
console.log({
  address,
  balance: balance.toString(),
  threshold: threshold.toString(),
  nonce: nonce.toString(),
});
console.log("Next: run `nargo execute`");
