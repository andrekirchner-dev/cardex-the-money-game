import { useState, useEffect } from "react";

type Lang = "EN" | "ES" | "PT";

const SettingsPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("cardex-lang") as Lang) || "EN");
  const [notifications, setNotifications] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);

  useEffect(() => { localStorage.setItem("cardex-lang", lang); }, [lang]);

  const toggleStyle = (on: boolean): React.CSSProperties => ({
    width: 44, height: 24, borderRadius: 12, cursor: "pointer", border: "none",
    background: on ? "linear-gradient(135deg, #59AC99, #B8E10D)" : "rgba(255,255,255,0.1)",
    position: "relative", transition: "background 0.2s", flexShrink: 0,
  });

  const dotStyle = (on: boolean): React.CSSProperties => ({
    width: 18, height: 18, borderRadius: "50%", background: "#fff",
    position: "absolute", top: 3, left: on ? 23 : 3, transition: "left 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
  });

  const settingsRows = [
    { label: "Privacy & Security", action: true },
    { label: "Data Export", action: true },
    { label: "Help & Support", action: true },
  ];

  return (
    <div>
      <button onClick={() => onNavigate("profile")} className="flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer" style={{ fontFamily: "var(--font-tech)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
        <span style={{ fontSize: 16 }}>‹</span> PROFILE
      </button>

      <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>Preferences</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 14 }}>SETTINGS</h1>

      {/* Language */}
      <div className="flex items-center gap-2 mb-[10px]" style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
        Language<div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>
      <div className="flex gap-2 mb-[14px]">
        {(["EN", "ES", "PT"] as Lang[]).map(l => (
          <button key={l} onClick={() => setLang(l)} className="flex-1 cursor-pointer" style={{
            padding: "10px 0", borderRadius: 10, border: `1px solid ${lang === l ? "#FCAB20" : "rgba(255,255,255,0.07)"}`,
            background: lang === l ? "rgba(252,171,32,0.15)" : "#1C1C28",
            color: lang === l ? "#FCAB20" : "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: "0.06em", textAlign: "center",
            transition: "all 0.15s",
          }}>{l}</button>
        ))}
      </div>

      {/* Toggles */}
      <div className="rounded-[16px] p-[14px] mb-[10px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between" style={{ padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontFamily: "var(--font-tech)", fontSize: 11, letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>Notification Preferences</span>
          <button style={toggleStyle(notifications)} onClick={() => setNotifications(!notifications)}><div style={dotStyle(notifications)} /></button>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "11px 0" }}>
          <span style={{ fontFamily: "var(--font-tech)", fontSize: 11, letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>Display & Theme</span>
          <button style={toggleStyle(darkTheme)} onClick={() => setDarkTheme(!darkTheme)}><div style={dotStyle(darkTheme)} /></button>
        </div>
      </div>

      {/* Other settings */}
      <div className="rounded-[16px] p-[14px]" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {settingsRows.map((s, i) => (
          <div key={s.label} className="flex items-center justify-between cursor-pointer" style={{
            padding: "11px 0", borderBottom: i < settingsRows.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
          }}>
            <span style={{ fontFamily: "var(--font-tech)", fontSize: 11, letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>{s.label}</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.2)" }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
