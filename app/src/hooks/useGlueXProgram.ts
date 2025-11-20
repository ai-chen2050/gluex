import { AnchorProvider, Idl, Program } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import idl from '../idl/gluex.json';

const PROGRAM_ID = new PublicKey(idl.metadata.address);

export const useGlueXProgram = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  return useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }

    const provider = new AnchorProvider(
      connection,
      wallet as unknown as AnchorProvider['wallet'],
      AnchorProvider.defaultOptions(),
    );

    return new Program(idl as Idl, PROGRAM_ID, provider);
  }, [connection, wallet]);
};

