/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { useOffers } from '../../hooks/useOffers';
import { EscrowOrderDto } from '../../types/offers';
import { useEscrowActions } from '../../lib/escrowActions';
import './p2p.css'; // Assuming you have a CSS file for styles
import { PublicKey } from '@solana/web3.js';

import { pdaFill } from '../../lib/escrowActions'; // Assuming you have a utility for PDA generation
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEscrowProgram } from '../../hook/useEscrowProgram';
import { EscrowStatus } from '../../lib/escrowStatus';
import OrderCard from './swap/OrderCard';
import { logTokenBalance, } from './swap/zz';
import { USDC_MINT } from '../../solana/constants';
import { getAssociatedTokenAddress } from '@solana/spl-token';

function getDecimals(mint: string) {
  return mint === 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' ? 6 : 9; // USDC : SOL
}



const P2PMarket: React.FC = () => {
  const { connection } = useConnection();
  /* ------- data & actions -------- */
  const { offers, loading, error } = useOffers(30000);
  const { claimWhole, claimPartial } = useEscrowActions();
  /* ------- ui state -------- */
  const [filter, setFilter]       = useState<'all' | 'buy' | 'sell'>('all');
  const [modal, setModal] = useState<null | (EscrowOrderDto & { remaining: number })>(null); 
  const [customAmt, setCustomAmt] = useState('');
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const filtered = offers.filter(o =>
    filter === 'all' ? true : filter === 'buy' ? o.offerSide === 1 : o.offerSide === 0,
  );
  const program = useEscrowProgram();

  /* ------- handlers -------- */
  const closeModal = () => { setModal(null); setCustomAmt(''); };

  async function freeNonce(offerPk: PublicKey) {
    for (let n = 0; n < 255; n++) {
      const pda = pdaFill(offerPk, publicKey!, n, program!.programId);
      const info = await connection.getAccountInfo(pda);
      if (!info) return { nonce: n, pda };
    }
    throw new Error('no free nonce');
  }


  const handleWhole = async () => {
    if (!modal) return;
    let updatedModal = modal;
    if (!modal.vault) {
      const acc: any = await (program!.account as any).escrowAccount.fetch(modal.escrowPda);
       updatedModal = { ...modal, vault: acc.vaultAccount.toBase58() };
      setModal(updatedModal);                      
    }
    console.log('[DEBUG] modal.vault =', updatedModal.vault);
    console.log('[DEBUG] modal.remaining =', modal.remaining);

    const buyerAta = await getAssociatedTokenAddress(
        new PublicKey(modal.tokenMint),
        new PublicKey(modal.sellerCrypto)
      );

    const filledQty = modal.remaining ?? modal.amount;    
    await logTokenBalance(connection, modal.vault, 'vault before sign');       // ①
    await logTokenBalance(connection, buyerAta.toBase58(),   'buyer ATA before sign');
      console.log(
        '%c[DEBUG] will transfer:',
        'color:lime',
        filledQty,
        modal.tokenMint === USDC_MINT.toBase58()  ? 'USDC' : 'SOL'
      );

    await claimWhole(modal);
    const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api';

    const backendRes = await fetch(`${API_PREFIX}/platform/update-offers`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: Number(modal.dealId),  // ulong on server
              status: EscrowStatus.Singing,
              filledQuantity: filledQty,
            }),
          });
        if (!backendRes.ok)
          throw new Error(await backendRes.text());
        

  //   await patchOrder({          
  //   orderId: Number(modal.dealId),
  //   status:  EscrowStatus.Singing,
  // });
    closeModal();
    navigate(`/swap/${modal.id}`, { state: { ...modal, filledQty, isPartial: false, escrowPda: modal.escrowPda } });
  };

  const handlePartial = async () => {
    if (!modal) return;

    const amtHuman = Number(customAmt);
    if (isNaN(amtHuman) || amtHuman <= 0 || amtHuman > modal.amount) return;
    const dec      = getDecimals(modal.tokenMint);     
    const amtRaw   = Math.round(amtHuman * 10 ** dec);           
    // const fillPda = pdaFill(new PublicKey(modal.escrowPda), publicKey!, 1, program!.programId);
    const { nonce, pda: fillPda } = await freeNonce(new PublicKey(modal.escrowPda));
    await claimPartial(modal, amtRaw, nonce);

    
    setModal(m => m ? { ...m, fillNonce: nonce, fillPda: fillPda.toBase58(), isPartial: true } : m);
    const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api';

    const backendRes = await fetch(`${API_PREFIX}/platform/update-offers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: Number(modal.dealId.toString()), // ulong on server
          status: EscrowStatus.PartiallyOnChain,
          filledQuantity: amtHuman
        }),
      });
     if (!backendRes.ok)
      throw new Error(await backendRes.text());
    

    closeModal();
    
    navigate(`/swap/${modal.id}`, { 
      state: {
        ...modal,
        isPartial: true,
        filledAmount: amtHuman,
        fillNonce: nonce,
        fillPda: fillPda.toBase58(),
        parentOffer: modal.escrowPda,
      }
    });
  };

  /* ------- render -------- */
  if (loading) return <p className="p2p-market">Loading…</p>;
  if (error)   return <p className="p2p-market">Error: {error}</p>;
  console.log('[P2PMarket] offers =', offers);      
  return (
    <>
      <section className="p2p-market">
        {/* Header */}
        <div className="market-header">
          <h2 className="primary">
            <Scale size={18} style={{ marginRight: 8 }} />
            P2P Market
          </h2>
          <button className="create-order-button" onClick={() => navigate('/create-order')}>
            + Create Order
          </button>
        </div>

        <div className="filter-bar">
          <div className="filter-buttons">
            {(['all', 'buy', 'sell'] as const).map(t => (
              <button
                key={t}
                className={filter === t ? 'active' : ''}
                onClick={() => setFilter(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="filter-selects">
            <select onChange={e => console.log('sort fiat', e.target.value)}>
              <option value="">Sort by Fiat</option>
              <option>USD</option><option>EUR</option><option>UAH</option>
            </select>
            <select onChange={e => console.log('sort amount', e.target.value)}>
              <option value="">Sort by Amount</option>
              <option value="asc">Low → High</option>
              <option value="desc">High → Low</option>
            </select>
          </div>
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <p style={{ padding: 20, textAlign: 'center', color: '#aaa' }}>
            No offers found for this filter.
          </p>
        ) : (
          filtered.map(o => (
            <OrderCard key={o.id} order={o}
            onSwap={(ord, remaining) => setModal({ ...ord, remaining })} />
          ))
        )}
      </section>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Claim Offer #{modal.id}</h3>
            <p className="modal-sub">Available: {modal.remaining} USDC</p>
          {modal.remaining === modal.amount && (
            <button className="modal-btn-full" onClick={handleWhole}>
              Take the whole amount
            </button>
          )}
            <div className="modal-input-row">
              <input
                type="number"
                placeholder="Custom amount"
                value={customAmt}
                onChange={e => setCustomAmt(e.currentTarget.value)}
                className="modal-input"
              />
              <button
                className="modal-btn-claim"
                disabled={!customAmt}
                onClick={handlePartial}
              >
                Claim
              </button>
            </div>

            <button className="modal-cancel" onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default P2PMarket;
