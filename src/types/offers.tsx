export interface EscrowOrderDto {
    id: string;
    seller: string;
    buyer?: string | null;
    amount: number;
    price: number;
    fiatCode: string;
    status: 'PendingOnChain' | 'OnChain' | 'Released' | 'Cancelled';
    createdAtUtc: string;
  }
  