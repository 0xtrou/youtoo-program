<p align="center">
  <a style="background: black; display: block; border-radius: 8px; padding: 4px" href="" target="blank"><img src="https://cavies.xyz/assets/images/older-hamster.png" width="320" alt="Nest Logo" /></a>
</p>


## Description

**YouToo** Rust program repository.


## Prerequisites

1/ Follow this instructions to install Solana Cli and Anchor Cli (https://book.anchor-lang.com/getting_started/installation.html)

2/ Install the latest nodejs env

## Getting Started

```bash
$ yarn install
```

## Get new address of program
```bash
anchor build
solana address -k target/deploy/challenge-keypair.json
# above program will output the address of program
# replace all `Cza3vL3BhRPZAbvPhz6sT27UDxP1yhcnSqDM3CpR6Zmq` with your new address
```
## Deploy program onto devnet/mainnet

1/ Deploy devnet 

Deploy

```bash
$  anchor deploy --program-name challenge --provider.cluster devnet --provider.wallet ~/.config/solana/id.json
```

Upgrade

```bash
$ anchor upgrade target/deploy/challenge.so --program-id Cza3vL3BhRPZAbvPhz6sT27UDxP1yhcnSqDM3CpR6Zmq --provider.cluster devnet --provider.wallet ~/.config/solana/id.json
```

2/ Deploy mainnet 

Deploy

```bash
$  anchor deploy --program-name challenge --provider.cluster mainnet-beta --provider.wallet ~/.config/solana/id.json
```

Upgrade

```bash
$ anchor upgrade target/deploy/challenge.so --program-id Cza3vL3BhRPZAbvPhz6sT27UDxP1yhcnSqDM3CpR6Zmq --provider.cluster mainnet-beta --provider.wallet ~/.config/solana/id.json
```



3/ Upgrade

## Test

```bash
$ anchor test
```

```txt
    [initialize_challenge_registry]
    ✔ [initialize_challenge_registry] should: empty state
    ✔ [initialize_challenge_registry] should: deployer should initialize successfully (275ms)
    ✔ [initialize_challenge_registry] should: deployer can update administrators list (464ms)
    ✔ [initialize_challenge_registry] should: non-deployer fail to update registry

  [create_token_vault]
    ✔ [create_token_vault] should: non-administrator fail to create token vault
    ✔ [create_token_vault] should: only administrator can create token vault (448ms)

  [manage_challenge]
    ✔ [create_challenge] should: fail to create a challenge with un-allowed mint account (46ms)
    ✔ [create_challenge] should: anyone can create a challenge publicly (954ms)
    ✔ [cancel_challenge] should: outsider cannot cancel the challenge
    ✔ [cancel_challenge] should: administrator cannot cancel the challenge
    ✔ [cancel_challenge] should: challenge owner can cancel the challenge (441ms)

  [challenge_participation]
    ✔ [join_challenge] should: the accounts were funded properly
    ✔ [join_challenge] should: cannot join the challenge with an amount below min deposit (39ms)
    ✔ [join_challenge] should: anyone can join the challenge with an amount above min deposit (1397ms)
    ✔ [donate_to_pool] should: other people can donate to the prize pool successfully (475ms)
    ✔ [finalize_pool] should: other people than administrators/challenge owner fail to finalize the pool
    ✔ [finalize_pool] should: challenge owner can submit winner list
    ✔ [finalize_pool] should: administrator can submit winner list (423ms)
    ✔ [claim_reward] should: non-winners fail to claim reward
    ✔ [claim_reward] should: winners can claim reward successfully (917ms)

  [cancel_challenge_and_withdraw_reward]
    ✔ [withdraw_reward] should: players withdraw deposited token successfully (1905ms)


  21 passing (31s)
```