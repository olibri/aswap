import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Step,
  StepButton,
  Stepper,
  TextField,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { useEscrowProgram } from '../../../hook/useEscrowProgram';
import { pdaVaultAuthority, pdaEscrowOffer } from '../../../solana/constants';
import { BN } from '@coral-xyz/anchor';
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { PublicKey, SystemProgram, Transaction, TransactionSignature } from '@solana/web3.js';
import Loader from '../../../loader/Loader';

// Palette colors
const accentColor = '#F3EF52';
const darkText = '#27292F';
const bgPrimary = '#1f1f23';
const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api';
// Theme including dark mode
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: accentColor, contrastText: darkText },
    background: { default: bgPrimary, paper: bgPrimary },
    text: { primary: '#fff', secondary: '#aaa' },
  },
});

const TOKENS = [
  { name: 'USDC', value: 'usdc', mint: new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'), decimals: 6 },
  { name: 'SOL',  value: 'sol',  mint: new PublicKey('So11111111111111111111111111111111111111112'), decimals: 9 },
] as const;
const FIAT = [ { name: 'USD', value: 'USD' }, { name: 'EUR', value: 'EUR' }, { name: 'UAH', value: 'UAH' } ] as const;

type OrderType = 'buy' | 'sell';
const steps = ['Type', 'Asset to Exchange', 'Asset to Receive', 'Details'];
enum StepIndex { TYPE, ASSET_TO_EXCHANGE, ASSET_TO_RECEIVE, DETAILS }

const CreateOrderPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState<StepIndex>(StepIndex.TYPE);
  const [type, setType] = useState<OrderType>('buy');
  const [token, setToken] = useState<typeof TOKENS[number]['value']>(TOKENS[0].value);
  const [fiat, setFiat] = useState<typeof FIAT[number]['value']>(FIAT[0].value);

  // Common
  const [amount, setAmount] = useState('');       // crypto amount for buy or sell
  const [price, setPrice] = useState('');         // price per token in fiat

  // Ranges
  const [minFiat, setMinFiat] = useState('');     // user's accepted fiat range: min
  const [maxFiat, setMaxFiat] = useState('');     // user's accepted fiat range: max

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const program = useEscrowProgram();

  const handleStep = (step: StepIndex) => () => setActiveStep(step);
  const handleNext = () => setActiveStep(prev => (prev + 1) as StepIndex);
  const handleBack = () => setActiveStep(prev => (prev - 1) as StepIndex);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!program) {
      alert('Program not ready');
      setIsSubmitting(false);
      return;
    }
    try {
      const tok = TOKENS.find(t => t.value === token)!;
      const amountF = parseFloat(amount);
      const priceF = parseFloat(price);
      const minF    = parseFloat(minFiat);
      const maxF    = parseFloat(maxFiat);

      // Validate common fields
      if (!amountF || amountF <= 0) {
        alert('Enter a valid crypto amount');
        setIsSubmitting(false);
        return;
      }
      if (!priceF || priceF <= 0) {
        alert('Enter a valid price');
        setIsSubmitting(false);
        return;
      }
      // Validate range
      if (!minF || !maxF || minF <= 0 || maxF <= 0 || minF >= maxF) {
        alert('Specify a valid fiat range (min < max)');
        setIsSubmitting(false);
        return;
      }
      console.log(`Fiat range: ${minF} - ${maxF}`);

      // On-chain uses exact amount and price
      const amountBn = new BN(Math.round(amountF * 10 ** tok.decimals));
      const priceBn  = new BN(Math.round(priceF * 100));
      const wallet = program.provider.publicKey!;
      const dealIdBn = new BN(Date.now());

      const [escrowPda] = pdaEscrowOffer(wallet, dealIdBn);
      const [vaultAuthPda]  = pdaVaultAuthority(escrowPda);
      const sellerTokenAcc  = await getAssociatedTokenAddress(tok.mint, wallet);
      const vaultTokenAcc   = await getAssociatedTokenAddress(tok.mint, vaultAuthPda, true);

      const tx = new Transaction();
      const vaultInfo = await program.provider.connection.getAccountInfo(vaultTokenAcc);
      if (!vaultInfo) tx.add(createAssociatedTokenAccountInstruction(wallet, vaultTokenAcc, vaultAuthPda, tok.mint));
      const OFFER_TYPE =
              type === 'sell' ? { sell: {} } : { buy: {} };
      const ix = await program.methods
        .initializeOffer(
          amountBn,
          tok.mint,
          fiat,
          priceBn,
          dealIdBn,
          OFFER_TYPE,
        )
        .accounts({
          escrowAccount:      escrowPda,           // ТЕПЕР вірний PDA
          sellerTokenAccount: sellerTokenAcc,
          vaultAccount:       vaultTokenAcc,
          seller:             wallet,
          tokenProgram:       TOKEN_PROGRAM_ID,
          systemProgram:      SystemProgram.programId,
        }).instruction()
      tx.add(ix);
      
      const POLLING_INTERVAL_MS = 1000;
      const MAX_POLLING_ATTEMPTS = 20;
      
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      const sig: TransactionSignature = await program.provider.sendAndConfirm!(tx, [], { skipPreflight: true });
      await program.provider.connection.confirmTransaction(
          {
              signature: sig,
              blockhash: (await program.provider.connection.getLatestBlockhash('finalized')).blockhash,
              lastValidBlockHeight: (await program.provider.connection.getLatestBlockhash('finalized')).lastValidBlockHeight,
          },
          'finalized'
      );
      async function checkBackendForOrder(orderId: number) {
        const res = await fetch(`${API_PREFIX}/platform/check-order-status/${orderId}`);
        if (res.status === 404) return false;
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        return data.isConfirmed === orderId; 
      }

      let attempts = 0;
      let backendConfirmed = false;

            
      while (attempts < MAX_POLLING_ATTEMPTS) {
        backendConfirmed = await checkBackendForOrder(Number(dealIdBn.toString()));
        if (backendConfirmed) break;

        attempts++;
        await delay(POLLING_INTERVAL_MS);
      }

      if (!backendConfirmed) {
        throw new Error('Backend did not confirm the transaction in time.');
      }
      const backendRes = await fetch(`${API_PREFIX}/platform/update-offers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: Number(dealIdBn.toString()),  // ulong on server
          minFiatAmount: minF,
          maxFiatAmount: maxF,
        }),
      });
     if (!backendRes.ok)
      throw new Error(await backendRes.text());
    
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step: StepIndex) => {
    switch (step) {
      case StepIndex.TYPE:
        return (
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'text.primary' }}>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e: SelectChangeEvent) => { setType(e.target.value as OrderType); handleNext(); }}
              sx={{ color: 'text.primary' }}
            >
              <MenuItem value="buy">Buy Crypto</MenuItem>
              <MenuItem value="sell">Sell Crypto</MenuItem>
            </Select>
          </FormControl>
        );

      case StepIndex.ASSET_TO_EXCHANGE:
        return (
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'text.primary' }}>
              {type === 'sell' ? 'Token to Sell' : 'Crypto to Buy'}
            </InputLabel>
            <Select
              value={token}
              label={type === 'sell' ? 'Token to Sell' : 'Crypto to Buy'}
              onChange={(e: SelectChangeEvent) => { setToken(e.target.value as typeof token); handleNext(); }}
              sx={{ color: 'text.primary' }}
            >
              {TOKENS.map(o => <MenuItem key={o.value} value={o.value}>{o.name}</MenuItem>)}
            </Select>
          </FormControl>
        );

      case StepIndex.ASSET_TO_RECEIVE:
        return (
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'text.primary' }}>
              {type === 'sell' ? 'Fiat to Receive' : 'Fiat to Spend'}
            </InputLabel>
            <Select
              value={fiat}
              label={type === 'sell' ? 'Fiat to Receive' : 'Fiat to Spend'}
              onChange={(e: SelectChangeEvent) => { setFiat(e.target.value as typeof fiat); handleNext(); }}
              sx={{ color: 'text.primary' }}
            >
              {FIAT.map(o => <MenuItem key={o.value} value={o.value}>{o.name}</MenuItem>)}
            </Select>
          </FormControl>
        );

      case StepIndex.DETAILS:
        return (
          <>
            {/* Common: amount & price */}
            <TextField
              label={`Amount (${TOKENS.find(t => t.value === token)?.name})`}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              fullWidth
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{ style: { color: '#fff' } }}
            />
            <TextField
              label={`Price (${fiat})`}
              value={price}
              onChange={e => setPrice(e.target.value)}
              fullWidth
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{ style: { color: '#fff' } }}
            />
            {/* Range: fiat sum */}
            <TextField
              label={`Min Fiat (${fiat})`}
              value={minFiat}
              onChange={e => setMinFiat(e.target.value)}
              fullWidth
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{ style: { color: '#fff' } }}
            />
            <TextField
              label={`Max Fiat (${fiat})`}
              value={maxFiat}
              onChange={e => setMaxFiat(e.target.value)}
              fullWidth
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{ style: { color: '#fff' } }}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 5, p: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, color: 'text.primary' }}>
        <Stepper nonLinear activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepButton color="primary" onClick={handleStep(index as StepIndex)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>

        <Box component={activeStep === StepIndex.DETAILS ? 'form' : 'div'} onSubmit={activeStep === StepIndex.DETAILS ? handleSubmit : undefined} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {renderStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={handleBack} disabled={activeStep === StepIndex.TYPE || isSubmitting} sx={{ color: '#fff', borderColor: '#444' }}>
              Back
            </Button>
            {activeStep < StepIndex.DETAILS ? (
              <Button variant="contained" onClick={handleNext} disabled={isSubmitting}>
                Next
              </Button>
            ) : (
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Create'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      {isSubmitting && <Loader />}
    </ThemeProvider>
  );
};

export default CreateOrderPage;
