// src/components/footer/Footer.tsx
import { Box, Stack, Typography, IconButton, useTheme } from '@mui/material';

const coins = [
  { alt: 'Solana', src: '/icons/solana.svg' },
  { alt: 'USDC',   src: '/icons/usdc.svg'   },
  { alt: 'USDT',   src: '/icons/usdt.svg'   },
  { alt: 'Phantom',src: '/icons/phantom.svg'},
  { alt: 'Solflare',src:'/icons/solflare.svg'},
];

const socials = [
  { alt: 'Telegram', href: 'https://t.me/your_project', src: '/icons/telegram.svg' },
  { alt: 'Twitter',  href: 'https://twitter.com/your_project', src: '/icons/twitter.svg' },
  { alt: 'Email',    href: 'mailto:support@yourproject.com',   src: '/icons/email.svg'   },
];

export default function Footer() {
  const theme = useTheme();
  const bg      = theme.palette.mode === 'dark' ? '#111' : '#fff';
  const txt     = theme.palette.mode === 'dark' ? '#bbb' : '#1e1e1e';

  /** маленький хелпер для списку іконок */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconsRow = ({ data, link }: {data:any[]; link?:boolean}) => (
    <Stack direction="row" spacing={2}>
      {data.map(({ alt, src, href }) => (
        <IconButton
          key={alt}
          component={link ? 'a' : 'span'}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            p: 0, width: 28, height: 28,
            opacity: .85,
            transition: 'opacity .2s, transform .2s',
            '&:hover': { opacity: 1, transform: 'scale(1.1)' },
          }}
        >
          <img src={src} alt={alt} width={28} height={28}/>
        </IconButton>
      ))}
    </Stack>
  );

  return (
    <Box component="footer" sx={{
      background: bg,
      color: txt,
      px: 4, py: 2.5,
      flexShrink: 0,           /* не стискаємо у flex-колонці */
    }}>
      <Stack
        direction={{ xs:'column', sm:'row' }}
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        {/* left */}
        <IconsRow data={coins} />

        {/* center */}
        <Typography
          sx={{ flexGrow: 1, textAlign:'center', fontSize:14 }}
        >
          © {new Date().getFullYear()} P2P DEX · All rights reserved
        </Typography>

        {/* right */}
        <IconsRow data={socials} link />
      </Stack>
    </Box>
  );
}
