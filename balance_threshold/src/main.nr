fn main(balance: u128, threshold: pub u128, nonce: pub u64) {
    assert(nonce != 0u64);
    assert(balance >= threshold);
}

#[test]
fn test_balance_ok() {
    // balance = 2 ETH in wei
    let balance = 2_000_000_000_000_000_000u128;
    // threshold = 1 ETH in wei
    let threshold = 1_000_000_000_000_000_000u128;
    let nonce = 12345u64;

    main(balance, threshold, nonce);
}

#[test(should_fail)]
fn test_balance_fail() {
    // balance = 0.5 ETH in wei
    let balance = 500_000_000_000_000_000u128;
    let threshold = 1_000_000_000_000_000_000u128;
    let nonce = 12345u64;

    main(balance, threshold, nonce);
}
