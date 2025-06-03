export enum EscrowStatus {
  PendingOnChain,      // 0
  OnChain,             // 1
  PartiallyOnChain,    // 2
  Singing,             // 3
  SignedByOneSide,     // 4
  Released,            // 5
  Cancelled            // 6
}
