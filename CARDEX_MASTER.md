# 🃏 CarDex — The Money Game
**Segundo Cérebro · Obsidian Master File**
*Última atualização: Abril 2026 | Status: Alpha — fase uso-teste*

---

## 🧠 Visão Geral

**CarDex** é um **TCG Collection Manager** mobile-first construído para colecionadores sérios de cartas (Pokémon, Magic, One Piece, Yu-Gi-Oh, Lorcana e esportivas). O diferencial central é a combinação de rastreamento de portfólio com **pre-grading por IA**, integrações de mercado em tempo real e uma UX de nível premium — tudo no browser nativo do celular, sem app store.

> **Tagline:** "Gerencie sua coleção como um portfólio financeiro."

---

## 🎯 Diferenciais Competitivos

| Diferencial | Descrição |
|---|---|
| **AI Pre-Grading** | Motor de avaliação de cartas usando câmera + LiDAR do celular, com score técnico nos 5 eixos (PSA-style) |
| **Portfolio View** | Valor total em USD/BRL, histórico, graded%, ROI estimado |
| **Multi-TCG** | Pokémon, Magic, One Piece, Yu-Gi-Oh, Lorcana, esportivas — mesmo app |
| **Firebase Real-Time** | Dados do usuário sincronizados e seguros — não é local storage |
| **PWA-ready** | Funciona no browser nativo sem precisar de App Store |
| **Scanner LiDAR** | Detecção de warp, corner lift e espessura quando dispositivo tem LiDAR |
| **Mercado ao Vivo** | APIs de Pokémon TCG, Scryfall, YGOPRODeck, MercadoLivre integradas |
| **Admin Panel** | Gestão de usuários, KPIs e sistema — acesso restrito por email |

---

## 🏗 Arquitetura Técnica

### Stack
```
Frontend:   React 18 + TypeScript + Vite
Styling:    Tailwind CSS + shadcn/ui + CSS Variables (fontes custom)
State:      React Hooks + TanStack Query (React Query)
Auth:       Firebase Authentication (Email/Password + Google OAuth)
Database:   Cloud Firestore (NoSQL, produção)
Storage:    Firebase Storage
Hosting:    Vercel (auto-deploy via GitHub)
Repo:       github.com/andrekirchner-dev/cardex-the-money-game
URL:        cardex-tcg.vercel.app
```

### Estrutura de dados — Firestore
```
users/{uid}
  ├── displayName: string
  ├── email: string
  ├── photoURL?: string
  ├── plan: "free" | "pro"
  ├── memberSince: string (ano)
  ├── collection/{docId}
  │     ├── cardId, name, game, setName, rarity
  │     ├── imageUrl, purchasePrice, currentPrice, currency
  │     ├── isGraded, gradeCompany, gradeScore
  │     └── addedAt: Timestamp
  ├── wishlist/{docId}
  │     ├── cardId, name, game, setName
  │     ├── imageUrl, targetPrice, currency
  │     └── addedAt: Timestamp
  └── trades/{docId}
        ├── type: "buy" | "sell" | "trade"
        ├── cardName, game, price, currency
        ├── counterparty, platform, notes
        └── tradedAt: Timestamp
```

### Segurança — Firestore Rules
```javascript
// Admin (kirchner.andre@gmail.com) → acesso total
// Usuários → apenas dados próprios
function isAdmin() {
  return request.auth.token.email == 'kirchner.andre@gmail.com';
}
match /users/{userId}/{document=**} {
  allow read, write: if request.auth.uid == userId || isAdmin();
}
```

---

## 📱 Páginas do App

| Página | Rota | Status |
|---|---|---|
| **Home** | `home` | ✅ — stats reais, empty state, market spotlight |
| **Card Index** | `index` | ⚠️ — browse por TCG (UI pronta, busca pendente) |
| **Scanner** | `scanner` | ✅ — câmera real + LiDAR + pre-grade V1 |
| **Trades** | `trade` | ⚠️ — UI pronta, integração Firestore pendente |
| **Profile** | `profile` | ✅ — dados reais Firebase, stats ao vivo |
| **Card Library** | `card-library` | ⚠️ — visualização da coleção, filtros pendentes |
| **Graded Library** | `graded-library` | ⚠️ — cartas graduadas, filtro isGraded |
| **Trades History** | `trades-history` | ⚠️ — histórico, pendente Firestore |
| **Wishlist** | `wishlist` | ✅ — busca + add + remove Firestore |
| **Settings** | `settings` | ❌ — UI placeholder |
| **Admin Panel** | `admin` | ✅ — KPIs, users, system, plan management |
| **Login** | — | ✅ — email/senha + Google |

---

## 🔌 APIs Integradas

| API | Jogo | Endpoint | Status |
|---|---|---|---|
| Pokémon TCG API | Pokémon | `api.pokemontcg.io/v2` | ✅ ativo |
| Scryfall | Magic: The Gathering | `api.scryfall.com` | 🔧 configurado |
| YGOPRODeck | Yu-Gi-Oh | `db.ygoprodeck.com/api/v7` | 🔧 configurado |
| TCGDex | Multi-TCG | `api.tcgdex.net` | 🔧 configurado |
| MercadoLivre | Preços BR | `api.mercadolibre.com` | 🔧 configurado |

---

## 💳 Planos (Draft)

### Free
- Coleção ilimitada (básica)
- Busca de cartas
- Wishlist (até 20 itens)
- Scanner básico (sem LiDAR)
- 10 scans/mês

### Pro — R$ 29,90/mês ou R$ 249/ano
- Tudo do Free
- Scanner ilimitado + LiDAR
- Pre-grading com relatório detalhado
- Histórico de trades completo
- Análise de ROI da coleção
- Export PDF/CSV
- Prioridade em features novas

### Enterprise (futuro)
- Multi-usuário (loja/dealer)
- API própria
- Grading em lote

---

## 🎨 Design System

### Fontes (CSS Variables)
```css
--font-display: /* display bold — títulos grandes */
--font-mono:    /* monospaced — valores, badges */
--font-tech:    /* tech/caps — labels, rótulos */
```

### Cores principais
| Token | Hex | Uso |
|---|---|---|
| Vermelho | `#E7363C` | CTA primário, alerta, admin |
| Laranja | `#F56438` | Gradientes, accent |
| Âmbar | `#FCAB20` | Nav ativo, PRO badge, highlights |
| Verde LiDAR | `#B8E10D` | Scanner, grading |
| Verde menta | `#59AC99` | Online, sucesso |
| Dark base | `#0A0A0F` | Background |
| Card dark | `#1C1C28` | Superfícies |
| Sidebar | `#0D0D14` | Drawer nav |

### Componentes ativos
- `DrawerNav` — sidebar retráctil desktop + drawer mobile
- `BottomNav` — mobile apenas (lg:hidden)
- `LoginPage` — email/Google auth
- `SplashScreen` — abertura animada
- `CardDetailModal` — detalhe de carta
- `AdminPage` — 3 abas (Dashboard, Users, System)

---

## 🔐 Autenticação

| Método | Status |
|---|---|
| Email + Senha | ✅ |
| Google OAuth | ✅ |
| Domínio autorizado | ✅ cardex-tcg.vercel.app |

**Admin:** `kirchner.andre@gmail.com` → acesso total ao Firestore + Admin Panel

---

## 🤖 CARDEX VISION™ — Motor de Pre-Grading

Baseado no preset **TCG_PreGrading_Skill** (5 eixos técnicos):

### 5 Pilares de Avaliação
| Pilar | Peso | O que analisa |
|---|---|---|
| **Surface** | 27% | Scratches, dents, print lines, stains, creases |
| **Corners** | 23% | Whitening, fray, bend, sharpness |
| **Centering** | 22% | Razão L/R e T/B frente e verso |
| **Edges** | 20% | Whitening, chips, notches, irregularidade |
| **Dimensions** | 8% | Warp, corner lift, trim suspicion (LiDAR) |

### Score → Grade Band
```
985–1000  → 10 Pristine
950–984   → 10 Gem Mint
900–949   → 9 Mint
850–899   → 8 NM-MT
780–849   → 7 Near Mint
680–779   → 6 EX-MT
580–679   → 5 EX
< 580     → Damaged
```

### Roadmap do Scanner
- **V1** (atual): Câmera real + LiDAR detection + score heurístico
- **V2**: Análise CV real (Canvas API + WebGL), multi-ângulo, grade caps
- **V3**: Modelo treinado com cartas slabadas, LiDAR warp real, trim detection

---

## 🗺 Diagnóstico End-to-End (Abril 2026)

### ✅ O que está funcionando
- Auth completa (email + Google + logout)
- Firestore CRUD (collection, wishlist, trades)
- Admin Panel completo com gestão de usuários
- Login gate (sem conta → LoginPage)
- Scanner com câmera real + LiDAR detection
- Drawer nav responsivo (desktop sidebar + mobile drawer)
- Deploy automático Vercel via GitHub push
- Variáveis de ambiente no Vercel

### ⚠️ Funcional mas incompleto
- **CardLibraryPage** — mostra coleção, mas sem filtros/busca
- **TradePage** — UI ok, não salva no Firestore ainda
- **TradesHistoryPage** — UI ok, não lê do Firestore ainda
- **SettingsPage** — placeholder vazio
- **IndexPage** — browse geral, busca pendente
- **Scanner V1** — score é heurístico (não CV real)

### ❌ Não implementado
- Export de coleção (PDF/CSV)
- Push notifications
- Modo offline (PWA cache)
- Pagamentos (Stripe/AbsoluteBank)
- Onboarding flow
- Share de coleção (perfil público)

---

## 📋 Plano Estratégico — Fase Uso-Teste (Beta Mobile)

### 🎯 Objetivo
Entrar em fase de uso-teste no browser nativo do celular com as funcionalidades core 100% funcionais.

---

### Sprint 1 — Core Completo (1–2 semanas)
**Meta:** Todo fluxo principal funcionando ponta a ponta

| Tarefa | Prioridade | Arquivo |
|---|---|---|
| Conectar TradePage ao Firestore | 🔴 Alta | `TradePage.tsx` |
| Conectar TradesHistoryPage ao Firestore | 🔴 Alta | `TradesHistoryPage.tsx` |
| CardLibraryPage: filtros + busca na coleção | 🔴 Alta | `CardLibraryPage.tsx` |
| GradedLibraryPage: filtrar por `isGraded` | 🟡 Média | `GradedLibraryPage.tsx` |
| Botão "+ Add Card" funcional no Home | 🔴 Alta | `HomePage.tsx` |
| Modal de adicionar carta à coleção | 🔴 Alta | novo `AddCardModal.tsx` |
| SettingsPage: toggle tema, notificações | 🟡 Média | `SettingsPage.tsx` |

---

### Sprint 2 — Scanner V2 + PWA (2–3 semanas)
**Meta:** Scanner com análise real + app instalável

| Tarefa | Prioridade |
|---|---|
| Scanner V2: Canvas API para análise real de centering | 🔴 Alta |
| Detecção de bordas via WebGL / edge detection | 🔴 Alta |
| Multi-captura (difuso + rasante L + rasante R) | 🟡 Média |
| Grade caps engine no frontend | 🟡 Média |
| Salvar resultado de scan na coleção | 🔴 Alta |
| PWA manifest + service worker | 🔴 Alta |
| Ícone do app + splash nativo | 🔴 Alta |
| "Adicionar à tela inicial" onboarding | 🟡 Média |

---

### Sprint 3 — Monetização + Polimento (3–4 semanas)
**Meta:** App pronto para primeiros pagamentos

| Tarefa | Prioridade |
|---|---|
| Implementar planos Free/Pro no app | 🔴 Alta |
| Gate de features por plano | 🔴 Alta |
| Integração Stripe (pagamento) | 🔴 Alta |
| Onboarding flow (3 telas) | 🟡 Média |
| Export PDF da coleção | 🟡 Média |
| Perfil público / share link | 🟢 Baixa |
| Analytics Firebase (eventos chave) | 🟡 Média |
| Push notifications (wishlist price alert) | 🟢 Baixa |

---

### KPIs para declarar "pronto para teste"
- [ ] Usuário consegue criar conta, adicionar carta, ver no portfólio
- [ ] Scanner funciona no iPhone/Android sem crash
- [ ] Pre-grade gera resultado em < 5s
- [ ] App abre como PWA na tela inicial
- [ ] Admin consegue ver todos os usuários no painel
- [ ] Tempo de carregamento inicial < 3s em 4G

---

## 🛠 Comandos de Desenvolvimento

```bash
# Iniciar dev local
cd ~/cardex-the-money-game
npm run dev

# Build + preview
npm run build
npm run preview

# Deploy (automático via push)
git push origin main

# Instalar deps
npm install

# Verificar vulnerabilidades (não críticas em prod)
npm audit
```

---

## 🔑 Variáveis de Ambiente

```env
VITE_FIREBASE_API_KEY=AIzaSyCnNs8FrpyUYHr5GTJHp9QV94IhSgrvNog
VITE_FIREBASE_AUTH_DOMAIN=cardex-the-money-game.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cardex-the-money-game
VITE_FIREBASE_STORAGE_BUCKET=cardex-the-money-game.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=772731340552
VITE_FIREBASE_APP_ID=1:772731340552:web:57aebb3432858b48c7cebd
VITE_FIREBASE_MEASUREMENT_ID=G-RLLKTJH54T
```
> ⚠️ Nunca commitar o `.env` — está no `.gitignore`

---

## 📁 Estrutura de Arquivos

```
src/
├── components/cardex/
│   ├── DrawerNav.tsx         ← nav principal (drawer + sidebar desktop)
│   ├── BottomNav.tsx         ← mobile only (lg:hidden)
│   ├── LoginPage.tsx         ← auth gate
│   ├── SplashScreen.tsx      ← abertura
│   ├── CardDetailModal.tsx   ← modal de carta
│   ├── PhoneShell.tsx        ← deprecated (não usar)
│   └── pages/
│       ├── HomePage.tsx      ← portfólio + empty state
│       ├── IndexPage.tsx     ← browse geral
│       ├── ScannerPage.tsx   ← câmera + LiDAR + pre-grade
│       ├── TradePage.tsx     ← registro de trades
│       ├── ProfilePage.tsx   ← perfil real Firebase
│       ├── SettingsPage.tsx  ← configurações
│       ├── CardLibraryPage.tsx
│       ├── GradedLibraryPage.tsx
│       ├── TradesHistoryPage.tsx
│       ├── WishlistPage.tsx  ← wishlist Firestore
│       └── AdminPage.tsx     ← admin panel
├── hooks/
│   ├── useAuth.ts            ← Firebase Auth
│   ├── useFirestore.ts       ← collection, wishlist, trades
│   ├── useAdmin.ts           ← admin data + isAdminEmail
│   ├── useCardSearch.ts      ← APIs de busca
│   └── useDebounce.ts
├── lib/
│   ├── firebase.ts           ← init Firebase
│   ├── firestore.ts          ← CRUD Firestore
│   └── api.ts                ← TCG APIs
└── pages/
    ├── Index.tsx             ← layout principal + routing
    └── NotFound.tsx
```

---

## 🤝 Decisões de Produto

| Decisão | Razão |
|---|---|
| Browser-first (não App Store) | Zero fricção, atualização imediata, sem review Apple/Google |
| Firestore (não SQL) | Escalabilidade, real-time, sem servidor |
| Multi-TCG desde V1 | Mercado maior, diferencial vs. apps de nicho |
| LiDAR quando disponível | iPhone Pro diferencial — warp detection real |
| Admin por email (não role) | Simplicidade V1 — migrar para custom claims em V2 |
| Score 0–1000 (não 1–10) | Granularidade maior, alinhado com metodologia técnica |

---

*Criado por Xavier Kirchner com Claude (Anthropic) via Cowork · Abril 2026*
*Para uso interno — segundo cérebro Obsidian*
