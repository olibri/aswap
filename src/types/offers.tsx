export interface EscrowOrderDto {
    id: string;
    sellerCrypto: string;
    dealId: number;          
    buyerFiat?: string | null;
    amount: number;
    price: number;
    fiatCode: string;
    status: 'PendingOnChain' | 'OnChain' | 'Released' | 'Cancelled';
    createdAtUtc: string;
    offerSide: 0 | 1; 
    tokenMint: string;
    isPartial: boolean;

    parentOffer?: string;  // Pubkey offer-PDA
    fillPda?:    string;   // Pubkey fill-PDA
    fillNonce?:  number;   // u8
    buyerSigned?: boolean; 
    sellerSigned?: boolean; 
    escrowPda: string; // Pubkey escrow-PDA

    vault:      string;
    vaultAuth:  string;
    buyerAta:   string; 
  }
  