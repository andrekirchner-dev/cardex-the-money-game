import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const LoginPage = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (!email || !password) { setError("Preencha email e senha."); return; }
    setBusy(true); setError("");
    try {
      if (mode === "login") await loginWithEmail(email, password);
      else await registerWithEmail(email, password, displayName || "Collector");
    } catch (e: any) {
      setError(e.message?.replace("Firebase: ", "").replace(/\s*\(.*\)/, "") ?? "Erro de autenticação");
    } finally { setBusy(false); }
  };

  const handleGoogle = async () => {
    setBusy(true); setError("");
    try { await loginWithGoogle(); }
    catch (e: any) { setError(e.message?.replace("Firebase: ", "").replace(/\s*\(.*\)/, "") ?? "Erro com Google"); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col min-h-screen w-full items-center justify-center px-6"
      style={{ background: "radial-gradient(ellipse at 30% 0%, #1a1025 0%, #0A0A0F 60%)" }}>

      <div style={{ marginBottom: 8, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 52, color: "#fff", letterSpacing: "0.04em", lineHeight: 1 }}>
          CAR<span style={{ color: "#E7363C" }}>DEX</span>
        </div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.22em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginTop: 4 }}>
          TCG Collection Manager
        </div>
      </div>

      <div className="w-full max-w-sm rounded-[20px] p-6 mt-8" style={{ background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Tab toggle */}
        <div className="flex rounded-[10px] mb-5 p-[3px]" style={{ background: "rgba(255,255,255,0.04)" }}>
          {(["login", "register"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} className="flex-1 rounded-[8px] py-[9px] border-none cursor-pointer"
              style={{
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                background: mode === m ? "linear-gradient(135deg, #E7363C, #F56438)" : "transparent",
                color: mode === m ? "#fff" : "rgba(255,255,255,0.35)",
                transition: "all 0.2s",
              }}>
              {m === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <div className="mb-3">
            <label style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Nome</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Seu nome de colecionador"
              className="w-full mt-1 rounded-[8px] px-3 py-3 border-none outline-none"
              style={{ background: "rgba(255,255,255,0.05)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 13, border: "1px solid rgba(255,255,255,0.08)", width: "100%", boxSizing: "border-box" }} />
          </div>
        )}

        <div className="mb-3">
          <label style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
            className="w-full mt-1 rounded-[8px] px-3 py-3 border-none outline-none"
            style={{ background: "rgba(255,255,255,0.05)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 13, border: "1px solid rgba(255,255,255,0.08)", width: "100%", boxSizing: "border-box" }} />
        </div>

        <div className="mb-5">
          <label style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handle()}
            className="w-full mt-1 rounded-[8px] px-3 py-3 border-none outline-none"
            style={{ background: "rgba(255,255,255,0.05)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 13, border: "1px solid rgba(255,255,255,0.08)", width: "100%", boxSizing: "border-box" }} />
        </div>

        {error && (
          <div className="mb-4 rounded-[8px] p-3" style={{ background: "rgba(231,54,60,0.1)", border: "1px solid rgba(231,54,60,0.2)", fontFamily: "var(--font-tech)", fontSize: 10, color: "#E7363C", letterSpacing: "0.04em" }}>
            {error}
          </div>
        )}

        <button onClick={handle} disabled={busy} className="w-full rounded-[10px] py-3 border-none cursor-pointer mb-3"
          style={{
            fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase",
            background: "linear-gradient(135deg, #E7363C, #F56438)", color: "#fff",
            boxShadow: "0 4px 20px rgba(231,54,60,0.35)", opacity: busy ? 0.6 : 1, transition: "opacity 0.2s",
          }}>
          {busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>OU</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        </div>

        <button onClick={handleGoogle} disabled={busy} className="w-full rounded-[10px] py-3 cursor-pointer flex items-center justify-center gap-2"
          style={{
            fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase",
            background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.08)", opacity: busy ? 0.6 : 1, transition: "opacity 0.2s",
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
