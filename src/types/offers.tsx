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
  }
  