# Goal

Create a lesson plan to teach others how to learn privacy via zero knowledge with a focus on Noir.

## Lesson 1

**Objective:** Run through the [Noir quickstart](https://noir-lang.org/docs/getting_started/quick_start)

### Install Noir

```bash
# Install Noir version manager
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash

# Install Noir
noirup
```

### Install Barretenberg

```bash
# Install Barretenberg backend
curl -L https://raw.githubusercontent.com/AztecProtocol/aztec-packages/refs/heads/master/barretenberg/bbup/install | bash

# Install Barretenberg
bbup
```

### Initialize Project

```bash
# Create new Noir project
nargo new hello_world
cd hello_world

# Verify setup
nargo check
```

### Compile and Execute

```bash
# Create Prover.toml with inputs
echo 'x = "1"' > Prover.toml
echo 'y = "2"' >> Prover.toml

# Compile and execute (generates witness)
nargo execute
```

### Test Failing Case

```bash
# Test with x=1, y=1 (this will fail)
echo 'x = "1"' > Prover.toml
echo 'y = "1"' >> Prover.toml
nargo execute
```

### Generate and Verify Proof

```bash
# Generate proof
bb prove -b ./target/hello_world.json -w ./target/hello_world.gz -o ./target

# Generate verification key
bb write_vk -b ./target/hello_world.json -o ./target

# Verify proof
bb verify -k ./target/vk -p ./target/proof -i ./target/public_inputs
```

### Examine Binary Files

For the curious.

```bash
# View proof file as hex dump
xxd ./target/proof
```

## Lesson 2: Generate a Solidity Verifier

**Objective:** Create a Solidity verifier contract and use it to verify zero-knowledge proofs. This lesson builds on the hello world example.

### Step 1 - Generate Contract

```bash
nargo compile

# Generate verification key with keccak hash
bb write_vk -b ./target/hello_world.json -o ./target --oracle_hash keccak

# Generate Solidity verifier
bb write_solidity_verifier -k ./target/vk -o ./target/Verifier.sol
```

A `Verifier.sol` contract is now in the target folder and can be deployed to any EVM blockchain as a verifier smart contract.

### Step 2 - Deploy via Remix

1. Go to [Remix Ethereum IDE](https://remix.ethereum.org/)
2. Create a blank project
3. Create `Verifier.sol` file and paste the contract code
4. **Important:** Enable optimizations (set to 200) due to contract size restrictions
5. Deploy HonkVerifier - Verifier.sol

### Step 3 - Generate Proof

```bash
bb prove -b ./target/hello_world.json -w ./target/hello_world.gz -o ./target --oracle_hash keccak --output_format bytes_and_fields
```

**Understanding the parameters:**

- **`circuit-name`** = the name of your circuit's compiled JSON file (e.g., `hello_world.json`)
  - This file defines the logic and constraints of your zero-knowledge circuit
  - Generated when you run `nargo compile`
- **`witness-name`** = the name of your witness file containing the inputs for the circuit (e.g., `hello_world.gz`)
  - This file contains the private inputs (witness values) for your circuit
  - Generated when you run `nargo execute`

### Step 4 - Verify in Remix

To verify with Remix, pass the proof bytes as a hex string and public inputs as `bytes32[]`:
**Public inputs:** Use `./target/public_inputs_fields.json` file. Copy the hex array directly into Remix.

```bash
# Convert proof to hex string
echo -n "0x"; cat ./target/proof | od -An -v -t x1 | tr -d $' \n'
```

![Proof generation output](./hello_world/proofsample.png)

**Remix Interface:**

![Remix input fields](./hello_world/remixinput.png)
_Input fields for proof verification_

![Successful verification](./hello_world/remixoutput.png)
_Successful proof verification_

## Lesson 3: Prove a Live Ethereum Balance Meets a Threshold

**Objective:** Use Noir to prove that an Ethereum account's balance at a specific block number is greater than or equal to a public threshold, without revealing the account address.

**Note:** This lesson demonstrates the concept but lacks data authenticity. Lesson 4 adds cryptographic signatures for trusted data.

### Step 1 - Create Project Structure

```bash
# Create new Noir project
nargo new balance_threshold

# Navigate to balance_threshold directory
cd balance_threshold

# Install dependencies
npm install
```

### Step 2 - Understand the Circuit

The circuit logic is in [src/main.nr](./balance_threshold/src/main.nr). It proves:

- Account balance ≥ threshold
- Uses a nonce for uniqueness
- References a specific block number

### Step 3 - Fetch Live Blockchain Data

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

### Step 4 - Generate and Verify Proof

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

### What's Proven & What's Trusted

**What a third party can verify:**

- The prover knows an account with balance ≥ 0.1 ETH at a specific block
- The account address remains private
- The proof is mathematically valid

**What they cannot trust:**

- The balance/block data actually came from Ethereum
- A malicious prover could claim false balances or fake block numbers

**Key Limitation:** No cryptographic proof that the data is authentic. The circuit simply accepts whatever inputs the prover provides.

**To verify:** Send them `vk`, `proof`, and `public_inputs`, then run:

```bash
bb verify -k vk -p proof -i public_inputs
```

## Lesson 4: Authentic Balance Proof with a Trusted Signer (Privacy Preserved)

**Objective:** Prove that a hidden account’s balance at a given block is ≥ a public threshold, with the data signed by a trusted oracle so it’s authentic. The account address stays private. We also add a private `secret` we’ll use for nullifiers in Lesson 5.

**Key Improvement over Lesson 3:** **Authenticity vs. Unverified Data**

| Lesson 3 (Unsigned)                                           | Lesson 4 (Signed)                                                                   |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Public:** threshold, nonce, block, chain ID, balance result | **Public:** threshold, nonce, block, chain ID, balance result, **oracle signature** |
| **Private:** account address                                  | **Private:** account address, secret                                                |
| **Trust:** none - prover can fake balance/block data          | **Trust:** oracle's signature proves data authenticity                              |
| **Risk:** malicious prover claims false 100 ETH at fake block | **Security:** circuit verifies ECDSA signature before accepting data                |

### Step 1 - Create a New Project

```bash
nargo new balance_signed
cd balance_signed
npm init -y
npm install viem dotenv
mkdir scripts
```

### Step 2 - Understand the Circuit

The circuit logic is in [src/main.nr](./balance_signed/src/main.nr). It proves:

- ECDSA signature over the balance claim
- Balance ≥ threshold
- Valid blockchain data (nonce, block number, chain ID)
- Private `secret` for future nullifier use

### Step 3 - Set Up Environment

Create a `.env` file with your oracle credentials:

```bash
ORACLE_PRIVATE_KEY=your_private_key_here
RPC_URL=your_ethereum_rpc_url
```

### Step 4 - Generate Signed Claim

Use the [scripts/sign-claim.mjs](./balance_signed/scripts/sign-claim.mjs) script to:

- Fetch live balance and blockchain data
- Sign the claim with your oracle private key
- Generate `Prover.toml` with all inputs

```bash
# Generate signed claim for address with threshold
node scripts/sign-claim.mjs 0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF 0.1
```

### Step 5 - Export Oracle Public Key

Extract your oracle's public key coordinates:

```bash
node scripts/export-oracle-pubkey.mjs
```

### Step 6 - Generate and Verify Proof

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

### What's Proven & What's Trusted

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
