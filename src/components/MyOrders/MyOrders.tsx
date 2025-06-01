import React from 'react';
import { Button, CircularProgress, Paper, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useUnsignedOrders } from '../../hook/useUnsignedOrders';
import { useEscrowActions } from '../../lib/escrowActions';

const MyOrders: React.FC = () => {
  const { loading, orders } = useUnsignedOrders();
  const { buyerSign, sellerSign } = useEscrowActions();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (loading) return <CircularProgress />;

  if (!orders.length)
    return <Typography variant="h6">У вас немає ордерів, які потребують підпису.</Typography>;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {orders.map((o) => {
        const iAmBuyer  = o.buyerSigned === false &&o.sellerSigned === false;  
        const actionLbl = iAmBuyer ? 'Sign (Paid)' : 'Release funds';
        const onClick   = iAmBuyer ? () => buyerSign(o) : () => sellerSign(o);

        return (
          <Paper
            key={o.escrowPda}
            sx={{
              p: 3,
              display:'flex',
              flexDirection:{xs:'column',md:'row'},
              justifyContent:'space-between',
              alignItems:'center',
              bgcolor: isDark ? '#181818' : '#fafafa',
              borderRadius:3
            }}
          >
            <Box>
              <Typography variant="h6">
                Deal&nbsp;#{String(o.dealId).slice(-6)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {iAmBuyer ? 'You are buyer' : 'You are seller'}
              </Typography>
            </Box>

            <Button
              variant="contained"
              sx={{
                mt:{xs:2,md:0},
                bgcolor:'#F3EF52',
                color:'#27292F',
                '&:hover':{bgcolor:'#e0dc48'}
              }}
              onClick={onClick}
            >
              {actionLbl}
            </Button>
          </Paper>
        );
      })}
    </Box>
  );
};

export default MyOrders;
