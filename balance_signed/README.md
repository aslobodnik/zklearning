# Lesson 4: Authentic Balance Proofs with Trusted Oracle

**Objective:** Prove that a hidden account's balance at a given block is ≥ a public threshold, with the data signed by a trusted oracle so it's authentic. The account address stays private. We also add a private `secret` we'll use for nullifiers in Lesson 5.

## Overview

This lesson addresses the key limitation from Lesson 3 by adding cryptographic signatures for data authenticity. You'll learn how to:

- Implement ECDSA signature verification in Noir circuits
- Create trusted oracle systems
- Maintain privacy while ensuring data authenticity
- Understand the security improvements over unsigned data

## Key Improvement over Lesson 3: Authenticity vs. Unverified Data

| Lesson 3 (Unsigned)                                           | Lesson 4 (Signed)                                                                   |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Public:** threshold, nonce, block, chain ID, balance result | **Public:** threshold, nonce, block, chain ID, balance result, **oracle signature** |
| **Private:** account address                                  | **Private:** account address, secret                                                |
| **Trust:** none - prover can fake balance/block data          | **Trust:** oracle's signature proves data authenticity                              |
| **Risk:** malicious prover claims false 100 ETH at fake block | **Security:** circuit verifies ECDSA signature before accepting data                |

## Step 1 - Create a New Project

```bash
nargo new balance_signed
cd balance_signed
npm init -y
npm install viem dotenv
mkdir scripts
```

## Step 2 - Understand the Circuit

The circuit logic is in [src/main.nr](./src/main.nr). It proves:

- ECDSA signature over the balance claim
- Balance ≥ threshold
- Valid blockchain data (nonce, block number, chain ID)
- Private `secret` for future nullifier use

The circuit now verifies that the oracle actually signed the balance claim, providing cryptographic proof that the data is authentic.

## Step 3 - Set Up Environment

Create a `.env` file with your oracle credentials:

```bash
ORACLE_PRIVATE_KEY=your_private_key_here
RPC_URL=your_ethereum_rpc_url
```

## Step 4 - Generate Signed Claim

Use the [scripts/sign-claim.mjs](./scripts/sign-claim.mjs) script to:

- Fetch live balance and blockchain data
- Sign the claim with your oracle private key
- Generate `Prover.toml` with all inputs

```bash
# Generate signed claim for address with threshold
node scripts/sign-claim.mjs 0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF 0.1
```

## Step 5 - Export Oracle Public Key

Extract your oracle's public key coordinates:

```bash
node scripts/export-oracle-pubkey.mjs
```

## Step 6 - Generate and Verify Proof

```bash
# Generate witness
nargo execute

# Compile circuit
nargo compile

# Generate verification key
bb write_vk -b ./target/balance_signed.json -o ./target

# Generate proof
bb prove -b ./target/balance_signed.json -w ./target/balance_signed.gz -o ./target

# Verify locally
bb verify -k ./target/vk -p ./target/proof -i ./target/public_inputs
```

## What's Proven & What's Trusted

**What a third party can verify:**

- The account has balance ≥ threshold at the specified block
- The data is cryptographically signed by the trusted oracle
- The proof is mathematically valid

**What they trust:**

- The oracle's private key and the blockchain RPC endpoint
- The signature provides cryptographic proof that the oracle attested to this specific balance at this specific block

**Key Security Improvement:** The ECDSA signature proves the oracle actually verified this data from Ethereum. A malicious prover cannot fake balance or block numbers.

**What remains private:**

- The account address and the `secret` value

**To verify:** Send them `vk`, `proof`, and `public_inputs`, then run:

```bash
bb verify -k vk -p proof -i public_inputs
```

## Key Concepts Learned

1. **ECDSA Signature Verification** - How to verify cryptographic signatures in Noir circuits
2. **Trusted Oracle Systems** - Creating systems that can cryptographically attest to data
3. **Data Authenticity** - The difference between proving something is true vs. proving the data source is authentic
4. **Security Trade-offs** - Understanding what you gain and what you still trust in signed systems

## Next Steps

Continue to [Lesson 5: Trustless Balance Proofs](../balance_trustless/README.md) to learn how to remove the trusted oracle entirely and verify balances directly from Ethereum state using cryptographic proofs.

## Files in This Lesson

- `src/main.nr` - The Noir circuit with ECDSA signature verification
- `scripts/sign-claim.mjs` - Script to generate signed balance claims
- `scripts/export-oracle-pubkey.mjs` - Script to extract oracle public key
- `Nargo.toml` - Project configuration
- `.env` - Environment variables for oracle credentials
