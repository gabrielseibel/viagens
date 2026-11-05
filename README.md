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

### Coordenadas e tempos de viagem (seed data)

Este ambiente de desenvolvimento não tem acesso a uma chave da OpenRouteService nem à internet aberta, então:

- As coordenadas (`lat`/`lng`) em `data/destinations.json` foram preenchidas manualmente com valores aproximados e conhecidos das cidades, só para o app funcionar de ponta a ponta.
- Os tempos/distâncias em `data/travel-times/chapeco-sc.json` são **estimativas**, não vieram da ORS Matrix API. Foram calibradas a partir de 8 rotas reais conferidas no Google Maps (Florianópolis, Foz do Iguaçu, Gramado, Uruguaiana, Piratuba, Cascavel, Curitiba e Porto Alegre) — os destinos que batem exatamente com essas 8 rotas usam o valor real; os outros 12 foram estimados por interpolação (velocidade média da rota mais próxima calibrada), então ainda podem ter erro de 10–20%.

## Regra de dias × tempo de estrada

Configurável em `config/rules.ts`:

| Dias  | Tempo máximo sugerido (só ida) |
|-------|--------------------------------|
| 2     | 3h                             |
| 3     | 5h                             |
| 4–5   | 7h                             |
| 6–7   | 10h                            |
| 8–14  | 12h                             |
| 15    | 16h                             |

O slider de "tempo máximo de estrada" permite ajustar manualmente até 18h, pra dar espaço a destinos mais distantes (ex.: cidades de fronteira no Uruguai) mesmo fora da sugestão automática.

Índice de estrada (`horasNaEstrada / horasDisponíveis`, com 10h úteis por dia):

- até 20% → **Leve**
- 20–35% → **Aceitável**
- acima de 35% → **Pesado**

## Fora do escopo desta fase

Ônibus, combustível/pedágio, passagens aéreas, roteiros multi-parada, login/contas, afiliados e anúncios (campo `affiliateLinks` já reservado nos destinos, mas vazio).
