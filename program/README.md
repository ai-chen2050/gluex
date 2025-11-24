# Anchor Solana Program

## 1. Local dev env

1. Install Solana toolchain(MacOS)

Run the following command in your terminal:

```sh
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

[Other installation methods](https://docs.solana.com/cli/install-solana-cli-tools)

2. Start a local test validator

```sh
curl -sL https://run.surfpool.run/ | bash
surfpool start 

# Alternatively, you can use the Solana test validator:
solana-test-validator
```

## 2. Build, deploy, test
```shell
anchor build
anchor deploy
```

Copy the **program ID** from the output logs; paste it in `Anchor.toml` & `lib.rs`.

```shell
anchor build
anchor deploy

yarn install
yarn add ts-mocha

anchor run test
```

## 3. Dev env deploy

Solana has three main clusters: `mainnet-beta`, `devnet`, and `testnet`. For developers, `devnet` and `mainnet-beta` are the most interesting. `devnet` is where you test your application in a more realistic environment than `localnet`. `testnet` is mostly for validators.

We are going to deploy on `devnet`.

Here is your deployment checklist.   🚀

1.  Run `anchor build`. Your program keypair is now in `target/deploy`. Keep this keypair secret. You can reuse it on all clusters.
2.  Run `anchor keys list` to display the keypair's public key and copy it into your `declare_id!` macro at the top of `lib.rs`.
3.  Run `anchor build` again. This step is necessary to include the new program id in the binary.
4.  Change the `provider.cluster` variable in `Anchor.toml` to `devnet`.
5.  Run `anchor deploy`
6.  Run `anchor test`