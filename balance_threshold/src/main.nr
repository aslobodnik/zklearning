// src/main.nr
fn main(balance: u128, threshold: pub u128, nonce: pub u64, block_number: pub u64) {
    assert(nonce != 0u64);
    assert(balance >= threshold);
    assert(block_number > 0u64); // sanity check
}

#[test]
fn test_balance_ok() {
    let balance = 2_000_000_000_000_000_000u128; // 2 ETH
    let threshold = 1_000_000_000_000_000_000u128; // 1 ETH
    let nonce = 12345u64;
    let block_number = 1000000u64;

    main(balance, threshold, nonce, block_number);
}

#[test(should_fail)]
fn test_balance_fail() {
    let balance = 500_000_000_000_000_000u128; // 0.5 ETH
    let threshold = 1_000_000_000_000_000_000u128; // 1 ETH
    let nonce = 12345u64;
    let block_number = 1000000u64;

    main(balance, threshold, nonce, block_number);
}
