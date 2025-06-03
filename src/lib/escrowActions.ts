// src/lib/escrowActions.ts
import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import {useEscrowProgram} from '../hook/useEscrowProgram';
import { EscrowOrderDto } from '../types/offers';
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Buffer } from 'buffer';
import { pdaEscrowOffer } from '../solana/constants';   
import { BN } from '@coral-xyz/anchor';

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
      buyerSign:   async () => Promise.resolve(),
      sellerSign:  async () => Promise.resolve(),
    };

    
  /**
   * Claim the *whole* remaining amount in an offer.
   * Only needs the deal-id and seller publicKey we already carry in `EscrowOrderDto`.
   */
  async function claimWhole(order: EscrowOrderDto) {
    const dealId = dealIdToBn(order.dealId);
    const seller = new PublicKey(order.sellerCrypto);
    const escrow = pdaEscrowOffer(seller, dealId)[0];

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

async function ensureAta(
  mint: PublicKey,
  owner: PublicKey,
  connection: Connection,
  payer: PublicKey,
): Promise<PublicKey> {
  const ata = await getAssociatedTokenAddress(mint, owner, false, TOKEN_PROGRAM_ID);
  const info = await connection.getAccountInfo(ata);
  if (info) return ata;                       // вже існує

  const ix = createAssociatedTokenAccountInstruction(
    payer,          // fee payer + initialiser
    ata,            // ata to create
    owner,          // owner
    mint,
    TOKEN_PROGRAM_ID,
  );
  const tx = new Transaction().add(ix);
  if (program?.provider?.sendAndConfirm) {
    await program.provider.sendAndConfirm(tx, []);   // wallet-adapter підпише
  } else {
    throw new Error('sendAndConfirm is not available on provider');
  }
  return ata;
}
  
async function buyerSign(order: EscrowOrderDto, onTx?: (sig: string)=>void) {
  if (!order.dealId) throw new Error('dealId missing');
  if (!order.escrowPda) throw new Error('escrowPda missing');

  /* ────────────────────────────────────────────────
     ▸ якщо в DTO вже є всі ключі — просто беремо їх
     ▸ якщо чогось бракує — fetch + обчислити
  ────────────────────────────────────────────────── */
  let { vault, vaultAuth, buyerAta } = order;

  if (!vault || !vaultAuth || !buyerAta) {
    // 1️⃣ тягнемо свіжий акаунт
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const acc = await (program!.account as any).escrowAccount.fetch(
      order.escrowPda,
    );

    buyerAta = (
      await ensureAta(
        acc.tokenMint,
        acc.buyer,                               // = ваш publicKey
        program!.provider.connection,
        publicKey!,                              // payer
      )
    ).toBase58();
    //   vaultAccount у структурі точно є
    vault = acc.vaultAccount.toBase58();

    // 2️⃣ vaultAuthority PDA
    const isPartial = !acc.parentOffer.equals(PublicKey.default);
    const vAuth = PublicKey.findProgramAddressSync(
      [
        Buffer.from('vault_authority'),
        (isPartial ? acc.parentOffer : new PublicKey(order.escrowPda)).toBuffer(),
      ],
      program!.programId,
    )[0];
    vaultAuth = vAuth.toBase58();

    // 3️⃣ buyer ATA (якщо buyer == Pubkey::default(), це помилка логіки)
    const ataPk = await getAssociatedTokenAddress(
      acc.tokenMint,
      acc.buyer,
      false,
      TOKEN_PROGRAM_ID,
    );
    buyerAta = ataPk.toBase58();

    // кешуємо назад, щоб не рахувати вдруге
    Object.assign(order, { vault, vaultAuth, buyerAta });
  }

  /* ───── далі як було ───── */
  const dealIdBn = new anchor.BN(order.dealId.toString());
  if (order.isPartial && order.fillNonce != null) {
    await program!.methods
      .buyerSignPartial(dealIdBn, order.fillNonce)
      .accounts({
        escrowAccount:     new PublicKey(order.fillPda!),
        vaultAccount:      new PublicKey(vault),
        vaultAuthority:    new PublicKey(vaultAuth),
        buyerTokenAccount: new PublicKey(buyerAta),
        buyer:             publicKey!,
        tokenProgram:      TOKEN_PROGRAM_ID,
      })
      .rpc();
  } else {
      const escrowOffer = pdaEscrowOffer(
        new PublicKey(order.sellerCrypto),
        dealIdBn,
      )[0];
    const sig = await program!.methods
      .buyerSignOffer(dealIdBn)
      .accounts({
        escrowAccount:     escrowOffer,
        vaultAccount:      new PublicKey(vault),
        vaultAuthority:    new PublicKey(vaultAuth),
        buyerTokenAccount: new PublicKey(buyerAta),
        buyer:             publicKey!,
        tokenProgram:      TOKEN_PROGRAM_ID,
      })
      .rpc();
      console.log('✅ buyerSigned tx:', sig);
      if (onTx) onTx(sig);

  }
  
}

  async function sellerSign(order: EscrowOrderDto) {
      console.log(
        'sellerSign →',
        'typeof dealId =', typeof order.dealId,
        'value =', order.dealId
      );
    
    const dealId = new BN(order.dealId);
    console.log('--->', dealId);

    if (!order.vault || !order.vaultAuth || !order.buyerAta) {
        const escrowPk = pdaEscrowOffer(
          new PublicKey(order.sellerCrypto),
          dealId,
        )[0];

        // читаємо акаунт оферу
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const acc: any = await (program!.account as any).escrowAccount.fetch(escrowPk);

        order.vault     = acc.vaultAccount.toBase58();
        order.vaultAuth = PublicKey.findProgramAddressSync(
          [Buffer.from('vault_authority'), escrowPk.toBuffer()],
          program!.programId,
        )[0].toBase58();
        order.buyerAta  = (
          await getAssociatedTokenAddress(
            acc.tokenMint,
            acc.buyer,
            false,
            TOKEN_PROGRAM_ID,
          )
        ).toBase58();
      }


    if (order.isPartial && order.fillNonce != null) {
      console.log('sign partial')
      await program!.methods
        .sellerSignPartial(dealId, order.fillNonce)
        .accounts({
          escrowAccount:    new PublicKey(order.fillPda!),
          vaultAccount:     new PublicKey(order.vault),
          vaultAuthority:   new PublicKey(order.vaultAuth),
          buyerTokenAccount:new PublicKey(order.buyerAta),
          seller:           publicKey!,
          tokenProgram:     TOKEN_PROGRAM_ID,
        })
        .rpc();
    } else {
      console.log('sign full')

      const seller = new PublicKey(order.sellerCrypto);
      const escrow = pdaEscrowOffer(seller, dealId)[0];

      console.log('sellerSignOffer accounts:', {
        escrowAccount:    escrow.toBase58(),
        vaultAccount:     order.vault,
        vaultAuthority:   order.vaultAuth,
        buyerTokenAccount:order.buyerAta,
        seller:           publicKey!.toBase58(),
        tokenProgram:     TOKEN_PROGRAM_ID.toBase58(),
      });

      const sig2 = await program!.methods
        .sellerSignOffer(dealId)
        .accounts({
          escrowAccount:    escrow,
          vaultAccount:     new PublicKey(order.vault),
          vaultAuthority:   new PublicKey(order.vaultAuth),
          buyerTokenAccount:new PublicKey(order.buyerAta),
          seller:           publicKey!,
          tokenProgram:     TOKEN_PROGRAM_ID,
        })
        .rpc();
        console.log('✅ buyerSigned tx:', sig2);
    }
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

  return { claimWhole, claimPartial, cancelClaim, cancelFill, buyerSign, sellerSign};

}
