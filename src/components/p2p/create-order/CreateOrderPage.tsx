import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './create-order.css'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { useEscrowProgram } from '../../../hook/useEscrowProgram'
import { pdaEscrowOffer, pdaVaultAuthority, USDC_MINT } from '../../../solana/constants'
import { BN } from '@coral-xyz/anchor'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { SystemProgram, Transaction } from '@solana/web3.js'


const orderTypes = [
  { name: 'Buy', value: 'buy' },
  { name: 'Sell', value: 'sell' },
] as const

type OrderType = typeof orderTypes[number]['value']

const currencies = [
    { name: 'USDC', value: 'usdc' },
    { name: 'SOL', value: 'sol' },
    // { name: 'BTC', value: 'btc' },
  ] as const
  
type Currency = typeof currencies[number]['value']
  

const CreateOrderPage: React.FC = () => {
  const [type, setType] = useState<OrderType>('buy')
  const [amount, setAmount] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [currency, setCurrency] = useState<Currency>('usdc')

  
  const navigate = useNavigate()
  
  const program = useEscrowProgram();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!program) {
        alert('Program is not ready (wallet не підʼєднаний?)');
        return;
    }

    
    const amountNumber = Number(amount)
    const priceNumber = Number(price)
  
    if (
      isNaN(amountNumber) ||
      isNaN(priceNumber) ||
      amountNumber <= 0 ||
      priceNumber <= 0
    ) {
      alert('Amount and Price must be valid positive numbers')
      return
    }
  
    const wallet = program.provider.publicKey!;
    const dealId = Date.now(); 
    const dealIdBn = new BN(dealId);
    const amountBn = new BN(amountNumber * 1_000_000);

    const [escrowPda] = pdaEscrowOffer(wallet, dealIdBn);
    const [vaultAuthPda] = pdaVaultAuthority(escrowPda);

    const sellerTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        wallet
      );

    const vaultTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        vaultAuthPda,
        true 
      );
    
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
            USDC_MINT
          )
        );
      }

    const ix = await program.methods
      .initializeOffer(amountBn, dealIdBn)
      .accounts({
        escrowAccount: escrowPda,
        sellerTokenAccount,
        vaultAccount: vaultTokenAccount,
        seller: wallet,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  
    tx.add(ix);

    if (!program) {
        alert('Program не готовий');
        return;
      }
    const sig = await program.provider.sendAndConfirm!(tx, []);
    console.log('🎉  initialize_offer tx', sig);
    
    console.log({ type, amount: amountNumber, price: priceNumber, currency })
    navigate('/')
  }
  
  return (
    <div className="create-order-page">
      <h2 className="primary">📝 Create Order</h2>
      <form onSubmit={handleSubmit} className="order-form">

        <div className="form-group">
            <span className="label-text">Type:</span>
            <Listbox value={type} onChange={setType}>
            <div className="custom-select-wrapper">
                <ListboxButton className="dropdown-button">
                {orderTypes.find(o => o.value === type)?.name}
                <svg className="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
                </svg>
                </ListboxButton>

                <ListboxOptions className="dropdown-options">
                {orderTypes.map((opt) => (
                    <ListboxOption
                    key={opt.value}
                    value={opt.value}
                    className={({ active }) =>
                        `dropdown-option ${active ? 'active' : ''}`
                    }
                    >
                    {opt.name}
                    </ListboxOption>
                ))}
                </ListboxOptions>
            </div>
          </Listbox>
        </div>

        <div className="form-group">
            <span className="label-text">Currency:</span>
            <Listbox value={currency} onChange={setCurrency}>
                <div className="custom-select-wrapper">
                <ListboxButton className="dropdown-button">
                    {currencies.find(c => c.value === currency)?.name}
                    <svg className="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
                    </svg>
                </ListboxButton>

                <ListboxOptions className="dropdown-options">
                    {currencies.map((opt) => (
                    <ListboxOption
                        key={opt.value}
                        value={opt.value}
                        className={({ active }) =>
                        `dropdown-option ${active ? 'active' : ''}`
                        }
                    >
                        {opt.name}
                    </ListboxOption>
                    ))}
                </ListboxOptions>
                </div>
            </Listbox>
        </div>     


        <label>
            Amount ({currency.toUpperCase()}):
            <input
                type="text"
                value={amount}
                onChange={(e) => {
                const val = e.target.value
                if (/^\d*\.?\d*$/.test(val)) {
                    setAmount(val)
                }
                }}
                inputMode="decimal"
                placeholder="0.00"
            />
        </label>

        <label>
            Price:
            <input
                type="text"
                value={price}
                onChange={(e) => {
                const val = e.target.value
                if (/^\d*\.?\d*$/.test(val)) {
                    setPrice(val)
                }
                }}
                inputMode="decimal"
                placeholder="0.00"

            />
        </label>

        <button type="submit" className="submit-order-btn">
          Create
        </button>
      </form>
    </div>
  )
}

export default CreateOrderPage
