import React from 'react';
import { Button, CircularProgress, Paper, Typography, Box } from '@mui/material';
import { useUnsignedOrders } from '../../hook/useUnsignedOrders';
import { useEscrowActions } from '../../lib/escrowActions';

const MyOrders: React.FC = () => {
  const { loading, orders, forceRefresh } = useUnsignedOrders();
  const { sellerSign } = useEscrowActions();   // ← у вас уже є
  const [busy, setBusy] = React.useState<string>();

  if (loading) return <CircularProgress />;
  if (!orders.length) return <Typography>Ордерів, де потрібен ваш підпис, немає.</Typography>;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {orders.map(o => (
        <Paper key={o.escrowPda.toBase58()} sx={{ p:3, display:'flex', justifyContent:'space-between' }}>
          <Box>
            <Typography>
              Deal # {o.dealId}
            </Typography>

            <Typography variant="body2">
              You seller 
            </Typography>
          </Box>
          <Button
              disabled={busy === o.escrowPda.toBase58()}
              onClick={async () => {
                // 👉 лог перед будь-якими асинхронними операціями
                console.log(
                  'Release funds →',
                  'dealId:',   o.dealId,
                  'escrowPda:', o.escrowPda.toBase58()
                );

                try {
                  setBusy(o.escrowPda.toBase58());
                  await sellerSign(o);
                  await forceRefresh();
                } catch (e) {
                  console.error(e);
                  alert((e as Error).message);
                } finally {
                  setBusy(undefined);
                }
              }}
            >
              {busy === o.escrowPda.toBase58() ? (
                <CircularProgress size={20} />
              ) : (
                'Release funds'
              )}
            </Button>

        </Paper>
      ))}
    </Box>
  );
};


export default MyOrders;
