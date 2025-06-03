import React from 'react';
import { Button, CircularProgress, Paper, Typography, Box } from '@mui/material';
import { useUnsignedOrders } from '../../hook/useUnsignedOrders';
import { useEscrowActions } from '../../lib/escrowActions';
import { BN } from '@coral-xyz/anchor';

const MyOrders: React.FC = () => {
  const { loading, orders, forceRefresh } = useUnsignedOrders();
  const { sellerSign } = useEscrowActions();   // ← у вас уже є
  
  if (loading) return <CircularProgress />;
  if (!orders.length) return <Typography>Ордерів, де потрібен ваш підпис, немає.</Typography>;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {orders.map(o => (
        <Paper key={o.escrowPda.toBase58()} sx={{ p:3, display:'flex', justifyContent:'space-between' }}>
          <Box>
            <Typography variant="h6">
              Deal&nbsp;#
              {
                ((o.dealId ?? o.deal_id) as BN).toString() 
              }
            </Typography>
            <Typography variant="body2">
              You seller 
            </Typography>
          </Box>
          <Button variant="contained" onClick={async () => {
            try { await sellerSign(o); await forceRefresh(); }
            catch(e){ console.error(e); }
          }}>
            Release funds
          </Button>
        </Paper>
      ))}
    </Box>
  );
};


export default MyOrders;
