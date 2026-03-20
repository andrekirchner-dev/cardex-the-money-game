
# CardeX - Card Collection App

Recriar fielmente o app CardeX como uma aplicação React, mantendo exatamente o mesmo design, animações e funcionalidade do HTML/CSS original.

## Estrutura

### Layout Principal
- **Shell do telefone** (390x844px) com bordas arredondadas, notch, e sombras
- **Splash screen** animada com logo, barras coloridas e barra de progresso
- **Navegação inferior** com 5 abas: Home, Market, Scanner, Trade, Profile
- Sistema de páginas com transições suaves

### Páginas

1. **Home** - Hero card com valor do portfólio, estatísticas (cards, sets, graded, value), seção de coleção recente com itens listados e badges de preço/variação

2. **Market** - Barra de busca, filtros em pills (All, Pokémon, Yu-Gi-Oh, etc.), grid de cards 2x2 com thumbnails, nomes, marcas e preços

3. **Scanner** - Interface estilo scanner com cantos, linha de scan animada, crosshair, anel de grade com nota, métricas de condição (Centering, Edges, Surface, Corners) com barras de progresso, diagnóstico

4. **Trade** - Seletores de cards para comparação, cards de trade com emoji/preço, barra VS, veredito de trade (favorável/desfavorável)

5. **Profile** - Avatar, nome, role, banner do plano (Pro Collector), informações do plano, configurações

### Design System
- Todas as cores, fontes (Bebas Neue, Space Mono, Share Tech Mono), variáveis CSS e animações do original
- Componentes: badges (green/red/gold), botões (fire/ghost/teal), LCD boxes, cards, rows
- Efeitos: gradientes, backdrop blur, scan lines, pulse animations

### Dados
- Dados mockados para cards, preços e coleção embutidos no código
