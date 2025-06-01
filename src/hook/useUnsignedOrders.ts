import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useEscrowProgram } from './useEscrowProgram';
import { EscrowOrderDto } from '../types/offers';
import { useWallet } from '@solana/wallet-adapter-react';

export function useUnsignedOrders(trigger = 0) {
  const program       = useEscrowProgram();
  const { publicKey } = useWallet();

  const [orders,  setOrders]  = useState<EscrowOrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program || !publicKey) return;

    (async () => {
      setLoading(true);

      // ⚠️ тут anchor декодує лише ті акаунти, що збігаються
      //   з поточним layout-ом; «леві» ми просто пропускаємо
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const list = await program.account.escrowAccount.all();

      const mine: EscrowOrderDto[] = [];

      for (const { publicKey: pk, account: acc } of list) {
        try {
          /* пропускаємо скасовані / закриті */
          if (acc.isCanceled || acc.sellerCanceled || acc.sellerSigned) continue;

          const iAmBuyer   = acc.buyer.equals(publicKey);
          const needBuyer  = iAmBuyer   && !acc.buyerSigned;
          const needSeller = !iAmBuyer  && acc.buyerSigned && acc.seller.equals(publicKey);

          if (!needBuyer && !needSeller) continue;

          const dto: EscrowOrderDto = {
            id:            pk.toBase58(),
            sellerCrypto:  acc.seller.toBase58(),
            dealId:        acc.dealId.toNumber(),
            amount:        acc.amount.toNumber(),
            price:         acc.price.toNumber(),
            fiatCode:      Buffer.from(acc.fiatCode).toString('utf8').replace(/\0/g, ''),
            status:        'OnChain',
            createdAtUtc:  new Date(acc.startTs * 1_000).toISOString(),
            offerSide:     acc.offerType,               // 0 | 1
            tokenMint:     acc.tokenMint.toBase58(),
            isPartial:     !acc.parentOffer.equals(PublicKey.default),

            /* динамічні поля */
            buyerFiat:     null,
            parentOffer:   acc.parentOffer.toBase58(),
            fillPda:       pk.toBase58(),
            fillNonce:     acc.nonce,
            buyerSigned:   acc.buyerSigned,
            sellerSigned:  acc.sellerSigned,
            escrowPda:     pk.toBase58(),

            /* підрахуємо при кліку */
            vault:         acc.vaultAccount.toBase58(),
            vaultAuth:     '',
            buyerAta:      '',
          };

          mine.push(dto);
        } catch { /* if layout mismatch — ігноруємо */ }
      }

      console.log('ℹ️ unsigned orders (filtered):', mine.length);
      setOrders(mine);
      setLoading(false);
    })();
  }, [program, publicKey, trigger]);

  return { loading, orders };
}