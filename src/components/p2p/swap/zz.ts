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