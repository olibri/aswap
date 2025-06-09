/* eslint-disable @typescript-eslint/no-explicit-any */
import { BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

export async function logTokenBalance(
  connection: Connection,
  ta: string | undefined,
  label: string,
  decimals = 6,
) {
  if (!ta) {
    console.warn(`[DEBUG] ${label}: token-account key is undefined`);
    return;
  }
  const { value } = await connection.getTokenAccountBalance(new PublicKey(ta));
  console.log(
    `%c[DEBUG] ${label}:`,
    'color:orange',
    Number(value.amount) / 10 ** decimals,
    `(raw ${value.amount})`
  );
}

export function debugOrder(o: Record<string, any>, label = 'order') {
  console.group(`🔍 ${label}`);
  Object.entries(o).forEach(([k, v]) => {
    const type = typeof v;
    const ctor = v?.constructor?.name ?? '';
    const isBn  = v instanceof BN;
    const isPk  = v instanceof PublicKey;
    console.log(
      k.padEnd(16),
      '→',
      type.padEnd(6),
      ctor.padEnd(10),
      isBn ? '[BN]' : isPk ? '[PubKey]' : '',
      v,
    );
  });
  console.groupEnd();
}