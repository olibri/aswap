import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useEscrowProgram } from '../hook/useEscrowProgram';

export function useEscrowWatcher({
  escrowPk,
  onReleased,
}: {
  escrowPk: string;
  onReleased?: () => void;
}) {
  const { connection } = useConnection();
  const program = useEscrowProgram();
  const [isReleased, setIsReleased] = useState(false);

  useEffect(() => {
    if (!program || !escrowPk) return;

    let subId: number | undefined;
    const pk = new PublicKey(escrowPk);

    const safeParse = (buf: Buffer | null) => {
      if (!buf) return null;
      try {
        return program.coder.accounts.decode('escrowAccount', buf) as {
          buyerSigned: boolean;
          sellerSigned: boolean;
        };
      } catch {
        return null; // дані не ті, або це взагалі не EscrowAccount
      }
    };

    const handle = (buf: Buffer | null) => {
    const acc = safeParse(buf);
    if (acc) {
        console.table({ buyerSigned: acc.buyerSigned, sellerSigned: acc.sellerSigned });
    }
    if (acc && acc.buyerSigned && acc.sellerSigned) {
        setIsReleased(true);
        onReleased?.();
    }
    };

    // первинна спроба — тихо і без крашу
    connection
      .getAccountInfo(pk, 'confirmed')
      .then((info) => handle(info ? info.data : null))
      .catch((e) => console.warn('getAccountInfo error', e.message));

    // live-підписка: заводимо лише якщо акаунт уже існує
    connection
      .getAccountInfo(pk, 'confirmed')
      .then((info) => {
        if (!info) return; // акаунта ще нема — підписка не потрібна
        subId = connection.onAccountChange(
          pk,
          (info) => handle(info.data),
          'confirmed',
        );
      })
      .catch((e) => console.warn('account check error', e.message));

    return () => {
      if (subId !== undefined) connection.removeAccountChangeListener(subId);
    };
  }, [connection, program, escrowPk, onReleased]);

  return { isReleased };
}
