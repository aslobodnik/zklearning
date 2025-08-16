# Zero Knowledge Learning with Noir

A comprehensive lesson plan to teach others how to learn privacy via zero knowledge with a focus on Noir.

## Overview

This repository contains a series of progressive lessons that build upon each other to teach zero-knowledge proofs using Noir. Each lesson focuses on practical, hands-on examples that demonstrate real-world applications of ZK technology.

## Learning Path

### [Lesson 1: Hello World - Noir Basics](./hello_world/README.md)

**Objective:** Get started with Noir by running through the basic quickstart

- Install Noir and Barretenberg
- Create your first circuit
- Generate and verify proofs
- Understand the basic workflow

### [Lesson 2: Solidity Verifier Generation](./hello_world/README.md#lesson-2-generate-a-solidity-verifier)

**Objective:** Create a Solidity verifier contract and use it to verify zero-knowledge proofs

- Generate Solidity verifier contracts
- Deploy and test on Remix
- Understand on-chain verification

### [Lesson 3: Balance Threshold Proofs](./balance_threshold/README.md)

**Objective:** Prove that an Ethereum account's balance meets a threshold without revealing the account

- Work with live blockchain data
- Understand privacy vs. authenticity trade-offs
- Generate proofs for balance claims

### [Lesson 4: Authentic Balance Proofs with Trusted Oracle](./balance_signed/README.md)

**Objective:** Add cryptographic signatures for trusted data authenticity

- Implement ECDSA signature verification
- Create trusted oracle systems
- Maintain privacy while ensuring data authenticity

### [Lesson 5: Trustless Balance Proofs](./balance_trustless/README.md)

**Objective:** Remove trusted oracles and verify balances directly from Ethereum state

- Work with Merkle-Patricia Trie proofs
- Verify state roots cryptographically
- Achieve trustless verification

## Prerequisites

- Basic understanding of cryptography concepts
- Familiarity with command line tools
- Knowledge of Ethereum and smart contracts (for later lessons)

## Getting Started

1. Start with [Lesson 1](./hello_world/README.md) to set up your development environment
2. Follow each lesson in sequence as they build upon previous concepts
3. Each lesson includes complete code examples and step-by-step instructions

## Contributing

Feel free to submit issues, suggestions, or improvements to any of the lessons. The goal is to make zero-knowledge proofs accessible to everyone.

## Resources

- [Noir Documentation](https://noir-lang.org/docs/)
- [Barretenberg Backend](https://github.com/AztecProtocol/aztec-packages/tree/master/barretenberg)
- [Noir Language Reference](https://noir-lang.org/reference/)
