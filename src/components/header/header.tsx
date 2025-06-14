import React, { useState } from "react";
import "./header.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useOrdersBadge } from "../../context/OrdersBadgeContext";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import { CircularProgress, IconButton, SvgIcon } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";

type Props = {
  onToggleTheme: () => void;
  currentTheme: "light" | "dark";
};
const TELEGRAM_BOT = "a_swap_bot";
const Header: React.FC<Props> = ({ onToggleTheme, currentTheme }) => {
  const [open, setOpen] = useState(false);
  const { unseen } = useOrdersBadge();
  const [isLinking, setLinking]  = useState(false);
  const [linked, setLinked]      = useState(false);   
  const { publicKey } = useWallet();

  const [,setSnack] = useState<string | null>(null);
  const notify = (msg: string) => setSnack(msg);

    const handleTelegramClick = async () => {
    console.debug("TG-button clicked");
    if (!publicKey) {
      notify("Connect wallet first");
      return;
    }
    if (linked || isLinking) return;

    try {
      setLinking(true);

      const wallet = publicKey.toBase58();
      console.debug("Requesting code for", wallet);

      const r = await fetch(`/api/platform/telegram-code?wallet=${wallet}`, {
        credentials: "include",
      });

      if (!r.ok) {
        notify(`Backend responded ${r.status}`);
        return;
      }

      const { code } = await r.json();          // { code: "abc123" }
      console.debug("Got code:", code);

      const url = `https://t.me/${TELEGRAM_BOT}?start=${code}`;
      const w   = window.open(url, "_blank", "noopener");

      if (!w) {
        notify("Popup blocked — allow pop-ups for this site");
        return;
      }

      // TODO: полінг чи WS, поки просто одразу вважаємо linked
      setLinked(true);
    } catch (e) {
      console.error(e);
      notify("Unexpected error, see console");
    } finally {
      setLinking(false);
    }
  };

    return (
    <header className="header">
      {/* ---------- LOGO ---------- */}
      <div className="logo primary">
        <img src="/2.svg" alt="P2P DEX Logo" className="logo-img" />
        P2P DEX
      </div>

      {/* ---------- BURGER ---------- */}
      <button
        className={`burger ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        <span /><span /><span />
      </button>

      {/* ---------- DESKTOP NAV ---------- */}
      <nav className="nav desktop">
        <a href="/market-p2p-orders" onClick={() => setOpen(false)}>
          Online
        </a>
        <a href="#" onClick={() => setOpen(false)}>
          Offline
        </a>

        {/* My orders + badge */}
        <Badge color="error" variant="dot" invisible={unseen === 0}>
          <a href="/my-orders" onClick={() => setOpen(false)}>
            My orders
          </a>
        </Badge>
      </nav>

      {/* ---------- RIGHT SIDE ---------- */}
      <div className="right">

         {/* TELEGRAM ICON */}
        <Tooltip title={linked ? "Telegram linked" : "Enable Telegram alerts"}>
          <span> {/* span потрібен, бо IconButton disabled не ловить tooltip */}
            <IconButton
              onClick={handleTelegramClick}
              disabled={linked || isLinking}
              sx={{
                color: linked ? "#30A8E0" : "inherit",        // активна — телеграм-блакитна
                opacity: isLinking ? 0.5 : 1,
              }}
              size="large"
            >
              {isLinking
                ? <CircularProgress size={24} />
                : (
                  <SvgIcon component="svg" inheritViewBox>
                    {/* /public/icons/telegram.svg → можна імпортувати файлом,
                        тут інлайн для стислості */}
                    <path d="M21.995 2.657c-.245-.207-.577-.257-1.012-.15L2.8 7.482c-.55.14-.9.447-.95.902-.05.465.263.81.97 1.042l3.55 1.112 1.37 4.44c.16.507.42.812.78.905.336.087.61-.05.823-.407l1.98-3.314 4.133 3.77c.42.36.8.545 1.146.553.378.008.625-.18.74-.564l2.693-10.8c.132-.515.01-.86-.2-1.066z" />
                  </SvgIcon>
                )}
            </IconButton>
          </span>
        </Tooltip>

        <button
          className="theme-toggle"
          title="Toggle theme"
          onClick={onToggleTheme}
        >
          {currentTheme === 'dark' ? '☀️' : '🌙'}
        </button>
        <WalletMultiButton />
      </div>

      {/* ---------- MOBILE DRAWER ---------- */}
      <nav className={`nav drawer ${open ? 'show' : ''}`}>
        <a href="/market-p2p-orders" onClick={() => setOpen(false)}>
          Online
        </a>
        <a href="#" onClick={() => setOpen(false)}>
          Offline
        </a>

        {/* My orders + badge (мобільне меню) */}
        <Badge color="error" variant="dot" invisible={unseen === 0}>
          <a href="/my-orders" onClick={() => setOpen(false)}>
            My orders
          </a>
        </Badge>
      </nav>
    </header>
  );
};

export default Header;
