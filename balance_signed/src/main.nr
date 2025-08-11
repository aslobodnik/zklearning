// src/main.nr
// Adjust the import to your stdlib version if needed
use dep::std;
fn main(
    // private
    balance: u128,
    secret: Field,
    // public scalar inputs
    threshold: pub u128,
    nonce: pub u64,
    block_number: pub u64,
    chain_id: pub u64,
    // public bytes
    signature: pub [u8; 64],
    pub_key_x: pub [u8; 32],
    pub_key_y: pub [u8; 32],
    hashed_message: pub [u8; 32],
) {
    // Verify ECDSA over the 32-byte message hash with uncompressed pubkey (x,y) bytes
    let valid_signature =
        std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, hashed_message);

    assert(valid_signature);

    assert(nonce != 0u64);
    assert(block_number > 0u64);
    assert(chain_id > 0u64);
    assert(balance >= threshold);

    // keep secret "used" for now; will become a nullifier input next lesson
    assert(secret == secret);
}
