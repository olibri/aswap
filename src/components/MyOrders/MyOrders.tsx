// import { useBuyerPendingOrders } from '../../hook/useBuyerPendingOrders';
// import { useUnsignedOrders } from '../../hook/useUnsignedOrders';
// import { useEscrowActions } from '../../lib/escrowActions';
// import { Button, Box, Paper, Typography, CircularProgress } from '@mui/material';

// const MyOrders: React.FC = () => {
//   const { loading, orders, forceRefresh } = useUnsignedOrders();
//   const { sellerSign, buyerSign } = useEscrowActions();

//   const { loading: loadB, orders: buyerOrders, refresh } = useBuyerPendingOrders();

//   if (loading || loadB) return <CircularProgress />;

//   return (
//     <Box display="flex" flexDirection="column" gap={6}>
//       <Typography variant="h6">Your sells – awaiting release</Typography>
//       {orders.length === 0 ? (
//         <Typography>Нічого не чекає вашого підпису.</Typography>
//       ) : (
//         orders.map(o => (
//           <Paper key={o.escrowPda.toBase58()} sx={{ p: 3, display: 'flex', justifyContent: 'space-between' }}>
//             <Box>
//               <Typography>Deal #{o.dealId}</Typography>
//               <Typography variant="body2">You seller</Typography>
//             </Box>
//             <Button onClick={async () => { await sellerSign(o); await forceRefresh(); }}>
//               Release funds
//             </Button>
//           </Paper>
//         ))
//       )}

//       <Typography variant="h6" sx={{ mt: 4 }}>Your buys – awaiting payment</Typography>
//       {buyerOrders.length === 0 ? (
//         <Typography>Оплатити нічого.</Typography>
//       ) : (
//         buyerOrders.map(o => (
//           <Paper key={o.escrowPda.toBase58()} sx={{ p: 3, display: 'flex', justifyContent: 'space-between' }}>
//             <Box>
//               <Typography>Deal #{o.dealId}</Typography>
//               <Typography variant="body2">You buyer</Typography>
//             </Box>
//             <Button onClick={async () => { await buyerSign(o); await refresh(); }}>
//               Paid
//             </Button>
//           </Paper>
//         ))
//       )}
//     </Box>
//   );
// };



// export default MyOrders;
