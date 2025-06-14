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
import { useEffect, useRef, useState } from 'react';
import { callAdmin } from '../../lib/callAdmin';
import { useSnackbar } from 'notistack';
import { DealChatDialog } from '../../components/DealChatDialog';  // ← додали
import { useWallet } from '@solana/wallet-adapter-react';
import { useOrdersBadge } from '../../context/OrdersBadgeContext';

const MyOrders: React.FC = () => {
  /* дані по ордерах */
  const { loading, orders, forceRefresh } = useUnsignedOrders();       // ви – seller
  const { loading: loadB, orders: buyerOrders, refresh } = useBuyerPendingOrders(); // ви – buyer
  const { enqueueSnackbar } = useSnackbar();
  const { sellerSign, buyerSign } = useEscrowActions();

  /* --- СТАН для діалогу чату ----------------------------------------- */
  const [chatDeal, setChatDeal] = useState<number | null>(null);
  const openChat  = (dealId: number) => setChatDeal(dealId);
  const closeChat = () => setChatDeal(null);
  /* -------------------------------------------------------------------- */

  const { bump, clear } = useOrdersBadge();
  useEffect(() => {
    clear();
  }, []);
  const savedIdsRef = useRef<Set<number>>(new Set());
    useEffect(() => {
      const allIds = [...orders, ...buyerOrders].map(o => o.dealId);
      const hasNew = allIds.some(id => !savedIdsRef.current.has(id));
      if (hasNew) bump();
      savedIdsRef.current = new Set(allIds);
    }, [orders, buyerOrders]);

  const { publicKey } = useWallet();
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
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={async () => {
                    try {
                      await callAdmin({
                        orderId: o.dealId,
                        buyerWallet: o.buyerCrypto,
                        sellerWallet: o.sellerCrypto,
                      });
                      enqueueSnackbar('Admin called', { variant: 'success' });
                    } catch {
                      enqueueSnackbar('Error sending request', { variant: 'error' });
                    }
                  }}
                >
                  Call admin
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
                 <Button
                  variant="outlined"
                  color="warning"
                  onClick={async () => {
                    try {
                      await callAdmin({
                        orderId: o.dealId,
                        buyerWallet: publicKey?.toBase58() || '',
                        sellerWallet: o.sellerCrypto,
                      });
                      enqueueSnackbar('Admin called', { variant: 'success' });
                    } catch(er) {
                      console.error('Error calling admin:', er);
                      enqueueSnackbar('Error sending request', { variant: 'error' });
                    }
                  }}
                >
                  Call admin
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
