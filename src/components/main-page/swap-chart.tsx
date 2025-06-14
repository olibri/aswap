import './swap-chart.css';
import FloatIcon from "./floatIcon";
import { Link } from 'react-router-dom'; 
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography,
  CircularProgress,
  Box,
  TableContainer,
  Link as MuiLink,
  Button,
} from '@mui/material';
const SwapChart: React.FC = () => {
  const fakeDeals = [
  { dealId: 'abc123', fiatCode: 'USD', tokenMint: 'USDC', amount: 150, price: 100 },
  { dealId: 'xyz456', fiatCode: 'EUR', tokenMint: 'SOL', amount: 0.42, price: 16423 },
  { dealId: 'def789', fiatCode: 'UAH', tokenMint: 'USDT', amount: 300, price: 99 },
  { dealId: 'qwe321', fiatCode: 'USD', tokenMint: 'SOL', amount: 1.25, price: 16250 },
  { dealId: 'lmn654', fiatCode: 'GBP', tokenMint: 'USDC', amount: 200, price: 101 },
];
const tokenLogos: Record<string, string> = {
  USDC: 'icons/usdc.svg',
  SOL: 'icons/solana.svg',
  USDT: 'icons/usdt.svg',
};
const deals = fakeDeals;
const loading = false;

// const { deals, loading } = useLatestDeals(5);                
  return (
    <div className="home">

      {/* HERO / DASHBOARD */}
      <section className="hero">
      <div className="hero-glow" />
        <h1>P2P DEX made simple</h1>
        <div className="hero-actions">
          <a href="/create-order" className="btn accent">Create offer</a>
          <a href="/market-p2p-orders" className="btn ghost">Browse market</a>
        </div>
      <div className="floaties">
        <FloatIcon src="/flying/sol.svg"  initialX="10%" initialY="25%" />
        <FloatIcon src="/flying/usdc.svg" initialX="18%" initialY="65%" />
        <FloatIcon src="/flying/usdt.svg" initialX="78%" initialY="30%" />
        <FloatIcon src="/flying/card.svg" initialX="82%" initialY="70%" size={48} />
        <FloatIcon src="/flying/solflare.svg" initialX="55%" initialY="22%" size={48} />
        <FloatIcon src="/flying/phantom.svg" initialX="30%" initialY="40%" size={48} />

      </div>

      
      </section>
{/* HOW IT WORKS */}
<section className="hiw">
  <h2>How it works</h2>
  <div className="hiw-grid">
    <article>
      <span className="index">01</span>
      <h3>Lock funds</h3>
      <p>The buyer locks USDC or SOL into a secure on-chain escrow account.</p>
    </article>
    <article>
      <span className="index">02</span>
      <h3>Counter‑sign</h3>
      <p>The seller verifies the trade and signs to confirm the agreement.</p>
    </article>
    <article>
      <span className="index">03</span>
      <h3>Release escrow</h3>
      <p>Funds are automatically released once both sides fulfill their part.</p>
    </article>
  </div>
</section>


      {/* QUICK STATS / CTA */}
      <section className="stats">
        <div className="stat-card">
          <h3>$12.4M</h3>
          <p>Total volume</p>
        </div>
        <div className="stat-card">
          <h3>3542</h3>
          <p>Offers settled</p>
        </div>
        <div className="stat-card">
          <h3>0</h3>
          <p>Disputes outstanding</p>
        </div>
      </section>

 <section className="latest">
      <h2>
        Latest deals
      </h2>
     
      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      ) : deals.length === 0 ? (
        <Typography color="textSecondary" textAlign="center" py={4}>
          No recent activity.
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: '#1c1c1f',
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: '#2a2a2e' }}>
              <TableRow>
                <TableCell>Pair</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deals.map((d) => (
                <TableRow
                  key={d.dealId}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                    transition: '0.3s',
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <img
                        src={tokenLogos[d.tokenMint] || '/tokens/default.svg'}
                        alt={d.tokenMint}
                        width={20}
                        height={20}
                      />
                      <span>{d.fiatCode} / {d.tokenMint}</span>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {Number(d.amount).toLocaleString()} {d.tokenMint}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: Number(d.price) >= 100 ? '#5EFFA0' : '#FF7C7C',
                      fontWeight: 500,
                    }}
                  >
                    ${ (Number(d.price) / 100).toFixed(2) }
                  </TableCell>
                  <TableCell>
                    <MuiLink
                      component={Link}
                      to={`/swap/${d.dealId}`}
                      underline="none"
                      sx={{ color: '#F3EF52', fontWeight: 500 }}
                    >
                      View →
                    </MuiLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box textAlign="center" mt={3}>
        <Button
          component={Link}
          to="/market-p2p-orders"
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: '#F3EF52',
            color: '#F3EF52',
            px: 3,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(243, 239, 82, 0.1)',
              borderColor: '#F3EF52',
            },
          }}
        >
          View full market →
        </Button>
      </Box>
    </section>

    </div>
  );
};

export default SwapChart;
