# PocketMarket — Frontend

Interface web do marketplace de cartas Pokémon TCG.

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
│   └── shared/          # Componentes reutilizáveis em várias páginas
│       ├── Navbar.jsx          # Barra de navegação (estados: logado / deslogado)
│       ├── CardItem.jsx        # Card individual com imagem, nome, preço e botões
│       ├── CardDetailModal.jsx # Modal de detalhe ao clicar em uma carta
│       └── SearchBar.jsx       # Barra de busca + filtro de raridade
│
├── context/
│   └── AuthContext.jsx  # Gerencia o usuário logado e o token JWT globalmente
│                        # Qualquer componente pode saber se o usuário está logado
│
├── mock/
│   └── cards.js         # Dados fictícios de cartas, coleção e favoritos
│                        # Usado enquanto a API ainda não está integrada
│                        # Quando a API estiver pronta, basta remover as importações deste arquivo
│
├── pages/
│   ├── HomePage.jsx        # Página principal: hero banner + grid de cartas com busca e filtro
│   ├── LoginPage.jsx       # Tela de login
│   ├── RegisterPage.jsx    # Tela de cadastro
│   ├── CollectionPage.jsx  # Minha coleção: lista cartas adicionadas + valor total
│   └── FavoritesPage.jsx   # Favoritos: cartas marcadas com coração + badge "In Collection"
│
├── services/
│   └── api.js           # Instância do Axios configurada com a URL base da API
│                        # Injeta o token JWT automaticamente em todas as requisições
│
├── App.jsx              # Configuração das rotas do projeto
├── main.jsx             # Ponto de entrada da aplicação
└── index.css            # Estilos globais e importação do Tailwind
```

---

## Páginas e Rotas

| Rota          | Página         | Acesso      |
| ------------- | -------------- | ----------- |
| `/`           | HomePage       | Público     |
| `/login`      | LoginPage      | Público     |
| `/register`   | RegisterPage   | Público     |
| `/collection` | CollectionPage | Autenticado |
| `/favorites`  | FavoritesPage  | Autenticado |

---

## Como integrar com a API

O projeto está rodando com **mock data** enquanto o backend está em desenvolvimento.

Quando a API estiver pronta, procure pelos comentários `// TODO` nos arquivos de páginas — eles indicam exatamente onde substituir o mock pela chamada real.

Exemplo em `LoginPage.jsx`:

```js
// TODO: trocar pelo POST /api/v1/auth/login quando a API estiver pronta
if (email && password) {
  login({ name: "Ash Ketchum", email }, "mock-jwt-token");
}
```

Vira:

```js
const response = await api.post("/auth/login", { email, password });
login(response.data.user, response.data.token);
```

A URL base da API está configurada em `src/services/api.js`:

```js
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});
```

---

## Padrão de branches

Seguir o mesmo padrão do backend:

```
feat/nome-da-feature
```

Exemplos:

```
feat/sales-module
feat/auction-page
feat/trade-module
```
