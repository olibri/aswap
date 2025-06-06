import * as anchor from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';

export interface EscrowAccount {
  seller:            anchor.web3.PublicKey;
  buyer:             anchor.web3.PublicKey;
  vaultAccount:      anchor.web3.PublicKey;
  tokenMint:         anchor.web3.PublicKey;
  fiatCode:          Uint8Array;         
  price:             BN;
  amount:            BN;
  buyerSigned:       boolean;
  sellerSigned:      boolean;
  offerType:         number;             
  isCanceled:        boolean;
  sellerCanceled:    boolean;
  totalAmount:       BN;
  remainingAmount:   BN;
  parentOffer:       anchor.web3.PublicKey;
  startTs:           BN;                 
  dealId:            BN;
}
