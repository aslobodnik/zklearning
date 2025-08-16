# Lesson 3: Balance Threshold Proofs

**Objective:** Prove an Ethereum account's balance meets a threshold without revealing the account address.

**Note:** This demonstrates the concept but lacks data authenticity. Lesson 4 adds cryptographic signatures.

## Overview

In this lesson, you'll learn how to:

- Work with live blockchain data in Noir circuits
- Prove account balances meet thresholds while preserving privacy
- Understand the trade-offs between privacy and data authenticity
- Generate and verify proofs for balance claims

## Step 1 - Create Project Structure

```bash
# Create new Noir project
nargo new balance_threshold

# Navigate to balance_threshold directory
cd balance_threshold

# Install dependencies
npm install
```

## Step 2 - Understand the Circuit

The circuit logic is in [src/main.nr](./src/main.nr). It proves:

- Account balance ≥ threshold
- Uses a nonce for uniqueness
- References a specific block number

The circuit takes the account address as a private input and proves that its balance at the specified block meets or exceeds the threshold, all while keeping the address hidden.

## Step 3 - Fetch Live Blockchain Data

```bash
# Fetch balance data and generate Prover.toml
npm run fetch -- 0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF 0.1
```

This script:

- Fetches live balance from Ethereum mainnet
- Sets threshold to 0.1 ETH
- Generates unique nonce
- Gets current block number
- Writes `Prover.toml` with all required values

## Step 4 - Generate and Verify Proof

```bash
# Generate witness
nargo execute

# Compile circuit
nargo compile

# Generate verification key
bb write_vk -b ./target/balance_threshold.json -o ./target

# Generate proof
bb prove -b ./target/balance_threshold.json -w ./target/balance_threshold.gz -o ./target

# Verify locally
bb verify -k ./target/vk -p ./target/proof -i ./target/public_inputs
```

**What this proves:** You can demonstrate that an account has at least 0.1 ETH without revealing the account address, using live blockchain data.

⚠️ **Security Warning:** There is no cryptographic guarantee yet that the balance/block number came from Ethereum — a malicious prover could fake inputs. Lesson 4 will add a trusted data source.

## What's Proven & What's Trusted

| What's Proven                                 | What's Trusted                 | What's Private  |
| --------------------------------------------- | ------------------------------ | --------------- |
| Account balance ≥ threshold at specific block | Nothing - prover can fake data | Account address |
| Proof is mathematically valid                 |                                |                 |
| Account address remains hidden                |                                |                 |

**Key Limitation:** No cryptographic proof that the data is authentic. The circuit simply accepts whatever inputs the prover provides.

**To verify:** Send them `vk`, `proof`, and `public_inputs`, then run:

```bash
bb verify -k vk -p proof -i public_inputs
```

## Key Concepts Learned

1. **Privacy vs. Authenticity Trade-off** - You can prove something is true without revealing the source, but you can't prove the data itself is authentic
2. **Blockchain Data Integration** - How to fetch and use live Ethereum data in ZK circuits
3. **Nonce Usage** - How to ensure proof uniqueness across different claims
4. **Threshold Logic** - Implementing comparison operations in Noir circuits

## Next Steps

Continue to [Lesson 4: Authentic Balance Proofs with Trusted Oracle](../balance_signed/README.md) to learn how to add cryptographic signatures for trusted data authenticity, addressing the security limitation of this lesson.

## Files in This Lesson

- `src/main.nr` - The Noir circuit that proves balance ≥ threshold
- `scripts/fetch-balance.mjs` - Script to fetch live blockchain data
- `Nargo.toml` - Project configuration
- `Prover.toml` - Generated input file (created by the fetch script)
