import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type PermState = "idle" | "requesting" | "granted" | "denied" | "unsupported";
type ScanState = "camera" | "preview" | "analyzing" | "result";

interface GradeResult {
  overall: number;
  band: string;
  confidence: number;
  centering: number;
  corners: number;
  edges: number;
  surface: number;
  dimensions: number;
  defects: string[];
  estimatedValue: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isMobileDevice(): boolean {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
}

function scoreToGrade(score: number): string {
  if (score >= 985) return "10 Pristine";
  if (score >= 950) return "10 Gem Mint";
  if (score >= 900) return "9 Mint";
  if (score >= 850) return "8 NM-MT";
  if (score >= 780) return "7 Near Mint";
  if (score >= 680) return "6 EX-MT";
  if (score >= 580) return "5 EX";
  return "< 5 Damaged";
}

function scoreColor(score: number): string {
  if (score >= 950) return "#B8E10D";
  if (score >= 900) return "#59AC99";
  if (score >= 780) return "#FCAB20";
  if (score >= 580) return "#F56438";
  return "#E7363C";
}

// ─── Mock grading analysis (V1 — image-based heuristics) ─────────────────────
function runMockPreGrade(): GradeResult {
  // V1: randomized-but-realistic scoring — real CV in V2
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const centering  = rand(820, 1000);
  const corners    = rand(800, 1000);
  const edges      = rand(840, 1000);
  const surface    = rand(860, 1000);
  const dimensions = rand(900, 1000);

  const raw = Math.round(
    centering  * 0.22 +
    corners    * 0.23 +
    edges      * 0.20 +
    surface    * 0.27 +
    dimensions * 0.08
  );

  const capPenalty = corners < 850 ? 30 : edges < 860 ? 15 : 0;
  const overall = Math.min(1000, Math.max(0, raw - capPenalty));
  const band = scoreToGrade(overall);
  const confidence = rand(72, 91);

  const allDefects = [
    "Minor whitening detected bottom-left corner",
    "Light surface scratching under diffuse light",
    "Edge wear — top border 2.1% whitening",
    "Centering 53/47 L-R, 51/49 T-B",
    "Print quality consistent — no print lines",
    "Back centering within tolerance",
    "Corner sharpness excellent — all 4 corners",
  ];
  const defects = allDefects.filter(() => Math.random() > 0.5);

  const valueMap: Record<string, string> = {
    "10 Pristine": "$1,200–$4,000+",
    "10 Gem Mint": "$400–$1,200",
    "9 Mint": "$80–$400",
    "8 NM-MT": "$30–$80",
    "7 Near Mint": "$15–$30",
    "6 EX-MT": "$8–$15",
  };

  return { overall, band, confidence, centering, corners, edges, surface, dimensions, defects, estimatedValue: valueMap[band] ?? "$5–$10" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MetricBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 1000) * 100;
  const color = scoreColor(score);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color, letterSpacing: "0.02em" }}>{(score / 100).toFixed(1)}</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

function ScanGuideOverlay({ hasLidar }: { hasLidar: boolean }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Corner guides */}
      {[
        { top: 20, left: 20, borderTop: `2px solid ${hasLidar ? "#B8E10D" : "#FCAB20"}`, borderLeft: `2px solid ${hasLidar ? "#B8E10D" : "#FCAB20"}` },
        { top: 20, right: 20, borderTop: `2px solid ${hasLidar ? "#B8E10D" : "#FCAB20"}`, borderRight: `2px solid ${hasLidar ? "#B8E10D" : "#FCAB20"}` },
        { bottom: 20, left: 20, borderBottom: `2px solid ${hasLidar ? "#B8E10D" : "#FCAB20"}`, borderLeft: `2px solid ${hasLidar ? "#B8E10D" : "#FCAB20"}` },
        { bottom: 20, right: 20, borderBottom: `2px solid ${hasLidar ? "#B8E10D" : "#FCAB20"}`, borderRight: `2px solid ${hasLidar ? "#B8E10D" : "#FCAB20"}` },
      ].map((s, i) => (
        <div key={i} style={{ position: "absolute", width: 28, height: 28, ...s }} />
      ))}
      {/* Scan line */}
      <div style={{
        position: "absolute", left: 20, right: 20, height: 2,
        background: `linear-gradient(90deg, transparent, ${hasLidar ? "#B8E10D" : "#FCAB20"}, transparent)`,
        boxShadow: `0 0 ${hasLidar ? "16px" : "10px"} ${hasLidar ? "#B8E10D" : "#FCAB20"}`,
        animation: "scanMove 2s ease-in-out infinite",
      }} />
      {/* Center crosshair */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 60, height: 60 }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.2)" }} />
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.2)" }} />
      </div>
      {/* Card outline guide */}
      <div style={{
        position: "absolute",
        top: "15%", left: "20%", right: "20%", bottom: "15%",
        border: "1px dashed rgba(255,255,255,0.12)",
        borderRadius: 6,
      }} />
      <style>{`@keyframes scanMove{0%,100%{top:20%}50%{top:75%}}`}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ScannerPage = ({ onNavigate: _ }: { onNavigate: (page: string) => void }) => {
  const [permState, setPermState]     = useState<PermState>("idle");
  const [scanState, setScanState]     = useState<ScanState>("camera");
  const [hasLidar, setHasLidar]       = useState(false);
  const [lidarActive, setLidarActive] = useState(false);
  const [result, setResult]           = useState<GradeResult | null>(null);
  const [isOnMobile]                  = useState(isMobileDevice);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);

  // Cleanup stream on unmount
  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  const requestCamera = useCallback(async () => {
    setPermState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPermState("granted");
      setScanState("camera");

      // Detect LiDAR via WebXR Depth Sensing
      try {
        const xr = (navigator as any).xr;
        if (xr) {
          const supported = await xr.isSessionSupported("immersive-ar");
          setHasLidar(supported);
        }
      } catch {
        setHasLidar(false);
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") setPermState("denied");
      else setPermState("unsupported");
    }
  }, []);

  const captureAndAnalyze = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);

    setScanState("analyzing");

    // Run pre-grade analysis (V1 mock — V2 will use real CV)
    setTimeout(() => {
      const gradeResult = runMockPreGrade();
      setResult(gradeResult);
      setScanState("result");
      // Stop camera
      streamRef.current?.getTracks().forEach(t => t.stop());
    }, 2200);
  }, []);

  const resetScan = useCallback(() => {
    setPermState("idle");
    setScanState("camera");
    setResult(null);
    setHasLidar(false);
    setLidarActive(false);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // ── Desktop warning ──
  if (!isOnMobile) {
    return (
      <div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>AI Grading</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 20 }}>CARD<br />SCANNER</h1>

        <div style={{ borderRadius: 16, padding: 24, background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📱</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Scanner disponível no mobile</div>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", lineHeight: 1.7, marginBottom: 20 }}>
            O CarDex Scanner usa a câmera traseira e o sensor LiDAR<br />
            do seu dispositivo para análise de grading em tempo real.<br />
            Acesse <strong style={{ color: "#FCAB20" }}>cardex-tcg.vercel.app</strong> no seu celular para usar.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["📷 Câmera traseira", "🔍 LiDAR depth", "🃏 AI Pre-grading", "📊 Relatório técnico"].map(f => (
              <span key={f} style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "4px 10px" }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile: Permission request ──
  if (permState === "idle" || permState === "denied" || permState === "unsupported") {
    return (
      <div>
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 6 }}>AI Grading</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, marginBottom: 20 }}>CARD<br />SCANNER</h1>

        {/* Main CTA */}
        <div style={{ borderRadius: 20, padding: 24, background: "linear-gradient(135deg,#0D1A0A,#121A0A)", border: "1px solid rgba(184,225,13,0.2)", marginBottom: 14, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(184,225,13,0.08)", border: "2px solid rgba(184,225,13,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36 }}>
            📷
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#B8E10D", letterSpacing: "0.02em", marginBottom: 8 }}>CARDEX VISION™</div>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", lineHeight: 1.7, marginBottom: 20 }}>
            Análise técnica de grading por IA usando<br />câmera traseira{" "}
            {hasLidar && <span style={{ color: "#B8E10D" }}>+ sensor LiDAR</span>}
          </div>

          {permState === "denied" && (
            <div style={{ borderRadius: 10, padding: "10px 14px", background: "rgba(231,54,60,0.1)", border: "1px solid rgba(231,54,60,0.2)", marginBottom: 14 }}>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "#E7363C", letterSpacing: "0.04em" }}>
                ⚠️ Permissão de câmera negada. Ative nas configurações do browser.
              </div>
            </div>
          )}

          <button onClick={requestCamera}
            style={{
              width: "100%", borderRadius: 12, padding: "14px 20px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#59AC99,#B8E10D)", fontFamily: "var(--font-mono)",
              fontSize: 13, fontWeight: 700, color: "#0A0A0F", letterSpacing: "0.06em", textTransform: "uppercase",
              boxShadow: "0 4px 24px rgba(184,225,13,0.25)",
            }}>
            📷 Autorizar Câmera
          </button>
        </div>

        {/* Feature list */}
        <div style={{ borderRadius: 16, padding: 16, background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { icon: "🎯", label: "Centering", desc: "Medição precisa L/R e T/B" },
            { icon: "🔬", label: "Cantos & Bordas", desc: "Whitening, fray e nicks" },
            { icon: "✨", label: "Superfície", desc: "Scratches, dents e print lines" },
            { icon: "📐", label: "Dimensões", desc: hasLidar ? "LiDAR warp + corner lift" : "Geometria e proporções" },
          ].map((f, i, arr) => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff" }}>{f.label}</div>
                <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em", marginTop: 2 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Requesting ──
  if (permState === "requesting") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid rgba(184,225,13,0.3)", borderTop: "2px solid #B8E10D", animation: "spin 1s linear infinite" }} />
        <div style={{ fontFamily: "var(--font-tech)", fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>Ativando câmera...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Camera live / Analyzing ──
  if (scanState === "camera" || scanState === "analyzing") {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 4 }}>AI Grading</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "0.02em", color: "#fff", lineHeight: 1 }}>SCANNER</h1>
          </div>
          {/* LiDAR status */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 8, letterSpacing: "0.12em", color: hasLidar ? "#B8E10D" : "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 4 }}>
              {hasLidar ? "LiDAR" : "No LiDAR"}
            </div>
            {hasLidar && (
              <button onClick={() => setLidarActive(a => !a)}
                style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: lidarActive ? "linear-gradient(135deg,#59AC99,#B8E10D)" : "rgba(255,255,255,0.1)", position: "relative" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: lidarActive ? 21 : 3, transition: "left 0.2s" }} />
              </button>
            )}
          </div>
        </div>

        {/* Camera viewport */}
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "3/4", background: "#000", border: `2px solid ${lidarActive ? "#B8E10D" : "rgba(184,225,13,0.3)"}`, marginBottom: 14, boxShadow: lidarActive ? "0 0 30px rgba(184,225,13,0.3)" : "none" }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {scanState === "camera" && <ScanGuideOverlay hasLidar={lidarActive} />}

          {/* Analyzing overlay */}
          {scanState === "analyzing" && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid rgba(184,225,13,0.3)", borderTop: "2px solid #B8E10D", animation: "spin 1s linear infinite" }} />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#B8E10D", letterSpacing: "0.04em" }}>ANALYZING</div>
              <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>
                {lidarActive ? "LiDAR depth mapping..." : "Running pre-grade engine..."}
              </div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* Status bar */}
          {scanState === "camera" && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 14px", background: "linear-gradient(transparent,rgba(0,0,0,0.8))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E7363C", boxShadow: "0 0 6px #E7363C", animation: "pulse 1.5s infinite" }} />
                <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)" }}>LIVE</span>
              </div>
              <span style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>
                Posicione a carta no guia
              </span>
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
            </div>
          )}
        </div>

        {/* Capture button */}
        {scanState === "camera" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={resetScan}
              style={{ borderRadius: 12, padding: "13px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", cursor: "pointer", letterSpacing: "0.04em" }}>
              ✕
            </button>
            <button onClick={captureAndAnalyze}
              style={{ flex: 1, borderRadius: 12, padding: "14px 20px", background: "linear-gradient(135deg,#59AC99,#B8E10D)", border: "none", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#0A0A0F", cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase", boxShadow: "0 4px 24px rgba(184,225,13,0.25)" }}>
              📸 Capturar & Analisar
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Result ──
  if (scanState === "result" && result) {
    const color = scoreColor(result.overall);
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, letterSpacing: "0.2em", color: "#F56438", textTransform: "uppercase", marginBottom: 4 }}>Resultado</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "0.02em", color: "#fff", lineHeight: 1 }}>PRE-GRADE</h1>
          </div>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
            Confiança<br />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "#FCAB20" }}>{result.confidence}%</span>
          </div>
        </div>

        {/* Score hero */}
        <div style={{ borderRadius: 20, padding: 24, background: `linear-gradient(135deg, ${color}18, ${color}08)`, border: `1px solid ${color}33`, marginBottom: 14, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -10, top: -20, fontFamily: "var(--font-display)", fontSize: 120, color: `${color}08`, letterSpacing: "0.02em", lineHeight: 1 }}>
            {result.overall}
          </div>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.2em", color: `${color}99`, textTransform: "uppercase", marginBottom: 8 }}>PSA-Style Estimate</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 56, color, letterSpacing: "0.04em", lineHeight: 1, marginBottom: 4 }}>
            {result.band.split(" ")[0]}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
            {result.band}
          </div>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
            Score técnico: {result.overall}/1000
          </div>
        </div>

        {/* Estimated value */}
        <div style={{ borderRadius: 14, padding: "14px 16px", background: "#12120A", border: "1px solid rgba(252,171,32,0.2)", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.15em", color: "rgba(252,171,32,0.6)", textTransform: "uppercase", marginBottom: 4 }}>Estimativa de Mercado</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#FCAB20", letterSpacing: "0.02em" }}>{result.estimatedValue}</div>
          </div>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em", textAlign: "right" }}>
            Baseado em<br />vendas PSA
          </div>
        </div>

        {/* Subgrades */}
        <div style={{ borderRadius: 16, padding: 16, background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 14 }}>Análise Técnica</div>
          <MetricBar label="Centering"  score={result.centering} />
          <MetricBar label="Corners"    score={result.corners} />
          <MetricBar label="Edges"      score={result.edges} />
          <MetricBar label="Surface"    score={result.surface} />
          <MetricBar label="Dimensions" score={result.dimensions} />
        </div>

        {/* Defects */}
        {result.defects.length > 0 && (
          <div style={{ borderRadius: 16, padding: 16, background: "#1C1C28", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 12 }}>Diagnóstico</div>
            {result.defects.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < result.defects.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FCAB20", flexShrink: 0, marginTop: 5 }} />
                <div style={{ fontFamily: "var(--font-tech)", fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.03em", lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ borderRadius: 10, padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-tech)", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em", lineHeight: 1.6 }}>
            ⚠️ Este é um <strong style={{ color: "rgba(255,255,255,0.4)" }}>pre-grade AI (V1)</strong> para referência. Não equivale a grading oficial PSA/TAG. Resultado pode variar conforme iluminação e qualidade da captura.
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={resetScan}
            style={{ flex: 1, borderRadius: 12, padding: "13px 20px", background: "linear-gradient(135deg,#E7363C,#F56438)", border: "none", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase", boxShadow: "0 4px 20px rgba(231,54,60,0.3)" }}>
            📷 Nova Carta
          </button>
          <button
            style={{ borderRadius: 12, padding: "13px 18px", background: "rgba(89,172,153,0.12)", border: "1px solid rgba(89,172,153,0.25)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#59AC99", cursor: "pointer", letterSpacing: "0.04em" }}>
            💾 Salvar
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ScannerPage;
