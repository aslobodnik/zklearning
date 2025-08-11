import { privateKeyToAccount } from "viem/accounts";
import { hexToBytes } from "viem";
import dotenv from "dotenv";

dotenv.config();

const pk = process.env.ORACLE_PRIVATE_KEY;
if (!pk) {
  console.error("Set ORACLE_PRIVATE_KEY in your environment");
  process.exit(1);
}

const acct = privateKeyToAccount(pk);
// acct.publicKey is 0x04 || X || Y (uncompressed). Drop the 0x04.
const pub = acct.publicKey; // 0x04xxxxxxxx
const bytes = hexToBytes(pub);
if (bytes[0] !== 4) throw new Error("Expected uncompressed key 0x04..");

const x = `0x${Buffer.from(bytes.slice(1, 33)).toString("hex")}`;
const y = `0x${Buffer.from(bytes.slice(33, 65)).toString("hex")}`;

console.log({ pubkey_uncompressed: pub, pubkey_x: x, pubkey_y: y });
