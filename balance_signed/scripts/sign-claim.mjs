// scripts/sign-claim.mjs
import fs from "node:fs";
import {
  createPublicClient,
  http,
  isAddress,
  parseEther,
  keccak256,
  encodePacked,
  hexToBytes,
} from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { randomBytes } from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const toU8Array = (hex, expected) => {
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  const buf = Buffer.from(h, "hex");
  if (buf.length !== expected)
    throw new Error(`Expected ${expected} bytes, got ${buf.length}`);
  return Array.from(buf.values()); // [0..255]
};

const [, , addrArg, thresholdEthArg, nonceArg] = process.argv;

if (!addrArg || !isAddress(addrArg)) {
  console.error("Provide a valid address");
  process.exit(1);
}
if (!process.env.RPC_URL) {
  console.error("Set RPC_URL");
  process.exit(1);
}
if (!process.env.ORACLE_PRIVATE_KEY) {
  console.error("Set ORACLE_PRIVATE_KEY");
  process.exit(1);
}

const client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.RPC_URL),
});
const account = privateKeyToAccount(process.env.ORACLE_PRIVATE_KEY);

const thresholdWei = parseEther(thresholdEthArg || "0.1");
const address = addrArg;

// fetch live data
const [balance, blockNumber, chainId] = await Promise.all([
  client.getBalance({ address }),
  client.getBlockNumber(),
  client.getChainId(),
]);

// nonce
let nonce;
if (nonceArg && BigInt(nonceArg) > 0n) {
  nonce = BigInt(nonceArg);
} else {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const rand = BigInt(Math.floor(Math.random() * 2 ** 32));
  nonce = ((now & 0xffffffffn) << 32n) ^ (rand & 0xffffffffn);
  if (nonce === 0n) nonce = 1n;
}

// message = keccak256(abi.encodePacked(...))
const DOMAIN = "BALANCE_AT_BLOCK_V1";
const packed = encodePacked(
  ["string", "uint64", "uint64", "uint128", "uint64", "uint128"],
  [DOMAIN, BigInt(chainId), blockNumber, thresholdWei, nonce, balance]
);
const hashed_message = keccak256(packed); // 0x + 32 bytes

// sign raw hash; viem returns 0x{r}{s}{v}
const sig = await account.sign({ hash: hashed_message });
const r = sig.slice(2, 66);
const s = sig.slice(66, 130);
const signature = `0x${r}${s}`; // 64 bytes

// uncompressed pubkey x/y (account.publicKey is 0x04 || X || Y)
const pub = hexToBytes(account.publicKey);
if (pub[0] !== 4) throw new Error("Expected uncompressed pubkey (0x04 prefix)");
const pub_key_x = `0x${Buffer.from(pub.slice(1, 33)).toString("hex")}`;
const pub_key_y = `0x${Buffer.from(pub.slice(33, 65)).toString("hex")}`;

// private secret for future nullifier
const secret = BigInt("0x" + randomBytes(31).toString("hex")).toString();

const signatureArr = toU8Array(signature, 64);
const pubKeyXArr = toU8Array(pub_key_x, 32);
const pubKeyYArr = toU8Array(pub_key_y, 32);
const hashArr = toU8Array(hashed_message, 32);

const arr = (a) => `[${a.join(", ")}]`;

// write Prover.toml matching your circuit
const toml = `balance = "${balance}"
secret = "${secret}"
threshold = "${thresholdWei}"
nonce = "${nonce}"
block_number = "${blockNumber}"
chain_id = "${chainId}"
signature = ${arr(signatureArr)}
pub_key_x = ${arr(pubKeyXArr)}
pub_key_y = ${arr(pubKeyYArr)}
hashed_message = ${arr(hashArr)}
`;

fs.writeFileSync("Prover.toml", toml);
console.log("Prover.toml written with signed claim");
console.log({
  balance: balance.toString(),
  threshold: thresholdWei.toString(),
  blockNumber: blockNumber.toString(),
  chainId,
  nonce: nonce.toString(),
});
