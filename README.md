# PocketMarket — Frontend

Interface web do marketplace de cartas Pokémon TCG.

## Repositórios

|          | Link                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| Frontend | _(este repositório)_                                                                               |
| API      | <!-- [https://github.com/org/pocketmarket-api](https://github.com/ViniciusS4ntos/PocketMarket) --> |
| Deploy   | <!-- https://pocketmarket.vercel.app -->                                                           |

---

## Stack

| Ferramenta   | Função                   |
| ------------ | ------------------------ |
| React + Vite | Framework e bundler      |
| Tailwind CSS | Estilização              |
| React Router | Navegação entre páginas  |
| Axios        | Chamadas HTTP para a API |
| Lucide React | Ícones                   |

---

## Como rodar

**Requisitos:** Node.js v18 ou superior

```bash
# 1. Entrar na pasta do projeto
cd pocketmarket-frontend

# 2. Instalar dependências
npm install

# 3. Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

---

## Estrutura de Pastas

```
src/
├── components/
│   └── shared/                   # Componentes reutilizáveis em várias páginas
│       ├── AddCardModal.jsx       # Modal de 3 passos para adicionar carta à coleção
│       ├── AddCreditModal.jsx     # Modal para adicionar créditos à conta
│       ├── AuctionTimer.jsx       # Countdown para leilões ativos
│       ├── CardDetailModal.jsx    # Modal de detalhe ao clicar em uma carta
│       ├── CardItem.jsx           # Card individual com imagem, nome, preço e botões
│       ├── ConfirmationModal.jsx  # Modal genérico de confirmação / erro
│       ├── ListingModal.jsx       # Modal para anunciar carta (venda ou leilão)
│       ├── Navbar.jsx             # Barra de navegação com saldo de créditos
│       ├── SearchBar.jsx          # Barra de busca com filtros
│       └── TradeModal.jsx         # Modal para propor troca comercial
│
├── context/
│   ├── AuthContext.jsx      # Gerencia usuário logado e token JWT globalmente
│   ├── LanguageContext.jsx  # Internacionalização (PT / EN) com função t()
│   └── ThemeContext.jsx     # Alternância dark / light mode
│
├── hooks/
│   └── useDebounce.js       # Hook para debounce de inputs de busca
│
├── mock/                    # Dados fictícios remanescentes (em remoção progressiva)
│
├── pages/
│   ├── Collection/
│   │   ├── AllUserCards.jsx    # Listagem pública de cartas de todos os usuários
│   │   ├── CatalogSearch.jsx   # Busca no catálogo oficial para adicionar cartas
│   │   ├── CollectionPage.jsx  # Container com abas: Coleção / Catálogo / Todas as cartas
│   │   └── MyCollection.jsx    # Cartas do usuário com opções de anunciar e remover
│   ├── FavoritesPage.jsx       # Cartas favoritadas pelo usuário
│   ├── HomePage.jsx            # Marketplace: listagens de venda e leilões
│   ├── LoginPage.jsx           # Tela de login
│   ├── MyListingsPage.jsx      # Anúncios ativos do usuário com opção de cancelar
│   ├── RegisterPage.jsx        # Tela de cadastro
│   └── TradesPage.jsx          # Trocas enviadas, recebidas e histórico de compras
│
└── services/
    ├── api.js                # Instância do Axios com interceptor JWT
    ├── catalogService.js     # Chamadas ao catálogo de cartas
    └── collectionService.js  # Upload de imagem, criação de userCard e coleção
```

---

## Páginas e Rotas

| Rota           | Página         | Acesso      |
| -------------- | -------------- | ----------- |
| `/`            | HomePage       | Público     |
| `/login`       | LoginPage      | Público     |
| `/register`    | RegisterPage   | Público     |
| `/collection`  | CollectionPage | Autenticado |
| `/favorites`   | FavoritesPage  | Autenticado |
| `/my-listings` | MyListingsPage | Autenticado |
| `/trades`      | TradesPage     | Autenticado |

---

## Autenticação

O token JWT é salvo no `localStorage` sem o prefixo `"Bearer "`. O interceptor do Axios monta o header automaticamente em todas as requisições autenticadas:

```js
// src/services/api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

A URL base da API está configurada em `src/services/api.js`:

```js
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});
```

---

## Internacionalização

O projeto suporta PT e EN via `LanguageContext`. Para usar em qualquer componente:

```js
const { t } = useLanguage();

// Texto simples
t("common.cancel");

// Com interpolação
t("tradeModal.sentMessage", { offered: "Charizard", requested: "Pikachu" });
```

Todas as strings ficam centralizadas em `src/context/LanguageContext.jsx`.

---

## Padrão de branches

```
feat/nome-da-feature
fix/nome-do-bug
```

Exemplos:

```
feat/trade-module
feat/auction-page
fix/remove-card-constraint
```
