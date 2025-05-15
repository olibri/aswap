import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './create-order.css'
import { useEscrowProgram } from '../../../hook/useEscrowProgram'
import { pdaEscrowOffer, pdaVaultAuthority } from '../../../solana/constants'
import { BN } from '@coral-xyz/anchor'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'



const TOKENS = [
  {
    name: 'USDC',
    value: 'usdc',
    mint: new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'),
    decimals: 6,
  },
  {
    name: 'SOL',
    value: 'sol',
    mint: new PublicKey('So11111111111111111111111111111111111111112'),
    decimals: 9,
  },
] as const;
  

const FIAT = [
  { name: 'USD', value: 'USD' },
  { name: 'EUR', value: 'EUR' },
  { name: 'UAH', value: 'UAH' },
] as const;

type TokenValue = typeof TOKENS[number]['value'];
type FiatValue = typeof FIAT[number]['value'];
type OrderType = 'buy' | 'sell';


const CreateOrderPage: React.FC = () => {

  const [type, setType] = useState<OrderType>('buy');
  const [token, setToken] = useState<TokenValue>('usdc');
  const [fiat, setFiat]   = useState<FiatValue>('USD');
  const [amount, setAmount] = useState('');
  const [price,  setPrice]  = useState('');

  
  const navigate = useNavigate()
  const program = useEscrowProgram();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!program) {
        alert('Program is not ready');
        return;
    }

    const tok = TOKENS.find(t => t.value === token)!;
    const fiatCode = fiat;
    const amountF = parseFloat(amount);
    const priceF  = parseFloat(price);

    if (!amountF || !priceF || amountF <= 0 || priceF <= 0) {
      return alert('Amount та Price мають бути додатними числами');
    }
  
    const amountBn = new BN(Math.round(amountF * 10 ** tok.decimals));
    const priceBn  = new BN(Math.round(priceF  * 100));
    const offerType = type === 'sell' ? { sell: {} } : { buy: {} };

    const wallet = program.provider.publicKey!;
    const dealIdBn = new BN(Date.now());

    const [escrowPda] = pdaEscrowOffer(wallet, dealIdBn);
    const [vaultAuthPda] = pdaVaultAuthority(escrowPda);

    const sellerTokenAccount = await getAssociatedTokenAddress(tok.mint, wallet);
    const vaultTokenAccount  = await getAssociatedTokenAddress(tok.mint, vaultAuthPda, true);

    const tx = new Transaction();
    const vaultInfo = await program.provider.connection.getAccountInfo(
        vaultTokenAccount
    );

    if (!vaultInfo) {
      tx.add(
              createAssociatedTokenAccountInstruction(
                wallet,
                vaultTokenAccount,
                vaultAuthPda,
                tok.mint
              )
            );
      }

      console.log('type:', type);
      console.log('offerType:', offerType);
      const ix = await program.methods
      .initializeOffer(amountBn, tok.mint, fiatCode, priceBn, dealIdBn, offerType)
      .accounts({
        escrowAccount: escrowPda,
        sellerTokenAccount,
        vaultAccount:   vaultTokenAccount,
        seller:         wallet,
        tokenProgram:   TOKEN_PROGRAM_ID,
        systemProgram:  SystemProgram.programId,
      })
      .instruction();

    tx.add(ix);
    const sig = await program.provider.sendAndConfirm!(tx, [], {skipPreflight: true});
    console.log('🎉 initialize_offer tx:', sig);

    navigate('/');
  }
  
  return (
    <div className="create-order-page">
      <h2 className="primary">📝 Create Order</h2>
      <form onSubmit={handleSubmit} className="order-form">

        {/* Type (buy/sell) */}
        <Dropdown
          label="Type"
          value={type}
          options={[{ name: 'Buy', value: 'buy' }, { name: 'Sell', value: 'sell' }]}
          onChange={setType}
        />

        {/* Token */}
        <Dropdown
          label="Token"
          value={token}
          options={TOKENS.map(t => ({ name: t.name, value: t.value }))}
          onChange={setToken}
        />

        {/* Fiat */}
        <Dropdown
          label="Fiat"
          value={fiat}
          options={FIAT.map(f => ({ name: f.name, value: f.value }))}
          onChange={setFiat}
        />

        <label>
          Amount ({TOKENS.find(t => t.value === token)?.name}):
          <input
            type="text"
            value={amount}
            onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setAmount(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </label>

        <label>
          Price ({fiat}):
          <input
            type="text"
            value={price}
            onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setPrice(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </label>

        <button type="submit" className="submit-order-btn">
          Create
        </button>
      </form>
    </div>
  );
}

interface DDProps<T extends string> {
  label: string;
  value: T;
  options: { name: string; value: T }[];
  onChange: (v: T) => void;
}

function Dropdown<T extends string>({ label, value, options, onChange }: DDProps<T>) {
  return (
    <div className="form-group">
      <span className="label-text">{label}:</span>
      <Listbox value={value} onChange={onChange}>
        <div className="custom-select-wrapper">
          <ListboxButton className="dropdown-button">
            {options.find(o => o.value === value)?.name}
            <svg className="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path fill="currentColor" d="M7 10l5 5 5-5H7z"/></svg>
          </ListboxButton>
          <ListboxOptions className="dropdown-options">
            {options.map(o => (
              <ListboxOption
                key={o.value}
                value={o.value}
                className={({ active }) => `dropdown-option ${active ? 'active' : ''}`}
              >
                {o.name}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
}
export default CreateOrderPage
