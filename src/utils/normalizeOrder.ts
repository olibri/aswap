/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/normalizeOrder.ts
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

/*  BN  -------------------------------------------------------------------- */
const BN_KEYS = [
  'fillNonce',
  'filledAmount',
  'remaining',
  'amount',
  'price',
  'dealId',
] as const;

/*  PublicKey  ------------------------------------------------------------- */
const PK_KEYS = [
  'escrowPda',
  'vault',
  'sellerCrypto',
  'buyerCrypto',
  'tokenMint',
] as const;

export function normalizeOrder<T extends Record<string, any>>(raw: T): T {
  const out: Record<string, any> = { ...raw };

  /* числа / великі рядки → BN */
  BN_KEYS.forEach((k) => {
    const v = out[k as string];
    if (v == null) return;
    if (typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v))) {
      out[k as string] = new BN(v);
    }
  });

  /* base58-рядки → PublicKey */
  PK_KEYS.forEach((k) => {
    const v = out[k as string];
    if (typeof v === 'string' && v.length >= 43) {
      try { out[k as string] = new PublicKey(v); } catch {/* ignore */ }
    }
  });

  return out as T;
}
