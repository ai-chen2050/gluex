import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const solToLamports = (value: number) =>
  Math.round((value || 0) * LAMPORTS_PER_SOL);

export const lamportsToSol = (lamports: number) =>
  (lamports || 0) / LAMPORTS_PER_SOL;

export const toUnixSeconds = (value: string | number) => {
  if (typeof value === 'number') {
    return Math.floor(value);
  }

  if (!value) {
    return 0;
  }

  const ts = Date.parse(value);
  return Number.isNaN(ts) ? 0 : Math.floor(ts / 1000);
};

const textDecoder = new TextDecoder();

export const decodeFixedString = (bytes: number[] = []) => {
  if (!bytes.length) return '';
  const view = new Uint8Array(bytes);
  let end = view.length;
  for (let i = 0; i < view.length; i += 1) {
    if (view[i] === 0) {
      end = i;
      break;
    }
  }
  return textDecoder.decode(view.slice(0, end));
};

