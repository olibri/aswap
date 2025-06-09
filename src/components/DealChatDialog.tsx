import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Slide, Box, Typography
} from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useChat } from '../hooks/useChat';
import { useWallet } from '@solana/wallet-adapter-react';

interface Props {
  dealId: number;
  open: boolean;
  onClose: () => void;
}

export const DealChatDialog: React.FC<Props> = ({ dealId, open, onClose }) => {
  const { publicKey } = useWallet();
  const accountId = publicKey?.toBase58() ?? '';
  const { messages, sendMessage } = useChat(dealId, accountId);

  const [msg, setMsg] = useState('');
  const theme = useTheme();
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, open]);

  const handleSend = () => {
    if (!msg.trim()) return;
    sendMessage(msg);
    setMsg('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Deal #{dealId} – Chat</DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        <Box
          ref={chatRef}
          sx={{
            maxHeight: '60vh',
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar-thumb': { background: '#F3EF52', borderRadius: 4 },
          }}
        >
          <Stack spacing={1}>
            {messages.map((m, i) => {
              const isMe = m.accountId === accountId;
              return (
                <Slide key={i} direction={isMe ? 'left' : 'right'} in appear>
                  <Box
                    alignSelf={isMe ? 'flex-end' : 'flex-start'}
                    sx={{
                      maxWidth: '70%',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isMe ? '#F3EF52' : theme.palette.background.paper,
                      color:   isMe ? '#27292F' : theme.palette.text.primary,
                    }}
                  >
                    <Typography variant="caption" fontWeight={600}>
                      {isMe ? 'you' : `${m.accountId.slice(0,6)}…`}
                    </Typography>
                    <Typography>{m.content}</Typography>
                  </Box>
                </Slide>
              );
            })}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder="Type message…"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};
