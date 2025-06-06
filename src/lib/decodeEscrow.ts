// lib/decodeEscrow.ts
import { EscrowAccount } from '../types/escrow-account';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const decodeEscrow = (acc: any): EscrowAccount => ({
  ...acc,
  fiatCode: new Uint8Array(acc.fiatCode),
});
