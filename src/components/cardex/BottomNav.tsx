type NavPage = "home" | "index" | "scanner" | "trade" | "profile";

const navItems: { id: NavPage; label: string; iconPaths: JSX.Element; center?: boolean }[] = [
  {
    id: "home", label: "Home",
    iconPaths: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  },
  {
    id: "index", label: "Index",
    iconPaths: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  },
  {
    id: "scanner", label: "Scan", center: true,
    iconPaths: <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></>,
  },
  {
    id: "trade", label: "Trade",
    iconPaths: <><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></>,
  },
  {
    id: "profile", label: "Profile",
    iconPaths: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  },
];

const BottomNav = ({ active, onNavigate }: { active: NavPage; onNavigate: (p: string) => void }) => (
  <div
    className="absolute bottom-0 left-0 right-0 grid grid-cols-5 z-[100]"
    style={{
      height: 82,
      background: "rgba(10,10,15,0.95)",
      backdropFilter: "blur(24px)",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      padding: "10px 0 24px",
    }}
  >
    {navItems.map((item) => {
      const isActive = active === item.id;
      return (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer"
          style={{ padding: "4px 0", transition: "all 0.2s" }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: item.center ? 36 : 28,
              height: item.center ? 36 : 28,
              borderRadius: item.center ? 12 : 8,
              background: item.center
                ? isActive ? "rgba(252,171,32,0.2)" : "rgba(252,171,32,0.08)"
                : isActive ? "rgba(252,171,32,0.12)" : "transparent",
              border: item.center ? `1px solid ${isActive ? "rgba(252,171,32,0.4)" : "rgba(252,171,32,0.15)"}` : "none",
              transition: "all 0.2s",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={isActive ? "#FCAB20" : "rgba(255,255,255,0.3)"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: item.center ? 20 : 18, height: item.center ? 20 : 18 }}
            >
              {item.iconPaths}
            </svg>
          </div>
          <span style={{
            fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.08em",
            color: isActive ? "#FCAB20" : "rgba(255,255,255,0.3)", textTransform: "uppercase",
          }}>{item.label}</span>
        </button>
      );
    })}
  </div>
);

export default BottomNav;
