import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Divider,
  Stack,
  Slide,
  ThemeProvider,
  createTheme,
  Avatar,
} from '@mui/material';

const dummyReviews = [
  { user: '0xPaul', rating: 5, comment: 'All smooth!' },
  { user: '0xDima', rating: 2, comment: 'Took too long' },
];

const renderStars = (count: number) => '★'.repeat(count) + '☆'.repeat(5 - count);

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1e1e1e',
      paper: '#27292F',
    },
    primary: {
      main: '#F3EF52',
      contrastText: '#27292F',
    },
    text: {
      primary: '#fff',
      secondary: '#aaa',
    },
  },
});

const SwapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [messages, setMessages] = useState([
    { from: '0xBob', text: 'Привіт! Готовий до оплати?' },
    { from: 'you', text: 'Так, перевіряю суму.' },
  ]);
  const [newMsg, setNewMsg] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

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
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', p: 3, overflowX: 'hidden' }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
            <Typography variant="h4" color="primary">Deal #{shortId}</Typography>
            <Box textAlign={{ xs: 'left', md: 'right' }}>
              <Typography color="primary" fontWeight={600}>USD / SOL</Typography>
              <Typography variant="body2">Waiting for payment</Typography>
              <Typography variant="h6" color="primary">{fmt(timeLeft)} left</Typography>
            </Box>
          </Box>
        </Paper>

        <Box display="grid" gridTemplateColumns={{ lg: '3fr 2fr' }} gap={4} alignItems="stretch">
          <Paper sx={{ p: 4, borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 500, overflow: 'hidden' }}>
            <Box>
              <Box display="flex" alignItems="center" gap={3} mb={3}>
                <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 64, height: 64 }}>U</Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="h5" color="primary" noWrap>@BobTrader</Typography>
                  <Typography variant="body2" color="text.secondary">Joined: Jan 2023</Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2} direction="row" useFlexGap sx={{ columnGap: 4, rowGap: 3, flexWrap: 'wrap', p: 2, backgroundColor: '#1e1e1e', borderRadius: 2, boxShadow: 'inset 0 0 0 1px #2e2e2e' }}>
                <Box flexBasis="calc(50% - 16px)" flexGrow={1} sx={{ p: 2, bgcolor: '#27292F', borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">Wallet</Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ wordBreak: 'break-all' }}>FP31f...4cRtJRxf3bbJN1KUbZ</Typography>
                </Box>
                <Box flexBasis="calc(50% - 16px)" flexGrow={1} sx={{ p: 2, bgcolor: '#27292F', borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">Bank</Typography>
                  <Typography variant="body1" fontWeight={700}>Monobank</Typography>
                </Box>
                <Box flexBasis="calc(50% - 16px)" flexGrow={1} sx={{ p: 2, bgcolor: '#27292F', borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">Rating</Typography>
                  <Typography variant="body1" fontWeight={700}>4.8 / 5 ({renderStars(5)})</Typography>
                </Box>
                <Box flexBasis="calc(50% - 16px)" flexGrow={1} sx={{ p: 2, bgcolor: '#27292F', borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">Total Volume</Typography>
                  <Typography variant="body1" fontWeight={700}>$12,450</Typography>
                </Box>
                <Box flexBasis="calc(50% - 16px)" flexGrow={1} sx={{ p: 2, bgcolor: '#27292F', borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">Completed Deals</Typography>
                  <Typography variant="body1" fontWeight={700}>134</Typography>
                </Box>
                <Box flexBasis="calc(50% - 16px)" flexGrow={1} sx={{ p: 2, bgcolor: '#27292F', borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary">Telegram</Typography>
                  <Typography variant="body1" fontWeight={700} component="a" href="https://t.me/BobTrader" target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main', textDecoration: 'none', wordBreak: 'break-word', '&:hover': { textDecoration: 'underline' } }}>@BobTrader</Typography>
                </Box>
              </Stack>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 500, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" color="primary">Chat</Typography>
              <Box>
                <Button variant="outlined" color="error" sx={{ mr: 1 }}>Cancel</Button>
                <Button variant="contained" color="primary">Paid</Button>
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
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#F3EF52',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#27292F',
                },
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
                        bgcolor: m.from === 'you' ? 'primary.main' : 'background.paper',
                        color: m.from === 'you' ? 'primary.contrastText' : 'text.primary',
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
              <Button variant="contained" onClick={sendMessage}>Send</Button>
            </Box>
          </Paper>
        </Box>

        <Paper sx={{ p: 3, mt: 6, borderRadius: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>Reviews</Typography>
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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.03)' },
                }}
              >
                <Typography
                  component={Link}
                  to={`/user/${r.user}`}
                  color="primary"
                  fontWeight={600}
                  sx={{ textDecoration: 'none' }}
                >
                  {r.user}
                </Typography>
                <Typography color="primary">{renderStars(r.rating)}</Typography>
                <Typography variant="body2" color="text.secondary">{r.comment}</Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default SwapPage;