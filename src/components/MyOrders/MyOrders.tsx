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
import { useState } from 'react';

import { DealChatDialog } from '../../components/DealChatDialog';  // ← додали

const MyOrders: React.FC = () => {
  /* дані по ордерах */
  const { loading, orders, forceRefresh } = useUnsignedOrders();       // ви – seller
  const { loading: loadB, orders: buyerOrders, refresh } = useBuyerPendingOrders(); // ви – buyer

  const { sellerSign, buyerSign } = useEscrowActions();

  /* --- СТАН для діалогу чату ----------------------------------------- */
  const [chatDeal, setChatDeal] = useState<number | null>(null);
  const openChat  = (dealId: number) => setChatDeal(dealId);
  const closeChat = () => setChatDeal(null);
  /* -------------------------------------------------------------------- */

  if (loading || loadB) return <CircularProgress />;

  return (
    <>
      <Box display="flex" flexDirection="column" gap={6}>
        {/* ---------- SELLER side -------------- */}
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

                {/* ← КНОПКА ЧАТУ */}
                <Button variant="outlined" onClick={() => openChat(o.dealId)}>
                  Chat
                </Button>
              </Stack>
            </Paper>
          ))
        )}

        {/* ---------- BUYER side -------------- */}
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

                {/* ← КНОПКА ЧАТУ */}
                <Button variant="outlined" onClick={() => openChat(o.dealId)}>
                  Chat
                </Button>
              </Stack>
            </Paper>
          ))
        )}
      </Box>

      {/* ---------- Сам діалог-чат ---------- */}
      {chatDeal !== null && (
        <DealChatDialog dealId={chatDeal} open onClose={closeChat} />
      )}
    </>
  );
};

export default MyOrders;
