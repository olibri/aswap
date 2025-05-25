// hooks/useOrderMeta.ts
import { useEffect, useState } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { EscrowOrderDto } from '../types/offers';
import { useEscrowProgram } from './useEscrowProgram';

export function useOrderMeta(order: EscrowOrderDto | undefined) {
  const program = useEscrowProgram();
  const [meta, setMeta] = useState<null | {
    isPartial: boolean;
    parentOffer?: string;
    buyerSigned: boolean;
  }>(null);

  useEffect(() => {
    if (!program || !order) return;

    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const acc = await (program!.account as any).escrowAccount.fetch(order.escrowPda);
        const isPartial =
          !acc.parentOffer.equals(anchor.web3.PublicKey.default);
        setMeta({
          isPartial,
          parentOffer: isPartial ? acc.parentOffer.toBase58() : undefined,
          buyerSigned: acc.buyerSigned,
        });
      } catch (e) {
        console.error('fetch meta error', e);
      }
    })();
  }, [program, order]);

  return meta;
}
