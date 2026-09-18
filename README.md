# Organizador de Viagens

Responde a uma pergunta simples: **"Saio daqui, tenho N dias. Para onde faz sentido ir?"**

Cruza tempo de deslocamento com dias disponíveis, mostrando de forma visual se uma viagem cabe (ou não) no tempo que você tem.

Fase 1 (MVP de estrada): origem fixa em Chapecó/SC, dados em arquivos JSON, sem banco de dados e sem login. Veja o plano completo no início desta conversa/histórico do projeto para os detalhes de produto.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- react-leaflet + OpenStreetMap (mapa)
- Dados em `data/*.json` (sem banco de dados)
- OpenRouteService (ORS) usado só em scripts locais de pré-cálculo — a aplicação nunca chama a API em tempo real
- html-to-image para gerar o card de compartilhamento em PNG

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

`npm run build` gera um export estático em `out/` (o site não usa nenhuma API em tempo de execução, então roda inteiro como arquivos estáticos). `npm run start` serve esse `out/` localmente com o pacote `serve`, pra conferir o build de produção antes de publicar.

## Deploy no GitHub Pages

O site já está configurado como export estático (`output: "export"`) e todo o estado que antes rodava no servidor (filtros, seletor de dias, índice de estrada) roda no navegador — não depende de nenhum servidor Next.js em produção.

1. No GitHub, vá em **Settings → Pages** do repositório e defina **Source: GitHub Actions** (só precisa fazer isso uma vez).
2. Dê merge/push para a branch `main`. O workflow `.github/workflows/deploy-pages.yml` builda o site com `GITHUB_PAGES=true` (isso ativa o `basePath`/`assetPrefix` `/viagens`, necessário porque GitHub Pages de projeto serve em `usuario.github.io/viagens/`) e publica automaticamente.
3. O site fica em `https://<seu-usuário>.github.io/viagens/`.

Se o nome do repositório mudar, atualize o `basePath` em `next.config.ts`.

## Estrutura de dados

- `data/destinations.json` — base de destinos (nome, tipos, melhor época, dias ideais, custo, destaques etc.)
- `data/origins.json` — pontos de saída (hoje só Chapecó/SC)
- `data/travel-times/<origin-id>.json` — tempo (min) e distância (km) de carro da origem até cada destino

### Coordenadas e tempos de viagem (seed data)

Este ambiente de desenvolvimento não tem acesso a uma chave da OpenRouteService nem à internet aberta, então:

- As coordenadas (`lat`/`lng`) em `data/destinations.json` foram preenchidas manualmente com valores aproximados e conhecidos das cidades, só para o app funcionar de ponta a ponta.
- Os tempos/distâncias em `data/travel-times/chapeco-sc.json` são **estimativas** baseadas em conhecimento geral de estradas da região, não vieram da ORS Matrix API.

Para gerar os valores reais e precisos:

1. Copie `.env.local.example` para `.env.local` e preencha `ORS_API_KEY` com uma chave gratuita da [OpenRouteService](https://openrouteservice.org/dev/#/signup).
2. Para recalcular as coordenadas de um destino, zere `lat`/`lng` dele em `data/destinations.json` (o script não sobrescreve coordenadas já preenchidas) e rode:
   ```bash
   npm run geocode
   ```
3. Para recalcular os tempos de viagem a partir de uma origem:
   ```bash
   npm run compute-times -- chapeco-sc
   ```
   Isso sobrescreve `data/travel-times/chapeco-sc.json` com os valores oficiais da ORS Matrix API.

Nenhuma chamada à ORS acontece durante o uso normal do site — só ao rodar esses scripts manualmente.

## Regra de dias × tempo de estrada

Configurável em `config/rules.ts`:

| Dias | Tempo máximo sugerido (só ida) |
|------|--------------------------------|
| 2    | 3h                             |
| 3    | 5h                             |
| 4–5  | 7h                             |
| 6–7  | 10h                            |
| 8+   | 12h                             |

Índice de estrada (`horasNaEstrada / horasDisponíveis`, com 10h úteis por dia):

- até 20% → **Leve**
- 20–35% → **Aceitável**
- acima de 35% → **Pesado**

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` / `npm run start` — build e servidor de produção
- `npm run lint` — ESLint
- `npm run geocode` — preenche coordenadas dos destinos via ORS Geocoding (requer `ORS_API_KEY`)
- `npm run compute-times -- <origin-id>` — calcula tempos/distâncias via ORS Matrix API (requer `ORS_API_KEY`)

## Fora do escopo desta fase

Ônibus, combustível/pedágio, passagens aéreas, roteiros multi-parada, login/contas, afiliados e anúncios (campo `affiliateLinks` já reservado nos destinos, mas vazio).
