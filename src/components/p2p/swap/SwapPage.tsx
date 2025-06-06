import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Divider,
  Stack,
  Slide,
  Avatar,
  useTheme
} from '@mui/material';
import { useEscrowActions } from '../../../lib/escrowActions';
import { EscrowOrderDto } from '../../../types/offers';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { EscrowStatus } from '../../../lib/escrowStatus';
const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api';

const dummyReviews = [
  { user: '0xPaul', rating: 5, comment: 'All smooth!' },
  { user: '0xDima', rating: 2, comment: 'Took too long' },
];

const renderStars = (count: number) => '★'.repeat(count) + '☆'.repeat(5 - count);

const SwapPage: React.FC = () => {
  const { cancelClaim, cancelFill, buyerSign } = useEscrowActions();
  const [, setRefresh] = useState(0);          
  const [signing, setSigning] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [messages, setMessages] = useState([
    { from: '0xBob', text: 'Привіт! Готовий до оплати?' },
    { from: 'you', text: 'Так, перевіряю суму.' },
  ]);
  const [newMsg, setNewMsg] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const location = useLocation();
  const order = location.state as (EscrowOrderDto & {
  isPartial: boolean;
  fillNonce?: number;
  fillPda?: string;
  parentOffer?: string;
});
  const isPartial = Boolean(order?.isPartial);
            
  const canCancel = order && (!order.buyerSigned);
  // const meta  = useOrderMeta(order);

  useEffect(() => {
    const iv = setInterval(() => setTimeLeft((t) => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    setMessages((m) => [...m, { from: 'you', text: newMsg }]);
    setNewMsg('');
  };

  const shortId = id?.split('-').pop()?.slice(-6);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, color: theme.palette.text.primary, p: 3, overflowX: 'hidden' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
          <Typography variant="h4" sx={{ color: isDark ? '#F3EF52' : '#1e1e1e' }}>Deal #{shortId}</Typography>
          <Box textAlign={{ xs: 'left', md: 'right' }}>
            <Typography sx={{ color: isDark ? '#F3EF52' : '#555' }} fontWeight={600}>USD / SOL</Typography>
            <Typography variant="body2">Waiting for payment</Typography>
            <Typography variant="h6" sx={{ color: isDark ? '#F3EF52' : '#333' }}>{fmt(timeLeft)} left</Typography>
          </Box>
        </Box>
      </Paper>

      <Box display="grid" gridTemplateColumns={{ lg: '3fr 2fr' }} gap={4} alignItems="stretch">
        <Paper sx={{ p: 4, borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 500, overflow: 'hidden', bgcolor: theme.palette.background.paper }}>
          <Box>
            <Box display="flex" alignItems="center" gap={3} mb={3}>
              <Avatar sx={{ bgcolor: '#F3EF52', color: '#27292F', width: 64, height: 64 }}>U</Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="h5" sx={{ color: isDark ? '#F3EF52' : '#1e1e1e' }} noWrap>@BobTrader</Typography>
                <Typography variant="body2" color="text.secondary">Joined: Jan 2023</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2} direction="row" useFlexGap sx={{ columnGap: 4, rowGap: 3, flexWrap: 'wrap', p: 2, backgroundColor: isDark ? '#1e1e1e' : '#f1f1f1', borderRadius: 2, boxShadow: isDark ? 'inset 0 0 0 1px #2e2e2e' : 'inset 0 0 0 1px #ddd' }}>
              {[
                { label: 'Wallet', value: '0xBob1234568abcdef' },
                { label: 'Bank', value: 'Monobank' },
                { label: 'Rating', value: '4.8 / 5 (' + renderStars(5) + ')' },
                { label: 'Total volume', value: '$12,450' },
                { label: 'Completed Deals', value: '134' },
                { label: 'Telegram', value: '@BobTrader', isLink: true },
              ].map((field, i) => (
                <Box key={i} flexBasis="calc(50% - 16px)" flexGrow={1} sx={{ p: 2, bgcolor: theme.palette.background.paper, borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">{field.label}</Typography>
                  {field.isLink ? (
                    <Typography variant="body1" fontWeight={700} component="a" href="https://t.me/BobTrader" target="_blank" rel="noopener noreferrer" sx={{ color: '#F3EF52', textDecoration: 'none', wordBreak: 'break-word', '&:hover': { textDecoration: 'underline' } }}>{field.value}</Typography>
                  ) : (
                    <Typography variant="body1" fontWeight={700}>{field.value}</Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 500, borderRadius: 3, bgcolor: isDark ? '#181818' : '#fafafa' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Chat</Typography>
            <Box>
                {canCancel && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={async () => {
                    if (!order) return;
                    try {
                      if (isPartial) await cancelFill(order);
                      else await cancelClaim(order);
                      navigate('/market-p2p-orders');
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button variant="contained" sx={{ bgcolor: '#F3EF52', color: '#27292F', '&:hover': { bgcolor: '#e0dc48' } }}
               disabled={!order || signing || order.buyerSigned}
               onClick={async () => {
                console.log('order =', order);
                if (!order) return;
                 try {
                    
                   setSigning(true);
                   await buyerSign(order, ()=> {
                    setRefresh(r => r + 1);
                   });        
                  const backendRes = await fetch(`${API_PREFIX}/platform/update-offers`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            orderId: Number(order.dealId),  // ulong on server
                            status: EscrowStatus.SignedByOneSide,
                            filledQuantity: order.filledAmount,
                            buyerFiat: order.fiatCode
                          }),
                        });
                  if (!backendRes.ok)
                    throw new Error(await backendRes.text());

                   order.buyerSigned = true;           
                 } catch (e) {
                   console.error(e);
                 } finally { setSigning(false); }
               }}
              >
               {signing ? 'Signing…' : 'Paid'}
              </Button>

            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box
            ref={chatRef}
            flex={1}
            sx={{
              overflowY: 'auto',
              overflowX: 'hidden',
              mb: 2,
              px: 1,
              pr: 2,
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#F3EF52', borderRadius: '4px' },
              '&::-webkit-scrollbar-track': { backgroundColor: isDark ? '#000000' : '#eee' },
              scrollBehavior: 'smooth',
            }}
          >
            <Stack spacing={1}>
              {messages.map((m, i) => (
                <Slide key={i} direction={m.from === 'you' ? 'left' : 'right'} in mountOnEnter unmountOnExit appear>
                  <Box
                    alignSelf={m.from === 'you' ? 'flex-end' : 'flex-start'}
                    sx={{
                      maxWidth: '70%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: m.from === 'you' ? '#F3EF52' : theme.palette.background.paper,
                      color: m.from === 'you' ? '#27292F' : theme.palette.text.primary,
                      wordBreak: 'break-word',
                    }}
                  >
                    <Typography fontWeight={600}>{m.from}</Typography>
                    <Typography>{m.text}</Typography>
                  </Box>
                </Slide>
              ))}
            </Stack>
          </Box>
          <Box display="flex" gap={2}>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Type message..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button variant="contained" sx={{ bgcolor: '#F3EF52', color: '#27292F', '&:hover': { bgcolor: '#e0dc48' } }} onClick={sendMessage}>Send</Button>
          </Box>
        </Paper>
      </Box>

      <Paper sx={{ p: 3, mt: 6, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
        <Typography variant="h6" gutterBottom>Reviews</Typography>
        <Box display="flex" gap={3} overflow="hidden" flexWrap="wrap">
          {dummyReviews.map((r, i) => (
            <Paper
              key={i}
              elevation={4}
              sx={{
                p: 2,
                width: 200,
                borderLeft: '4px solid #F3EF52',
                borderRadius: 3,
                bgcolor: isDark ? '#1a1a1a' : '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.03)' },
              }}
            >
              <Typography
                component={Link}
                to={`/user/${r.user}`}
                sx={{ color: '#F3EF52', fontWeight: 600, textDecoration: 'none' }}
              >
                {r.user}
              </Typography>
              <Typography sx={{ color: '#F3EF52' }}>{renderStars(r.rating)}</Typography>
              <Typography variant="body2" color="text.secondary">{r.comment}</Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default SwapPage;