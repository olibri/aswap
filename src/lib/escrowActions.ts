// src/lib/escrowActions.ts
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import {useEscrowProgram} from '../hook/useEscrowProgram';
import { EscrowOrderDto } from '../types/offers';

function pdaOffer(seller: PublicKey, dealId: anchor.BN, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow_offer'), seller.toBuffer(), dealId.toArrayLike(Buffer, 'le', 8)],
    programId,
  )[0];
}

export function pdaFill(offer: PublicKey, buyer: PublicKey, nonce: number, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), offer.toBuffer(), buyer.toBuffer(), Buffer.from([nonce])],
    programId,
  )[0];
}

function dealIdToBn(id: number | string) {
  return new anchor.BN(id); 
}
export function useEscrowActions() {
    
  const program = useEscrowProgram();
  const { publicKey } = useWallet();

  /* guard-rail: return inert fns while wallet / program not ready */
  if (!program || !publicKey)
    return {
      claimWhole:  async () => Promise.resolve(),
      claimPartial:async () => Promise.resolve(),
      cancelClaim: async () => Promise.resolve(),
      cancelFill:  async () => Promise.resolve(),
    };

  /**
   * Claim the *whole* remaining amount in an offer.
   * Only needs the deal-id and seller publicKey we already carry in `EscrowOrderDto`.
   */
  async function claimWhole(order: EscrowOrderDto) {
    const dealId = dealIdToBn(order.dealId);
    const seller = new PublicKey(order.sellerCrypto);
    const escrow = pdaOffer(seller, dealId, program!.programId);

    const sig = await program!.methods
      .claimOffer(dealId)                           // instruction arg
      .accounts({
        escrowAccount: escrow,
        buyer:         publicKey!,
      })
      .rpc();

        await program!.provider.connection.confirmTransaction(
          sig,
          'finalized'
        );
  }

  /**
   * Claim *part* of an offer (partial fill).
   *
   * Front-end still needs:
   *   • how much (raw units)
   *   • a nonce (1,2,3…) unique *per* buyer & offer
   *
   * Everything else can be derived or fetched.
   */
  async function claimPartial(
    order: EscrowOrderDto,
    amountRaw: number,
    nonce: number,
  ) {
    const amount  = new anchor.BN(amountRaw);          // u64 on chain
    const dealId  = dealIdToBn(order.dealId);
    const seller  = new PublicKey(order.sellerCrypto);
    const offerPd = pdaOffer(seller, dealId, program!.programId);

    /* — fetch the offer account once to get its vault_account — */
    // tip: cache this in your OfferDto in the BE, but this works too
    // ⬇ саме так бачить TS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const offerAcc = await (program!.account as any).escrowAccount.fetch(
    offerPd
    ) as { vaultAccount: PublicKey };
    const vaultAcc = offerAcc.vaultAccount;

    const fillPd  = pdaFill(offerPd, publicKey!, nonce, program!.programId);

    const sig  = await program!.methods
      .claimPartial(amount, dealId, nonce)
      .accounts({
        offer:         offerPd,
        escrowAccount: fillPd,
        vaultAccount:  vaultAcc,
        buyer:         publicKey!,
        tokenProgram:  anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await program!.provider.connection.confirmTransaction(
      sig,
      'finalized'
    );
  }

  async function cancelClaim(order: EscrowOrderDto) {
    if (!program || !publicKey) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const acc = await (program!.account as any).escrowAccount.fetch(
        new PublicKey(order.escrowPda)
      );

      console.log('⛓  on-chain EscrowAccount:', {
        buyerPda:      acc.buyer.toBase58(),
        buyerFrontend: publicKey.toBase58(),
        buyerSigned:   acc.buyerSigned,
        isCanceled:    acc.isCanceled,
      });

    const dealId  = new anchor.BN(order.dealId);              // ← u64 з DTO
    const seller  = new PublicKey(order.sellerCrypto);        // хто відкрив offer
    const escrowPda = pdaOffer(seller, dealId, program.programId);

    await program.methods
      .cancelClaim(dealId)                                    // instruction arg
      .accounts({
        escrowAccount: escrowPda,
        buyer: publicKey,                                     // підписант
      })
      .rpc();
  }

  async function cancelFill(order: EscrowOrderDto) {
    if (!program || !publicKey) return;

    
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const acc = await (program!.account as any).escrowAccount.fetch(
        new PublicKey(order.escrowPda)
      );

      console.log('⛓  on-chain EscrowAccount:', {
        buyerPda:      acc.buyer.toBase58(),
        buyerFrontend: publicKey.toBase58(),
        buyerSigned:   acc.buyerSigned,
        isCanceled:    acc.isCanceled,
      });

    if (!order.parentOffer || !order.fillPda || order.fillNonce == null)
      throw new Error('not a partial fill');

    await program.methods
      .buyerCancelFill(new anchor.BN(order.dealId), order.fillNonce)
      .accounts({
        escrowAccount: new PublicKey(order.fillPda),
        parentOffer:   new PublicKey(order.parentOffer),
        buyer:         publicKey,
      })
      .rpc();
  }

  return { claimWhole, claimPartial, cancelClaim, cancelFill};

}
