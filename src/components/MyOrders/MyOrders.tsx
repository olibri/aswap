import { useBuyerPendingOrders } from '../../hook/useBuyerPendingOrders';
import { useUnsignedOrders } from '../../hook/useUnsignedOrders';
import { useEscrowActions } from '../../lib/escrowActions';
import {
  Button,
  Box,
  Paper,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';   // ← NEW

const MyOrders: React.FC = () => {
  const { loading, orders, forceRefresh } = useUnsignedOrders();
  const { sellerSign, buyerSign } = useEscrowActions();
  const { loading: loadB, orders: buyerOrders, refresh } = useBuyerPendingOrders();

  const navigate = useNavigate();                // ← NEW

  if (loading || loadB) return <CircularProgress />;

  /* helper для навігації у чат */
  const openChat = (o: typeof orders[number] | typeof buyerOrders[number]) =>
    navigate(`/swap/${o.dealId}`, { state: { order: o, fromMyOrders: true } });

  return (
    <Box display="flex" flexDirection="column" gap={6}>
      {/* -------- SELLER SIDE ---------------------------------- */}
      <Typography variant="h6">Your sells – awaiting release</Typography>

      {orders.length === 0 ? (
        <Typography>Нічого не чекає вашого підпису.</Typography>
      ) : (
        orders.map((o) => (
          <Paper
            key={o.escrowPda.toBase58()}
            sx={{ p: 3, display: 'flex', justifyContent: 'space-between' }}
          >
            <Box>
              <Typography>Deal #{o.dealId}</Typography>
              <Typography variant="body2">You seller</Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={async () => {
                  await sellerSign(o);
                  await forceRefresh();
                }}
              >
                Release funds
              </Button>

              <Button
                variant="outlined"
                onClick={() => openChat(o)}
              >
                Chat
              </Button>
            </Stack>
          </Paper>
        ))
      )}

      {/* -------- BUYER SIDE ---------------------------------- */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Your buys – awaiting payment
      </Typography>

      {buyerOrders.length === 0 ? (
        <Typography>Оплатити нічого.</Typography>
      ) : (
        buyerOrders.map((o) => (
          <Paper
            key={o.escrowPda.toBase58()}
            sx={{ p: 3, display: 'flex', justifyContent: 'space-between' }}
          >
            <Box>
              <Typography>Deal #{o.dealId}</Typography>
              <Typography variant="body2">You buyer</Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={async () => {
                  await buyerSign(o);
                  await refresh();
                }}
              >
                Paid
              </Button>

              <Button
                variant="outlined"
                onClick={() => openChat(o)}
              >
                Chat
              </Button>
            </Stack>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default MyOrders;
